using System;
using Memoria_GDG.Models;

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
        public bool IsEdited { get; set; }
        public DateTime? EditedAt { get; set; }
        public int GroupId { get; set; }
    }
} 