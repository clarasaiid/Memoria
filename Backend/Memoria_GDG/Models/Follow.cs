using System;

namespace Memoria_GDG.Models
{
    public class Follow
    {
        public int Id { get; set; }
        public int FollowerId { get; set; }
        public int FollowingId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public FollowStatus Status { get; set; } = FollowStatus.Pending;

        public User Follower { get; set; }
        public User Following { get; set; }
    }

    public enum FollowStatus
    {
        Pending,
        Accepted,
        Rejected
    }
} 