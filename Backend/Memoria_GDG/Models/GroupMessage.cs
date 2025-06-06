using System;

namespace Memoria_GDG
{
    public class GroupMessage
    {
        public int Id { get; set; }
        public int GroupChatId { get; set; }
        public GroupChat GroupChat { get; set; }
        public int SenderId { get; set; }
        public User Sender { get; set; }
        public string Content { get; set; }
        public DateTime SentAt { get; set; }
    }
} 