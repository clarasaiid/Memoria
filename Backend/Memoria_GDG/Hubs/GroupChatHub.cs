using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Memoria_GDG.Models;
using Memoria_GDG.Services;
using System.Security.Claims;

namespace Memoria_GDG.Hubs
{
    public class GroupChatHub : Hub
    {
        private readonly IGroupService _groupService;
        private readonly IMessageService _messageService;

        public GroupChatHub(IGroupService groupService, IMessageService messageService)
        {
            _groupService = groupService;
            _messageService = messageService;
        }

        public async Task JoinGroup(int groupId)
        {
            var userId = Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (await _groupService.IsUserGroupMember(int.Parse(userId), groupId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"Group_{groupId}");
            }
        }

        public async Task LeaveGroup(int groupId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Group_{groupId}");
        }

        public async Task SendMessage(int groupId, string content)
        {
            var userId = Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return;

            var message = await _messageService.CreateGroupMessage(groupId, int.Parse(userId), content);
            if (message != null)
            {
                await Clients.Group($"Group_{groupId}").SendAsync("ReceiveMessage", message);
            }
        }

        public async Task EditMessage(int messageId, string newContent)
        {
            var userId = Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var message = await _messageService.EditGroupMessage(messageId, int.Parse(userId), newContent);
            if (message != null)
            {
                await Clients.Group($"Group_{message.GroupId}").SendAsync("MessageEdited", message);
            }
        }

        public async Task DeleteMessage(int messageId)
        {
            var userId = Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var message = await _messageService.DeleteGroupMessage(messageId, int.Parse(userId));
            if (message != null)
            {
                await Clients.Group($"Group_{message.GroupId}").SendAsync("MessageDeleted", messageId);
            }
        }
    }
} 