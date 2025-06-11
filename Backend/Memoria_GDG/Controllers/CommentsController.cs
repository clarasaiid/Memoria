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
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CommentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /comments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Comment>>> GetComments()
        {
            return await _context.Comments.Include(c => c.User).Include(c => c.Post).ToListAsync();
        }

        // GET /comments/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Comment>> GetComment(int id)
        {
            var comment = await _context.Comments.Include(c => c.User).Include(c => c.Post).FirstOrDefaultAsync(c => c.Id == id);
            if (comment == null) return NotFound();
            return comment;
        }

        // POST /comments
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Comment>> CreateComment(Comment comment)
        {
            comment.CreatedAt = System.DateTime.UtcNow;
            comment.UserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetComment), new { id = comment.Id }, comment);
        }

        // PUT /comments/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateComment(int id, Comment comment)
        {
            if (id != comment.Id) return BadRequest();
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var existing = await _context.Comments.FindAsync(id);
            if (existing == null) return NotFound();
            if (existing.UserId != userId) return Forbid();
            existing.Content = comment.Content;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /comments/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null) return NotFound();
            if (comment.UserId != userId) return Forbid();
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 