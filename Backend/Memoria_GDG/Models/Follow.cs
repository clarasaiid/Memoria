using System;

namespace Memoria_GDG
{
    public class Follow
    {
        public int Id { get; set; }
        public int FollowerId { get; set; }
        public int FollowingId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool Approved { get; set; }

        public User Follower { get; set; }
        public User Following { get; set; }
    }
} 