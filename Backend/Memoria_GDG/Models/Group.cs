using System;
using System.Collections.Generic;

namespace Memoria_GDG
{
    public class Group
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int OwnerId { get; set; }
        public User Owner { get; set; }
        public DateTime CreatedAt { get; set; }
        public ICollection<GroupMembership> Memberships { get; set; }
    }
} 