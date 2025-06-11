using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Memoria_GDG;

namespace Memoria_GDG.Hubs
{
    public class ChatHub : Hub
    {
        private readonly AppDbContext _context;
        // In-memory online users tracking (for demo; use Redis for production)
        private static readonly HashSet<int> OnlineUsers = new HashSet<int>();

        public ChatHub(AppDbContext context)
        {
            _context = context;
        }

        public override async Task OnConnectedAsync()
        {
            var userIdStr = Context.UserIdentifier;
            if (int.TryParse(userIdStr, out int userId))
            {
                lock (OnlineUsers) { OnlineUsers.Add(userId); }
                // Notify friends that this user is online
                var friends = await _context.Friendships
                    .Where(f => (f.UserId == userId || f.FriendId == userId) && f.Accepted)
                    .Select(f => f.UserId == userId ? f.FriendId : f.UserId)
                    .ToListAsync();
                foreach (var friendId in friends)
                {
                    await Clients.User(friendId.ToString()).SendAsync("UserStatusChanged", userId, true);
                }
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userIdStr = Context.UserIdentifier;
            if (int.TryParse(userIdStr, out int userId))
            {
                lock (OnlineUsers) { OnlineUsers.Remove(userId); }
                // Notify friends that this user is offline
                var friends = await _context.Friendships
                    .Where(f => (f.UserId == userId || f.FriendId == userId) && f.Accepted)
                    .Select(f => f.UserId == userId ? f.FriendId : f.UserId)
                    .ToListAsync();
                foreach (var friendId in friends)
                {
                    await Clients.User(friendId.ToString()).SendAsync("UserStatusChanged", userId, false);
                }
            }
            await base.OnDisconnectedAsync(exception);
        }

        // Method to get a user's online status
        public Task<bool> IsUserOnline(int userId)
        {
            lock (OnlineUsers)
            {
                return Task.FromResult(OnlineUsers.Contains(userId));
            }
        }

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task SendMessageToGroup(string groupName, string user, string message)
        {
            await Clients.Group(groupName).SendAsync("ReceiveMessage", user, message);
        }

        // Send a private message between friends
        public async Task SendPrivateMessage(int senderId, int receiverId, string text)
        {
            // Check if users are friends
            var areFriends = await _context.Friendships.AnyAsync(f =>
                ((f.UserId == senderId && f.FriendId == receiverId) ||
                 (f.UserId == receiverId && f.FriendId == senderId)) &&
                f.Accepted == true);
            if (!areFriends)
            {
                await Clients.Caller.SendAsync("Error", "You are not friends with this user.");
                return;
            }

            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Text = text,
                Status = "sent",
                SentAt = DateTime.UtcNow
            };
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Notify the receiver (and sender for echo)
            await Clients.User(receiverId.ToString()).SendAsync("ReceivePrivateMessage", message);
            await Clients.User(senderId.ToString()).SendAsync("ReceivePrivateMessage", message);
        }
    }
} 