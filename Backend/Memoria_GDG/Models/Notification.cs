using System;
using Memoria_GDG;
using Memoria_GDG.Models;
using System;
public class Notification
{

    public int Id { get; set; }
    public string Type { get; set; }  // e.g., "friend_request"
    public string Source { get; set; } = "user";
    public int UserId { get; set; }   // Receiver
    public bool Read { get; set; } = false;
    public int? PostId { get; set; }
    public string Text { get; set; }
    public int? SenderId { get; set; }
    public string SenderAvatarUrl { get; set; }

    public string SenderUsername { get; set; }
    public string SenderFullName { get; set; }
 
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public int? CommentId { get; set; }
    public int? CapsuleId { get; set; }
    public int? GroupId { get; set; }


    public User User { get; set; }
}
