using Memoria_GDG;

public class Message
{
    public int Id { get; set; } 
    public int SenderId { get; set; } 
    public int ReceiverId { get; set; } 
    public string Text { get; set; }
    public string Status { get; set; } 
    public DateTime SentAt { get; set; }

    // Navigation
    public User Sender { get; set; }
    public User Receiver { get; set; }
}
