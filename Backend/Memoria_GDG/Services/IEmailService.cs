using System.Threading.Tasks;

namespace Memoria_GDG.Services
{
    public interface IEmailService
    {
        Task SendVerificationEmailAsync(string email, string confirmationLink);
        Task SendPasswordResetCodeAsync(string email, string code);
    }
}