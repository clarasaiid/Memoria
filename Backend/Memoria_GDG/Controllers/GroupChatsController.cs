using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Memoria_GDG;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System;
using System.Linq;
using Memoria_GDG.Models;

namespace Memoria_GDG.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupChatsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public GroupChatsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /groupchats/{groupId}/messages
        [HttpGet("{groupId}/messages")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<GroupMessage>>> GetMessages(int groupId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var isMember = await _context.GroupMemberships.AnyAsync(m => m.GroupId == groupId && m.UserId == userId);
            if (!isMember) return Forbid();
            var chat = await _context.GroupChats.FirstOrDefaultAsync(gc => gc.GroupId == groupId);
            if (chat == null) return NotFound();
            return await _context.GroupMessages.Include(m => m.Sender).Where(m => m.GroupChatId == chat.Id).OrderBy(m => m.SentAt).ToListAsync();
        }

        // POST /groupchats/{groupId}/messages
        [HttpPost("{groupId}/messages")]
        [Authorize]
        public async Task<ActionResult<GroupMessage>> SendMessage(int groupId, [FromBody] string content)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var isMember = await _context.GroupMemberships.AnyAsync(m => m.GroupId == groupId && m.UserId == userId);
            if (!isMember) return Forbid();
            var chat = await _context.GroupChats.FirstOrDefaultAsync(gc => gc.GroupId == groupId);
            if (chat == null)
            {
                chat = new GroupChat { GroupId = groupId };
                _context.GroupChats.Add(chat);
                await _context.SaveChangesAsync();
            }
            var message = new GroupMessage
            {
                GroupChatId = chat.Id,
                SenderId = userId,
                Content = content,
                SentAt = DateTime.UtcNow
            };
            _context.GroupMessages.Add(message);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetMessages), new { groupId = groupId }, message);
        }
    }
} 