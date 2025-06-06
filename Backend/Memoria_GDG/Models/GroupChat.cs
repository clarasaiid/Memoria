using System.Collections.Generic;

namespace Memoria_GDG
{
    public class GroupChat
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public Group Group { get; set; }
        public ICollection<GroupMessage> Messages { get; set; }
    }
} 