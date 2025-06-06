using Memoria_GDG;

public class Notification
{
    public int Id { get; set; } 
    public string Type { get; set; } 
    public string Source { get; set; } 
    public int UserId { get; set; } 
    public bool Read { get; set; } = false;
    public int? PostId { get; set; }

    // Navigation
    public User User { get; set; }
}
