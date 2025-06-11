using System;
using System.ComponentModel.DataAnnotations;

namespace Memoria_GDG.Models
{
    public class GroupMember
    {
        [Key]
        public int Id { get; set; }
        
        public int GroupId { get; set; }
        public virtual Group Group { get; set; }
        
        public int UserId { get; set; }
        public virtual User User { get; set; }
        
        public DateTime JoinedAt { get; set; }
        public GroupRole Role { get; set; }
    }

    public enum GroupRole
    {
        Member = 0,
        Admin = 1
    }
} 