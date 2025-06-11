using System;
using Memoria_GDG;

public class Notification
{
    public int Id { get; set; } 
    public string Type { get; set; } 
    public string Source { get; set; } 
    public int UserId { get; set; } 
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool Read { get; set; } = false;
    public int? PostId { get; set; }
    public int? CommentId { get; set; }
    public int? CapsuleId { get; set; }
    public int? GroupId { get; set; }

    // Navigation
    public User User { get; set; }
}
