using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Memoria_GDG;
using Memoria_GDG.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace Memoria_GDG.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly AppDbContext _db;
        private readonly IPasswordHasher<User> _passwordHasher;
        private static Dictionary<string, string> PendingPasswords = new();

        public AuthController(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IConfiguration configuration,
            IEmailService emailService,
            AppDbContext db,
            IPasswordHasher<User> passwordHasher)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _emailService = emailService;
            _db = db;
            _passwordHasher = passwordHasher;
        }

        // 1. Register (store pending, send email)
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (dto.Password != dto.ConfirmPassword)
                return BadRequest("Password and confirmation do not match.");

            if (string.IsNullOrWhiteSpace(dto.Username))
                return BadRequest("Username is required.");

            if (await _userManager.FindByEmailAsync(dto.Email) != null)
                return BadRequest("Email already registered.");

            if (await _userManager.FindByNameAsync(dto.Username) != null)
                return BadRequest("Username already taken.");

            var token = Guid.NewGuid().ToString("N");
            var expiry = DateTime.UtcNow.AddHours(1);

            // Store password in memory cache, not in DB
            PendingPasswords[token] = dto.Password;

            var pending = new PendingRegistration
            {
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Birthday = dto.Birthday,
                Gender = dto.Gender,
                Bio = dto.Bio,
                Username = dto.Username,
                VerificationToken = token,
                TokenExpiry = expiry
            };

            _db.PendingRegistrations.Add(pending);
            await _db.SaveChangesAsync();

            var confirmationLink = $"http://localhost:8081/verify-email?token={token}&email={dto.Email}";
            await _emailService.SendVerificationEmailAsync(dto.Email, confirmationLink);

            return Ok("Registration started. Please check your email to verify your account.");
        }

        // 2. Confirm Email (create user, delete pending)
        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string token)
        {
            var pending = await _db.PendingRegistrations.FirstOrDefaultAsync(p => p.VerificationToken == token && p.TokenExpiry > DateTime.UtcNow);
            if (pending == null)
                return BadRequest("Invalid or expired verification link.");

            if (string.IsNullOrWhiteSpace(pending.Username))
                return BadRequest("Username is required.");

            if (await _userManager.FindByEmailAsync(pending.Email) != null)
                return BadRequest("Email already registered.");

            if (await _userManager.FindByNameAsync(pending.Username) != null)
                return BadRequest("Username already taken.");

            // Retrieve password from memory cache
            if (!PendingPasswords.TryGetValue(token, out var password))
                return BadRequest("Password not found or expired. Please register again.");

            var user = new User
            {
                UserName = pending.Username, // Always require username
                Email = pending.Email,
                FirstName = pending.FirstName,
                LastName = pending.LastName,
                Birthday = pending.Birthday,
                Gender = pending.Gender,
                Bio = pending.Bio ?? "",
                ProfilePictureUrl = "",
                CoverPhotoUrl = "",
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // Remove password from memory cache
            PendingPasswords.Remove(token);

            _db.PendingRegistrations.Remove(pending);
            await _db.SaveChangesAsync();

            // Generate JWT token for the new user
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.UserName)
            };
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var jwtToken = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiresInMinutes"])),
                signingCredentials: creds
            );
            var tokenString = new JwtSecurityTokenHandler().WriteToken(jwtToken);

            return Ok(new { token = tokenString });
        }

        // 3. Request Password Reset
        [HttpPost("request-password-reset")]
        public async Task<IActionResult> RequestPasswordReset([FromBody] string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return Ok(); // Don't reveal if email exists

            var code = new Random().Next(100000, 999999).ToString();
            var expiry = DateTime.UtcNow.AddMinutes(15);

            _db.PasswordResets.Add(new PasswordReset
            {
                Email = email,
                Code = code,
                CodeExpiry = expiry
            });
            await _db.SaveChangesAsync();

            // Send code via email
            await _emailService.SendPasswordResetCodeAsync(email, code);

            return Ok("Password reset code sent.");
        }

        // 4. Reset Password
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var reset = await _db.PasswordResets.FirstOrDefaultAsync(r => r.Email == dto.Email && r.Code == dto.Code && r.CodeExpiry > DateTime.UtcNow);
            if (reset == null)
                return BadRequest("Invalid or expired code.");

            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return BadRequest("User not found.");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            _db.PasswordResets.Remove(reset);
            await _db.SaveChangesAsync();

            return Ok("Password reset successful.");
        }

        // 5. Profile Setup
        [HttpPost("profile-setup")]
        public async Task<IActionResult> ProfileSetup([FromBody] ProfileSetupDto dto)
        {
            User user = null;
            // If authenticated, use the authenticated user
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    user = await _userManager.FindByIdAsync(userId);
                }
            }
            // If not authenticated, look up by email
            if (user == null && !string.IsNullOrEmpty(dto.Email))
            {
                user = await _userManager.FindByEmailAsync(dto.Email);
            }
            if (user == null)
                return BadRequest("User not found.");

            // Do NOT update username here anymore

            // Update optional fields
            if (!string.IsNullOrEmpty(dto.Bio)) user.Bio = dto.Bio;
            if (!string.IsNullOrEmpty(dto.ProfilePictureUrl)) user.ProfilePictureUrl = dto.ProfilePictureUrl;
            if (!string.IsNullOrEmpty(dto.CoverPhotoUrl)) user.CoverPhotoUrl = dto.CoverPhotoUrl;
            await _userManager.UpdateAsync(user);

            return Ok("Profile updated.");
        }

        // 5. Resend Verification Email
        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationDto dto)
        {
            var pending = await _db.PendingRegistrations.FirstOrDefaultAsync(p => p.Email == dto.Email);
            if (pending == null)
                return BadRequest("No pending registration found for this email.");

            // Generate new token
            var token = Guid.NewGuid().ToString("N");
            var expiry = DateTime.UtcNow.AddHours(1);

            pending.VerificationToken = token;
            pending.TokenExpiry = expiry;
            await _db.SaveChangesAsync();

            var confirmationLink = $"http://localhost:8081/verify-email?token={token}&email={dto.Email}";
            await _emailService.SendVerificationEmailAsync(dto.Email, confirmationLink);

            return Ok("Verification email resent.");
        }

        // Login endpoint
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            Console.WriteLine($"Login attempt: {dto.Email}");
            // Try to find by email first
            var user = await _userManager.FindByEmailAsync(dto.Email);
            // If not found, try by username
            if (user == null)
            {
                Console.WriteLine("User not found by email, trying username...");
                user = await _userManager.FindByNameAsync(dto.Email);
            }
            if (user == null)
            {
                Console.WriteLine("User not found by email or username.");
                return Unauthorized("Invalid email/username or password.");
            }

            var passwordOk = await _userManager.CheckPasswordAsync(user, dto.Password);
            Console.WriteLine($"Password match: {passwordOk}");
            if (!passwordOk)
            {
                Console.WriteLine("Password did not match.");
                return Unauthorized("Invalid email/username or password.");
            }

            if (!user.EmailConfirmed)
            {
                Console.WriteLine("Email not confirmed.");
                return Unauthorized("Email not confirmed.");
            }

            Console.WriteLine($"Login successful for user: {user.UserName}");
            // Generate JWT token
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.UserName)
            };
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiresInMinutes"])),
                signingCredentials: creds
            );
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            return Ok(new { token = tokenString });
        }

        // GET /auth/check-username?username=...
        [HttpGet("check-username")]
        public async Task<IActionResult> CheckUsername([FromQuery] string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            return Ok(new { available = user == null });
        }

        // GET /auth/me
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMe()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var user = await _db.Users.FindAsync(userId);

            // Followers: users who follow me
            var followers = await _db.Follows
                .Where(f => f.FollowingId == userId)
                .Select(f => f.Follower)
                .Select(u => new {
                    id = u.Id,
                    username = u.UserName,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    bio = u.Bio,
                    profilePictureUrl = u.ProfilePictureUrl,
                    coverPhotoUrl = u.CoverPhotoUrl
                })
                .ToListAsync();

            // Following: users I follow
            var following = await _db.Follows
                .Where(f => f.FollowerId == userId)
                .Select(f => f.Following)
                .Select(u => new {
                    id = u.Id,
                    username = u.UserName,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    bio = u.Bio,
                    profilePictureUrl = u.ProfilePictureUrl,
                    coverPhotoUrl = u.CoverPhotoUrl
                })
                .ToListAsync();

            // Friends: bidirectional, accepted
            var friends = await _db.Friendships
                .Where(f => (f.UserId == userId || f.FriendId == userId) && f.Accepted)
                .Select(f => f.UserId == userId ? f.Friend : f.User)
                .Select(u => new {
                    id = u.Id,
                    username = u.UserName,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    bio = u.Bio,
                    profilePictureUrl = u.ProfilePictureUrl,
                    coverPhotoUrl = u.CoverPhotoUrl
                })
                .ToListAsync();

            return Ok(new {
                profile = new {
                    id = user.Id,
                    username = user.UserName,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    bio = user.Bio,
                    profilePictureUrl = user.ProfilePictureUrl,
                    coverPhotoUrl = user.CoverPhotoUrl,
                    birthday = user.Birthday,
                    gender = user.Gender
                },
                followers,
                following,
                friends
            });
        }
    }
}