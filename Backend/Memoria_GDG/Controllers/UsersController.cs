using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Memoria_GDG;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Memoria_GDG.Dtos;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Memoria_GDG.Hubs;

namespace Memoria_GDG.Controllers
{
    [ApiController]
    [Route("users")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly IHubContext<ChatHub> _hubContext;

        public UsersController(AppDbContext context, UserManager<User> userManager, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _userManager = userManager;
            _hubContext = hubContext;
        }

        // GET /users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET /users/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            return user;
        }

        // GET /users/username/{username}
        [HttpGet("username/{username}")]
        public async Task<IActionResult> GetUserByUsername(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == username);
            if (user == null) return NotFound();

            // Return only public info
            return Ok(new {
                id = user.Id,
                username = user.UserName,
                firstName = user.FirstName,
                lastName = user.LastName,
                bio = user.Bio,
                profilePictureUrl = user.ProfilePictureUrl,
                coverPhotoUrl = user.CoverPhotoUrl,
                // Add more fields as needed
            });
        }

        // PUT /users/me
        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateOwnProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            // Check if username is being changed and if it's available
            if (!string.IsNullOrEmpty(dto.Username) && dto.Username != user.UserName)
            {
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.UserName == dto.Username);
                if (existingUser != null)
                {
                    return BadRequest("Username is already taken.");
                }
                user.UserName = dto.Username;
            }

            if (!string.IsNullOrEmpty(dto.Email))
            {
                var setEmailResult = await _userManager.SetEmailAsync(user, dto.Email);
                if (!setEmailResult.Succeeded)
                {
                    return BadRequest(setEmailResult.Errors);
                }
                // Ensure email is confirmed after update, if it was confirmed before.
                // If you want to force re-confirmation for email changes, remove this line.
                user.EmailConfirmed = true;
            }

            // Update other fields if provided
            if (!string.IsNullOrEmpty(dto.FirstName)) user.FirstName = dto.FirstName;
            if (!string.IsNullOrEmpty(dto.LastName)) user.LastName = dto.LastName;
            if (!string.IsNullOrEmpty(dto.Bio)) user.Bio = dto.Bio;
            
            // Update photos even if they are null (to allow deletion)
            Console.WriteLine($"[UsersController] Updating profile photo from '{user.ProfilePictureUrl}' to '{dto.ProfilePictureUrl}'");
            Console.WriteLine($"[UsersController] Updating cover photo from '{user.CoverPhotoUrl}' to '{dto.CoverPhotoUrl}'");
            
            user.ProfilePictureUrl = dto.ProfilePictureUrl ?? "";
            user.CoverPhotoUrl = dto.CoverPhotoUrl ?? "";

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                foreach (var error in updateResult.Errors)
                {
                    Console.WriteLine($"[UsersController] Update error: {error.Code} - {error.Description}");
                }
                return BadRequest(updateResult.Errors);
            }

            return NoContent();
        }

        // PUT /users/me/password
        [HttpPut("me/password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            try
            {
                Console.WriteLine("ChangePassword endpoint called");
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    Console.WriteLine("User ID not found in claims");
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    Console.WriteLine($"User not found with ID: {userId}");
                    return NotFound("User not found");
                }

                Console.WriteLine("Verifying current password...");
                var result = await _userManager.CheckPasswordAsync(user, model.CurrentPassword);
                if (!result)
                {
                    Console.WriteLine("Current password verification failed");
                    return BadRequest("Current password is incorrect");
                }

                if (model.NewPassword != model.ConfirmPassword)
                {
                    Console.WriteLine("New password and confirmation do not match");
                    return BadRequest("New password and confirmation do not match");
                }

                Console.WriteLine("Changing password...");
                var changeResult = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
                if (!changeResult.Succeeded)
                {
                    Console.WriteLine("Password change failed. Errors: " + string.Join(", ", changeResult.Errors.Select(e => e.Description)));
                    return BadRequest(changeResult.Errors);
                }

                Console.WriteLine("Password changed successfully");
                return Ok(new { message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ChangePassword: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, "An error occurred while changing the password");
            }
        }

        // GET /users/{id}/relationship
        [HttpGet("{id}/relationship")]
        [Authorize]
        public async Task<IActionResult> GetRelationship(int id)
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (currentUserId == id)
            {
                // You can't follow or friend yourself
                return Ok(new { isFollowing = false, isFriend = false, isBlocked = false, hasBlocked = false });
            }

            // Check if either user has blocked the other
            var isBlocked = await _context.Blocks.AnyAsync(b => b.BlockedId == currentUserId && b.BlockerId == id);
            var hasBlocked = await _context.Blocks.AnyAsync(b => b.BlockerId == currentUserId && b.BlockedId == id);

            // Use Follows table for isFollowing
            var isFollowing = await _context.Follows.AnyAsync(f => f.FollowerId == currentUserId && f.FollowingId == id);

            // Check if current user and target user are friends (bidirectional, accepted)
            var isFriend = await _context.Friendships.AnyAsync(f =>
                ((f.UserId == currentUserId && f.FriendId == id) ||
                 (f.UserId == id && f.FriendId == currentUserId)) && f.Accepted);

            return Ok(new { isFollowing, isFriend, isBlocked, hasBlocked });
        }

        // POST /users/{id}/follow
        [HttpPost("{id}/follow")]
        [Authorize]
        public async Task<IActionResult> FollowUser(int id)
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (currentUserId == id) return BadRequest("Cannot follow yourself.");

            var alreadyFollowing = await _context.Follows.AnyAsync(f => f.FollowerId == currentUserId && f.FollowingId == id);
            if (alreadyFollowing) return BadRequest("Already following.");

            var follow = new Follow { FollowerId = currentUserId, FollowingId = id };
            _context.Follows.Add(follow);
            await _context.SaveChangesAsync();

            var followedUser = await _context.Users.FindAsync(id);
            var follower = await _context.Users.FindAsync(currentUserId);
            if (follower == null) return NotFound("Follower not found");
            var fullName = $"{follower.FirstName ?? ""} {follower.LastName ?? ""}".Trim();
            if (string.IsNullOrWhiteSpace(fullName)) fullName = "Unknown";
            var username = follower.UserName ?? "";
            if (string.IsNullOrWhiteSpace(username)) username = "unknown";
            if (followedUser != null) {
                if (!followedUser.IsPrivate) {
                    // Public: create follow notification
                    Console.WriteLine($"[DEBUG] Creating follow notification for user {id} from follower {currentUserId}");
                    var notification = new Notification
                    {
                        Type = "follow",
                        Source = "user",
                        UserId = id,
                        SenderId = currentUserId,
                        Text = $"{fullName} (@{username}) started following you",
                        SenderAvatarUrl = follower.ProfilePictureUrl ?? string.Empty,
                        SenderFullName = fullName,
                        SenderUsername = username,
                        Read = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Notifications.Add(notification);
                    try {
                        await _context.SaveChangesAsync();
                        Console.WriteLine($"[DEBUG] Saved follow notification for user {id}");
                    } catch (Exception ex) {
                        Console.WriteLine($"[ERROR] Failed to save follow notification: {ex.Message}");
                    }
                    await _hubContext.Clients.User(id.ToString()).SendAsync("ReceiveNotification", notification);
                } else {
                    // Private: create follow request notification
                    Console.WriteLine($"[DEBUG] Creating follow request notification for user {id} from follower {currentUserId}");
                    var notification = new Notification
                    {
                        Type = "follow_request",
                        Source = "user",
                        UserId = id,
                        SenderId = currentUserId,
                        Text = $"{fullName} (@{username}) wants to follow you",
                        SenderAvatarUrl = follower.ProfilePictureUrl ?? string.Empty,
                        SenderFullName = fullName,
                        SenderUsername = username,
                        Read = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Notifications.Add(notification);
                    try {
                        await _context.SaveChangesAsync();
                        Console.WriteLine($"[DEBUG] Saved follow request notification for user {id}");
                    } catch (Exception ex) {
                        Console.WriteLine($"[ERROR] Failed to save follow request notification: {ex.Message}");
                    }
                    await _hubContext.Clients.User(id.ToString()).SendAsync("ReceiveNotification", notification);
                }
            }

            return Ok();
        }

        // DELETE /users/{id}/follow
        [HttpDelete("{id}/follow")]
        [Authorize]
        public async Task<IActionResult> UnfollowUser(int id)
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var follow = await _context.Follows.FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowingId == id);
            if (follow == null) return NotFound();
            _context.Follows.Remove(follow);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET /users/{id}/followers
        [HttpGet("{id}/followers")]
        public async Task<IActionResult> GetFollowers(int id)
        {
            var followers = await _context.Follows
                .Where(f => f.FollowingId == id)
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
            return Ok(followers);
        }

        // GET /users/{id}/following
        [HttpGet("{id}/following")]
        public async Task<IActionResult> GetFollowing(int id)
        {
            var following = await _context.Follows
                .Where(f => f.FollowerId == id)
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
            return Ok(following);
        }

        // GET /users/{id}/friends
        [HttpGet("{id}/friends")]
        public async Task<IActionResult> GetFriends(int id)
        {
            var friends = await _context.Friendships
                .Where(f => (f.UserId == id || f.FriendId == id) && f.Accepted)
                .Select(f => f.UserId == id ? f.Friend : f.User)
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
            return Ok(friends);
        }

        [HttpGet("me/follow-requests")]
        [Authorize]
        public async Task<IActionResult> GetIncomingFollowRequests()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var user = await _context.Users.FindAsync(userId);
            if (user == null || !user.IsPrivate)
                return Unauthorized("This endpoint is for private accounts only.");

            var requests = await _context.Follows
                .Include(f => f.Follower)
                .Where(f => f.FollowingId == userId && !f.Approved)
                .Select(f => new {
                    id = f.Id,
                    type = "follow",
                    text = $"{f.Follower.FirstName} {f.Follower.LastName} (@{f.Follower.UserName}) wants to follow you",
                    userId = f.FollowerId,
                    avatarUrl = f.Follower.ProfilePictureUrl,
                    read = false
                })
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPost("follow-requests/{id}/accept")]
        [Authorize]
        public async Task<IActionResult> AcceptFollowRequest(int id)
        {
            var follow = await _context.Follows.FindAsync(id);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            
            if (follow == null || follow.FollowingId != userId || follow.Approved)
                return NotFound();

            follow.Approved = true;
            await _context.SaveChangesAsync();

            // Create follow notification (for private accounts)
            var follower = await _context.Users.FindAsync(follow.FollowerId);
            var fullName = $"{follower.FirstName ?? ""} {follower.LastName ?? ""}".Trim();
            if (string.IsNullOrWhiteSpace(fullName)) fullName = "Unknown";
            var username = follower.UserName ?? "";
            if (string.IsNullOrWhiteSpace(username)) username = "unknown";
            var notification = new Notification
            {
                Type = "follow",
                Source = "user",
                UserId = userId, // the user being followed
                SenderId = follow.FollowerId,
                Text = $"{fullName} (@{username}) started following you",
                SenderAvatarUrl = follower.ProfilePictureUrl,
                SenderFullName = fullName,
                SenderUsername = username,
                Read = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            // Broadcast to the followed user
            await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", notification);

            return NoContent();
        }

        [HttpPost("follow-requests/{id}/decline")]
        [Authorize]
        public async Task<IActionResult> DeclineFollowRequest(int id)
        {
            var follow = await _context.Follows.FindAsync(id);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            
            if (follow == null || follow.FollowingId != userId || follow.Approved)
                return NotFound();

            _context.Follows.Remove(follow);
            await _context.SaveChangesAsync();
            return NoContent();
        }   


        // GET /users/suggested-friends
        [HttpGet("suggested-friends")]
        [Authorize]
        public async Task<IActionResult> GetSuggestedFriends()
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            
            // Get current user's friends
            var currentUserFriends = await _context.Friendships
                .Where(f => (f.UserId == currentUserId || f.FriendId == currentUserId) && f.Accepted)
                .Select(f => f.UserId == currentUserId ? f.FriendId : f.UserId)
                .ToListAsync();

            // Get friends of friends (excluding current user and existing friends)
            var friendsOfFriends = await _context.Friendships
                .Where(f => currentUserFriends.Contains(f.UserId) || currentUserFriends.Contains(f.FriendId))
                .Where(f => f.Accepted)
                .Select(f => f.UserId == currentUserId ? f.FriendId : f.UserId)
                .Where(id => id != currentUserId && !currentUserFriends.Contains(id))
                .ToListAsync();

            // Count mutual friends for each potential friend
            var suggestedFriendsWithCount = friendsOfFriends
                .GroupBy(id => id)
                .Select(g => new { UserId = g.Key, MutualFriendsCount = g.Count() })
                .OrderByDescending(x => x.MutualFriendsCount)
                .Take(10)
                .ToList();

            // Get user details for suggested friends
            var suggestedFriends = await _context.Users
                .Where(u => suggestedFriendsWithCount.Select(s => s.UserId).Contains(u.Id))
                .Select(u => new
                {
                    id = u.Id,
                    username = u.UserName,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    profilePictureUrl = u.ProfilePictureUrl,
                    mutualFriendsCount = suggestedFriendsWithCount.First(s => s.UserId == u.Id).MutualFriendsCount
                })
                .ToListAsync();

            return Ok(suggestedFriends);
        }

        // POST /users/{id}/block
        [HttpPost("{id}/block")]
        [Authorize]
        public async Task<IActionResult> BlockUser(int id)
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (currentUserId == id) return BadRequest("Cannot block yourself.");

            var alreadyBlocked = await _context.Blocks.AnyAsync(b => b.BlockerId == currentUserId && b.BlockedId == id);
            if (alreadyBlocked) return BadRequest("Already blocked.");

            var block = new Block { BlockerId = currentUserId, BlockedId = id };
            _context.Blocks.Add(block);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE /users/{id}/block
        [HttpDelete("{id}/block")]
        [Authorize]
        public async Task<IActionResult> UnblockUser(int id)
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var block = await _context.Blocks.FirstOrDefaultAsync(b => b.BlockerId == currentUserId && b.BlockedId == id);
            if (block == null) return NotFound();
            _context.Blocks.Remove(block);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}