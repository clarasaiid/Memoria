using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Memoria_GDG;
using System.Threading.Tasks;
using System.Collections.Generic;
using Memoria_GDG.Dtos;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.SignalR;
using Memoria_GDG.Hubs;

namespace Memoria_GDG.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FriendshipsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<ChatHub> _hubContext;
        public FriendshipsController(AppDbContext context, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // GET /api/friend-requests
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Friendship>>> GetFriendships()
        {
            return await _context.Friendships
                .Include(f => f.User)
                .Include(f => f.Friend)
                .ToListAsync();
        }

        // GET /api/friend-requests/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Friendship>> GetFriendship(int id)
        {
            var friendship = await _context.Friendships
                .Include(f => f.User)
                .Include(f => f.Friend)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (friendship == null) return NotFound();

            return friendship;
        }

        // POST /api/friend-requests
        [HttpPost]
        public async Task<ActionResult<Friendship>> CreateFriendship([FromBody] CreateFriendshipDto dto)
        {
            var existing = await _context.Friendships
                .FirstOrDefaultAsync(f =>
                    (f.UserId == dto.UserId && f.FriendId == dto.FriendId) ||
                    (f.UserId == dto.FriendId && f.FriendId == dto.UserId));

            if (existing != null)
            {
                return BadRequest("Friendship request already exists");
            }

            var sender = await _context.Users.FindAsync(dto.UserId);
            if (sender == null) return NotFound("Sender not found");

            var fullName = $"{sender.FirstName ?? ""} {sender.LastName ?? ""}".Trim();
            if (string.IsNullOrWhiteSpace(fullName)) fullName = "Unknown";
            var username = sender.UserName ?? "";
            if (string.IsNullOrWhiteSpace(username)) username = "unknown";
            var avatarUrl = sender.ProfilePictureUrl ?? "";

            var friendship = new Friendship
            {
                UserId = dto.UserId,
                FriendId = dto.FriendId,
                Accepted = false,
                Status = "pending"
            };

            var notification = new Notification
            {
                Type = "friend_request",
                Source = "user",
                UserId = dto.FriendId,
                PostId = 0, // temp, will set below
                Text = $"{fullName} (@{username}) sent you a friend request",
                SenderId = dto.UserId,
                SenderAvatarUrl = avatarUrl,
                SenderFullName = fullName,
                SenderUsername = username
            };

            _context.Friendships.Add(friendship);
            await _context.SaveChangesAsync(); // save once to get friendship.Id

            notification.PostId = friendship.Id;
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync(); // save both safely

            // Broadcast to the friend (target user)
            await _hubContext.Clients.User(dto.FriendId.ToString()).SendAsync("ReceiveNotification", notification);

            return CreatedAtAction(nameof(GetFriendship), new { id = friendship.Id }, friendship);
        }

        // PUT /api/friend-requests/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> HandleFriendRequest(int id, [FromBody] HandleFriendRequestDto body)
        {
            var friendship = await _context.Friendships
                .Include(f => f.User)
                .Include(f => f.Friend)
                .FirstOrDefaultAsync(f => f.Id == id);
            if (friendship == null) return NotFound();

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Type == "friend_request" &&
                                          n.UserId == friendship.FriendId &&
                                          n.PostId == id);
            if (notification != null)
            {
                _context.Notifications.Remove(notification);
            }

            if (body.Accept)
            {
                friendship.Accepted = true;
                friendship.Status = "accepted";

                var acceptanceNotification = new Notification
                {
                    Type = "friend_request_accepted",
                    Source = "user",
                    UserId = friendship.UserId,
                    PostId = friendship.Id,
                    Text = $"{friendship.Friend.FirstName} {friendship.Friend.LastName} (@{friendship.Friend.UserName}) accepted your friend request",
                    SenderId = friendship.FriendId,
                    SenderAvatarUrl = friendship.Friend.ProfilePictureUrl,
                    SenderFullName = $"{friendship.Friend.FirstName} {friendship.Friend.LastName}",
                    SenderUsername = friendship.Friend.UserName
                };
                _context.Notifications.Add(acceptanceNotification);

                var alreadyFollow1 = await _context.Follows
                    .FirstOrDefaultAsync(f => f.FollowerId == friendship.UserId && f.FollowingId == friendship.FriendId);
                if (alreadyFollow1 == null)
                    _context.Follows.Add(new Follow { FollowerId = friendship.UserId, FollowingId = friendship.FriendId });

                var alreadyFollow2 = await _context.Follows
                    .FirstOrDefaultAsync(f => f.FollowerId == friendship.FriendId && f.FollowingId == friendship.UserId);
                if (alreadyFollow2 == null)
                    _context.Follows.Add(new Follow { FollowerId = friendship.FriendId, FollowingId = friendship.UserId });
            }
            else
            {
                _context.Friendships.Remove(friendship);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST /api/friend-requests/{id}/accept
        [HttpPost("{id}/accept")]
        public async Task<IActionResult> AcceptFriendRequest(int id)
        {
            var friendship = await _context.Friendships
                .Include(f => f.User)
                .Include(f => f.Friend)
                .FirstOrDefaultAsync(f => f.Id == id);
            if (friendship == null) return NotFound();

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Type == "friend_request" &&
                                          n.UserId == friendship.FriendId &&
                                          n.PostId == id);
            if (notification != null)
                _context.Notifications.Remove(notification);

            friendship.Accepted = true;
            friendship.Status = "accepted";

            var notify = new Notification
            {
                Type = "friend_request_accepted",
                Source = "user",
                UserId = friendship.UserId,
                PostId = friendship.Id,
                Text = $"{friendship.Friend.FirstName} {friendship.Friend.LastName} (@{friendship.Friend.UserName}) accepted your friend request",
                SenderId = friendship.FriendId,
                SenderAvatarUrl = friendship.Friend.ProfilePictureUrl,
                SenderFullName = $"{friendship.Friend.FirstName} {friendship.Friend.LastName}",
                SenderUsername = friendship.Friend.UserName
            };
            _context.Notifications.Add(notify);

            var alreadyFollow1 = await _context.Follows
                .FirstOrDefaultAsync(f => f.FollowerId == friendship.UserId && f.FollowingId == friendship.FriendId);
            if (alreadyFollow1 == null)
                _context.Follows.Add(new Follow { FollowerId = friendship.UserId, FollowingId = friendship.FriendId });

            var alreadyFollow2 = await _context.Follows
                .FirstOrDefaultAsync(f => f.FollowerId == friendship.FriendId && f.FollowingId == friendship.UserId);
            if (alreadyFollow2 == null)
                _context.Follows.Add(new Follow { FollowerId = friendship.FriendId, FollowingId = friendship.UserId });

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST /api/friend-requests/{id}/decline
        [HttpPost("{id}/decline")]
        public async Task<IActionResult> DeclineFriendRequest(int id)
        {
            var friendship = await _context.Friendships.FindAsync(id);
            if (friendship == null) return NotFound();

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Type == "friend_request" &&
                                          n.UserId == friendship.FriendId &&
                                          n.PostId == id);
            if (notification != null)
                _context.Notifications.Remove(notification);

            _context.Friendships.Remove(friendship);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ✅ NEW: DELETE /api/friend-requests/{id}/revoke
        [HttpDelete("{id}/revoke")]
        public async Task<IActionResult> RevokeFriendRequest(int id)
        {
            var friendship = await _context.Friendships
                .FirstOrDefaultAsync(f => f.Id == id && !f.Accepted);

            if (friendship == null)
                return NotFound("Pending friend request not found");

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Type == "friend_request" &&
                                          n.UserId == friendship.FriendId &&
                                          n.PostId == id);
            if (notification != null)
                _context.Notifications.Remove(notification);

            _context.Friendships.Remove(friendship);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/friend-requests/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFriendship(int id)
        {
            var friendship = await _context.Friendships.FindAsync(id);
            if (friendship == null) return NotFound();

            _context.Friendships.Remove(friendship);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET /api/friend-requests/incoming
        [HttpGet("incoming")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Friendship>>> GetIncomingFriendRequests()
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var pendingRequests = await _context.Friendships
                .Where(f => f.FriendId == currentUserId && !f.Accepted)
                .Include(f => f.User) // The sender
                .ToListAsync();

            return Ok(pendingRequests);
        }

        // GET /api/friend-requests/outgoing
        [HttpGet("outgoing")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Friendship>>> GetOutgoingFriendRequests()
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var sentRequests = await _context.Friendships
                .Where(f => f.UserId == currentUserId && !f.Accepted)
                .Include(f => f.Friend) // The receiver
                .ToListAsync();

            return Ok(sentRequests);
        }


    }
}
