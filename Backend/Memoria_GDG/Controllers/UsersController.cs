using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Memoria_GDG;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Memoria_GDG.Controllers
{
    [ApiController]
    [Route("users")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        public UsersController(AppDbContext context)
        {
            _context = context;
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
        public async Task<IActionResult> UpdateOwnProfile([FromBody] User updatedUser)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();
            // Only allow updating certain fields
            user.Bio = updatedUser.Bio;
            user.ProfilePictureUrl = updatedUser.ProfilePictureUrl;
            user.CoverPhotoUrl = updatedUser.CoverPhotoUrl;
            // You can add more fields as needed
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 