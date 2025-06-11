public class PendingRegistration
{
    public int Id { get; set; }
    public string Email { get; set; } = default!;
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public DateTime? Birthday { get; set; } = default!;
    public string Gender { get; set; } = default!;
    public string? Bio { get; set; }
    public string? Username { get; set; }
    public string VerificationToken { get; set; } = default!;
    public DateTime TokenExpiry { get; set; }
} 