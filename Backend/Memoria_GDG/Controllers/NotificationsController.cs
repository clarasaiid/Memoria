using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Memoria_GDG;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Memoria_GDG.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public NotificationsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /notifications
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications()
        {
            return await _context.Notifications.Include(n => n.User).ToListAsync();
        }

        // GET /notifications/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Notification>> GetNotification(int id)
        {
            var notification = await _context.Notifications.Include(n => n.User).FirstOrDefaultAsync(n => n.Id == id);
            if (notification == null) return NotFound();
            return notification;
        }

        // POST /notifications
        [HttpPost]
        public async Task<ActionResult<Notification>> CreateNotification(Notification notification)
        {
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetNotification), new { id = notification.Id }, notification);
        }

        // PUT /notifications/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNotification(int id, Notification notification)
        {
            if (id != notification.Id) return BadRequest();
            _context.Entry(notification).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Notifications.AnyAsync(n => n.Id == id).Result)
                    return NotFound();
                else
                    throw;
            }
            return NoContent();
        }

        // DELETE /notifications/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return NotFound();
            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT /notifications/{id}/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return NotFound();
            notification.Read = true;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 