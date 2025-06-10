using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Memoria_GDG;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;

namespace Memoria_GDG.Controllers
{
    [ApiController]
    [Route("api/search")]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SearchController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Search query is required");

            var searchResults = new
            {
                users = await _context.Users
                    .Where(u => u.UserName.Contains(query) || 
                               u.FirstName.Contains(query) || 
                               u.LastName.Contains(query))
                    .Select(u => new
                    {
                        u.Id,
                        u.UserName,
                        u.FirstName,
                        u.LastName,
                        u.ProfilePictureUrl,
                        Type = "user"
                    })
                    .Take(10)
                    .ToListAsync(),

                hashtags = await _context.Posts
                    .Where(p => p.Content.Contains($"#{query}"))
                    .Select(p => new
                    {
                        Tag = query,
                        Count = _context.Posts.Count(x => x.Content.Contains($"#{query}")),
                        Type = "hashtag"
                    })
                    .Distinct()
                    .Take(10)
                    .ToListAsync(),

                groups = await _context.Groups
                    .Where(g => g.Name.Contains(query) || 
                               g.Description.Contains(query))
                    .Select(g => new
                    {
                        g.Id,
                        g.Name,
                        g.Description,
                        MemberCount = g.Memberships.Count,
                        Type = "group"
                    })
                    .Take(10)
                    .ToListAsync()
            };

            return Ok(searchResults);
        }
    }
} 