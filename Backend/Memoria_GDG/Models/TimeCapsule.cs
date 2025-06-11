using System;
using System.Collections.Generic;
using Memoria_GDG.Models;

namespace Memoria_GDG
{
    public class TimeCapsule
    {
        public int Id { get; set; }
        public int OwnerId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime OpenAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public User Owner { get; set; }
        public ICollection<TimeCapsuleViewer> Viewers { get; set; }
    }
} 