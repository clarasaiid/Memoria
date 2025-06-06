using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Memoria_GDG;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Memoria_GDG.Controllers
{
    [ApiController]
    [Route("api/friend-requests")]
    public class FriendshipsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public FriendshipsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /friendships
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Friendship>>> GetFriendships()
        {
            return await _context.Friendships.Include(f => f.User).Include(f => f.Friend).ToListAsync();
        }

        // GET /friendships/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Friendship>> GetFriendship(int id)
        {
            var friendship = await _context.Friendships.Include(f => f.User).Include(f => f.Friend).FirstOrDefaultAsync(f => f.Id == id);
            if (friendship == null) return NotFound();
            return friendship;
        }

        // POST /friendships
        [HttpPost]
        public async Task<ActionResult<Friendship>> CreateFriendship(Friendship friendship)
        {
            _context.Friendships.Add(friendship);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetFriendship), new { id = friendship.Id }, friendship);
        }

        // PUT /api/friend-requests/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> HandleFriendRequest(int id, [FromBody] dynamic body)
        {
            bool accept = false;
            if (body.accept != null)
                accept = (bool)body.accept;

            var friendship = await _context.Friendships.FindAsync(id);
            if (friendship == null) return NotFound();

            // Remove notification for this friend request
            var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.Type == "friend_request" && n.UserId == friendship.FriendId && n.PostId == id);
            if (notification != null)
            {
                _context.Notifications.Remove(notification);
            }

            if (accept)
            {
                // Mark as accepted (if you have a status field, set it; otherwise, just keep the friendship)
                // Example: friendship.Status = "Accepted";
                // If you don't have a status, just keep the record
            }
            else
            {
                // Remove the friendship (reject)
                _context.Friendships.Remove(friendship);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /friendships/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFriendship(int id)
        {
            var friendship = await _context.Friendships.FindAsync(id);
            if (friendship == null) return NotFound();
            _context.Friendships.Remove(friendship);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 