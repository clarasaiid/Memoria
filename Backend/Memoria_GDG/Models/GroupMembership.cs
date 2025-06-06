using System;

namespace Memoria_GDG
{
    public class GroupMembership
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public Group Group { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public string Role { get; set; } // e.g., "Admin", "Member"
        public DateTime JoinedAt { get; set; }
    }
} 