using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Memoria_GDG.Models;

namespace Memoria_GDG.Services
{
    public class MessageService : IMessageService
    {
        private readonly AppDbContext _context;
        private readonly IGroupService _groupService;

        public MessageService(AppDbContext context, IGroupService groupService)
        {
            _context = context;
            _groupService = groupService;
        }

        public async Task<GroupMessage> CreateGroupMessage(int groupId, int senderId, string content)
        {
            if (!await _groupService.IsUserGroupMember(senderId, groupId))
                return null;

            var message = new GroupMessage
            {
                GroupId = groupId,
                SenderId = senderId,
                Content = content,
                SentAt = DateTime.UtcNow,
                IsEdited = false
            };

            _context.GroupMessages.Add(message);
            await _context.SaveChangesAsync();

            return await _context.GroupMessages
                .Include(m => m.Sender)
                .FirstOrDefaultAsync(m => m.Id == message.Id);
        }

        public async Task<GroupMessage> EditGroupMessage(int messageId, int userId, string newContent)
        {
            var message = await _context.GroupMessages.FindAsync(messageId);
            if (message == null) return null;
            if (message.SenderId != userId && !await _groupService.IsUserGroupAdmin(userId, message.GroupId))
                return null;

            message.Content = newContent;
            message.IsEdited = true;
            message.EditedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await _context.GroupMessages
                .Include(m => m.Sender)
                .FirstOrDefaultAsync(m => m.Id == messageId);
        }

        public async Task<GroupMessage> DeleteGroupMessage(int messageId, int userId)
        {
            var message = await _context.GroupMessages.FindAsync(messageId);
            if (message == null) return null;
            if (message.SenderId != userId && !await _groupService.IsUserGroupAdmin(userId, message.GroupId))
                return null;

            _context.GroupMessages.Remove(message);
            await _context.SaveChangesAsync();

            return message;
        }

        public async Task<IEnumerable<GroupMessage>> GetGroupMessages(int groupId, int skip = 0, int take = 50)
        {
            return await _context.GroupMessages
                .Include(m => m.Sender)
                .Where(m => m.GroupId == groupId)
                .OrderByDescending(m => m.SentAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }
    }
} 