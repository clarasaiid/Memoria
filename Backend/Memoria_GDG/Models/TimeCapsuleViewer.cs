using System;
using Memoria_GDG.Models;

namespace Memoria_GDG.Models
{
    public class TimeCapsuleViewer
    {
        public int Id { get; set; }
        public int TimeCapsuleId { get; set; }
        public TimeCapsule TimeCapsule { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
    }
} 