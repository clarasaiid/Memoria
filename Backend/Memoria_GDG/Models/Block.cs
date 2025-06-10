using System;

namespace Memoria_GDG
{
    public class Block
    {
        public int Id { get; set; }
        public int BlockerId { get; set; }
        public int BlockedId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User Blocker { get; set; }
        public User Blocked { get; set; }
    }
} 