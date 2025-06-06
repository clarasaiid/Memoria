using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Memoria_GDG;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Linq;
using System;

namespace Memoria_GDG.Controllers
{
    [ApiController]
    [Route("timecapsules")]
    public class TimeCapsuleController : ControllerBase
    {
        private readonly AppDbContext _context;
        public TimeCapsuleController(AppDbContext context)
        {
            _context = context;
        }

        // GET /timecapsules
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TimeCapsule>>> GetTimeCapsules()
        {
            return await _context.TimeCapsules.Include(tc => tc.Owner).ToListAsync();
        }

        // GET /timecapsules/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<TimeCapsule>> GetTimeCapsule(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var capsule = await _context.TimeCapsules
                .Include(tc => tc.Owner)
                .Include(tc => tc.Viewers)
                .FirstOrDefaultAsync(tc => tc.Id == id);
            if (capsule == null) return NotFound();
            if (capsule.OwnerId != userId &&
                !capsule.Viewers.Any(v => v.UserId == userId))
                return Forbid();
            if (DateTime.UtcNow < capsule.OpenAt && capsule.OwnerId != userId)
                return Forbid();
            return capsule;
        }

        // POST /timecapsules
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<TimeCapsule>> CreateTimeCapsule(TimeCapsule capsule, [FromQuery] List<int> viewerIds)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            capsule.OwnerId = userId;
            capsule.CreatedAt = DateTime.UtcNow;
            capsule.Viewers = viewerIds?.Select(id => new TimeCapsuleViewer { UserId = id }).ToList();
            _context.TimeCapsules.Add(capsule);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTimeCapsule), new { id = capsule.Id }, capsule);
        }

        // PUT /timecapsules/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateTimeCapsule(int id, TimeCapsule capsule, [FromQuery] List<int> viewerIds)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var existing = await _context.TimeCapsules.Include(tc => tc.Viewers).FirstOrDefaultAsync(tc => tc.Id == id);
            if (existing == null) return NotFound();
            if (existing.OwnerId != userId) return Forbid();
            existing.Title = capsule.Title;
            existing.Content = capsule.Content;
            existing.OpenAt = capsule.OpenAt;
            // Update viewers
            existing.Viewers.Clear();
            if (viewerIds != null)
                foreach (var vid in viewerIds)
                    existing.Viewers.Add(new TimeCapsuleViewer { UserId = vid, TimeCapsuleId = id });
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /timecapsules/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteTimeCapsule(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var capsule = await _context.TimeCapsules.FindAsync(id);
            if (capsule == null) return NotFound();
            if (capsule.OwnerId != userId) return Forbid();
            _context.TimeCapsules.Remove(capsule);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
