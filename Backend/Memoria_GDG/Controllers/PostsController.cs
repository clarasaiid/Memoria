using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Memoria_GDG;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Memoria_GDG.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PostsController(AppDbContext context)
        {
            _context = context;
        }

        public class CreatePostDto
        {
            public string Content { get; set; }
            public string ImageUrl { get; set; }
            public bool IsStory { get; set; }
        }

        // GET /api/posts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Post>>> GetPosts()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var query = _context.Posts.Include(p => p.User).AsQueryable();

            if (currentUserId != null)
            {
                var userId = int.Parse(currentUserId);
                // Get posts from:
                // 1. Public accounts
                // 2. Own posts
                // 3. Private accounts that the user follows (and follow request is accepted)
                query = query.Where(p => 
                    !p.User.IsPrivate || // Public accounts
                    p.UserId == userId || // Own posts
                    _context.Follows.Any(f => 
                        f.FollowerId == userId && 
                        f.FollowingId == p.UserId && 
                        f.Status == FollowStatus.Accepted // Only show posts from private accounts that accepted the follow request
                    )
                );
            }
            else
            {
                // For non-authenticated users, only show posts from public accounts
                query = query.Where(p => !p.User.IsPrivate);
            }

            return await query.ToListAsync();
        }

        // GET /posts/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Post>> GetPost(int id)
        {
            var post = await _context.Posts.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id);
            if (post == null) return NotFound();
            return post;
        }

        // GET /posts/stories
        [HttpGet("stories")]
        public async Task<ActionResult<IEnumerable<Post>>> GetStories()
        {
            return await _context.Posts
                .Include(p => p.User)
                .Where(p => p.IsStory)
                .ToListAsync();
        }

        // GET /posts/archive
        [HttpGet("archive")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Post>>> GetArchivedPosts()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var archivedPosts = await _context.Posts
                .Include(p => p.User)
                .Where(p => p.IsArchived && p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
            return archivedPosts;
        }

        // POST /posts
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Post>> CreatePost([FromBody] CreatePostDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var post = new Post
            {
                Content = dto.Content,
                ImageUrl = dto.ImageUrl,
                IsStory = dto.IsStory,
                CreatedAt = System.DateTime.UtcNow,
                UserId = userId,
                Comments = new List<Comment>(),
                Reactions = new List<Reaction>()
            };
            _context.Posts.Add(post);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPost), new { id = post.Id }, post);
        }

        // PUT /posts/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePost(int id, Post post)
        {
            if (id != post.Id) return BadRequest();
            _context.Entry(post).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Posts.AnyAsync(p => p.Id == id).Result)
                    return NotFound();
                else
                    throw;
            }
            return NoContent();
        }

        // DELETE /posts/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound();
            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT /posts/archive/{id}
        [HttpPut("archive/{id}")]
        [Authorize]
        public async Task<IActionResult> ArchiveStory(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (post == null) return NotFound();

            post.IsArchived = true;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT /posts/unarchive/{id}
        [HttpPut("unarchive/{id}")]
        [Authorize]
        public async Task<IActionResult> UnarchivePost(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (post == null) return NotFound();

            post.IsArchived = false;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("hashtag/{tag}")]
        public async Task<IActionResult> GetPostsByHashtag(string tag)
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .Where(p => p.Content.Contains($"#{tag}"))
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.Id,
                    p.Content,
                    p.ImageUrl,
                    p.CreatedAt,
                    LikeCount = p.Reactions.Count,
                    CommentCount = p.Comments.Count,
                    User = new
                    {
                        p.User.Id,
                        p.User.UserName,
                        p.User.ProfilePictureUrl
                    }
                })
                .ToListAsync();

            return Ok(posts);
        }
    }
} 