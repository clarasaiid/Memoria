using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Memoria_GDG;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System;
using System.Linq;

namespace Memoria_GDG.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public GroupsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /groups
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Group>>> GetGroups()
        {
            return await _context.Groups.Include(g => g.Owner).ToListAsync();
        }

        // GET /groups/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Group>> GetGroup(int id)
        {
            var group = await _context.Groups.Include(g => g.Owner).Include(g => g.Memberships).ThenInclude(m => m.User).FirstOrDefaultAsync(g => g.Id == id);
            if (group == null) return NotFound();
            return group;
        }

        // POST /groups
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Group>> CreateGroup(Group group)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            group.OwnerId = userId;
            group.CreatedAt = DateTime.UtcNow;
            _context.Groups.Add(group);
            await _context.SaveChangesAsync();
            // Add owner as admin member
            var membership = new GroupMembership { GroupId = group.Id, UserId = userId, Role = "Admin", JoinedAt = DateTime.UtcNow };
            _context.GroupMemberships.Add(membership);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetGroup), new { id = group.Id }, group);
        }

        // PUT /groups/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateGroup(int id, Group group)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var existing = await _context.Groups.FindAsync(id);
            if (existing == null) return NotFound();
            if (existing.OwnerId != userId) return Forbid();
            existing.Name = group.Name;
            existing.Description = group.Description;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /groups/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteGroup(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var group = await _context.Groups.FindAsync(id);
            if (group == null) return NotFound();
            if (group.OwnerId != userId) return Forbid();
            _context.Groups.Remove(group);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST /groups/{id}/join
        [HttpPost("{id}/join")]
        [Authorize]
        public async Task<IActionResult> JoinGroup(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (await _context.GroupMemberships.AnyAsync(m => m.GroupId == id && m.UserId == userId))
                return BadRequest("Already a member.");
            var membership = new GroupMembership { GroupId = id, UserId = userId, Role = "Member", JoinedAt = DateTime.UtcNow };
            _context.GroupMemberships.Add(membership);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // POST /groups/{id}/leave
        [HttpPost("{id}/leave")]
        [Authorize]
        public async Task<IActionResult> LeaveGroup(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var membership = await _context.GroupMemberships.FirstOrDefaultAsync(m => m.GroupId == id && m.UserId == userId);
            if (membership == null) return BadRequest("Not a member.");
            _context.GroupMemberships.Remove(membership);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
} 