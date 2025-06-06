using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Memoria_GDG;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Memoria_GDG.Controllers
{
    [ApiController]
    [Route("reactions")]
    public class ReactionsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ReactionsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /reactions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Reaction>>> GetReactions()
        {
            return await _context.Reactions.Include(r => r.User).Include(r => r.Post).ToListAsync();
        }

        // GET /reactions/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Reaction>> GetReaction(int id)
        {
            var reaction = await _context.Reactions.Include(r => r.User).Include(r => r.Post).FirstOrDefaultAsync(r => r.Id == id);
            if (reaction == null) return NotFound();
            return reaction;
        }

        // POST /reactions
        [HttpPost]
        public async Task<ActionResult<Reaction>> CreateReaction(Reaction reaction)
        {
            _context.Reactions.Add(reaction);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetReaction), new { id = reaction.Id }, reaction);
        }

        // PUT /reactions/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReaction(int id, Reaction reaction)
        {
            if (id != reaction.Id) return BadRequest();
            _context.Entry(reaction).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Reactions.AnyAsync(r => r.Id == id).Result)
                    return NotFound();
                else
                    throw;
            }
            return NoContent();
        }

        // DELETE /reactions/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReaction(int id)
        {
            var reaction = await _context.Reactions.FindAsync(id);
            if (reaction == null) return NotFound();
            _context.Reactions.Remove(reaction);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 