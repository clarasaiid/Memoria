using System;

namespace Memoria_GDG.Models
{
    public class PasswordReset
    {
        public int Id { get; set; }
        public string Email { get; set; } = default!;
        public string Code { get; set; } = default!;
        public DateTime CodeExpiry { get; set; }
    }
} 