public class RegisterDto
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public DateTime? Birthday { get; set; }
    public required string Gender { get; set; }
    public required string Password { get; set; }
    public required string ConfirmPassword { get; set; }
    public string? Bio { get; set; }
    public string? Username { get; set; }
}
