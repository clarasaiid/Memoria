using System;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace Memoria_GDG.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _fromEmail;
        private readonly string _fromName;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
            _smtpServer = _configuration["Email:SmtpServer"] ?? "smtp.gmail.com";
            _smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            _smtpUsername = _configuration["Email:SmtpUsername"];
            _smtpPassword = _configuration["Email:SmtpPassword"];
            _fromEmail = _configuration["Email:FromEmail"];
            _fromName = _configuration["Email:FromName"] ?? "Memoria";
        }

        public async Task SendVerificationEmailAsync(string email, string confirmationLink)
        {
            using var client = new SmtpClient(_smtpServer, _smtpPort)
            {
                EnableSsl = true,
                Credentials = new System.Net.NetworkCredential(_smtpUsername, _smtpPassword)
            };

            var message = new MailMessage
            {
                From = new MailAddress(_fromEmail, _fromName),
                Subject = "Verify your Memoria account",
                Body = $@"
                    <h2>Welcome to Memoria!</h2>
                    <p>Thank you for registering. Please click the link below to verify your email address:</p>
                    <p><a href='{confirmationLink}'>Verify Email Address</a></p>
                    <p>If you did not create this account, please ignore this email.</p>
                    <p>Best regards,<br>The Memoria Team</p>",
                IsBodyHtml = true
            };
            message.To.Add(email);

            try
            {
                await client.SendMailAsync(message);
            }
            catch (Exception ex)
            {
                // Log the error or handle it appropriately
                throw new Exception($"Failed to send verification email: {ex.Message}", ex);
            }
        }

        public async Task SendPasswordResetCodeAsync(string email, string code)
        {
            using var client = new SmtpClient(_smtpServer, _smtpPort)
            {
                EnableSsl = true,
                Credentials = new System.Net.NetworkCredential(_smtpUsername, _smtpPassword)
            };

            var message = new MailMessage
            {
                From = new MailAddress(_fromEmail, _fromName),
                Subject = "Memoria Password Reset Code",
                Body = $@"
                    <h2>Password Reset Request</h2>
                    <p>Your password reset code is: <b>{code}</b></p>
                    <p>If you did not request this, please ignore this email.</p>",
                IsBodyHtml = true
            };
            message.To.Add(email);

            await client.SendMailAsync(message);
        }
    }
}