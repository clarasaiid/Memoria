using System.Collections.Generic;
using Memoria_GDG.Models;

namespace Memoria_GDG.Models
{
    public class GroupChat
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public Group Group { get; set; }
        public ICollection<GroupMessage> Messages { get; set; }
    }
} 