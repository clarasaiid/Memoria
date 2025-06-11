using System;
using Memoria_GDG.Models;
using Memoria_GDG;

namespace Memoria_GDG.Models
{
    public class Friendship
    {
        public int Id { get; set; } 
        public int UserId { get; set; } 
        public int FriendId { get; set; } 
        public string Status { get; set; } 
        public bool Accepted { get; set; } // Indicates if the friendship is accepted
        public User User { get; set; }
        public User Friend { get; set; }
    }
}
