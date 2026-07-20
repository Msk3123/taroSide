using System.Net.Mail;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Application.Options;

namespace TaroSideAI.Infrastructure.Email;

public class SmtpEmailSender : IEmailSender
{
    private readonly EmailSettings _emailSettings;
    public SmtpEmailSender(EmailSettings emailSettings)
    {
        _emailSettings = emailSettings;
    }
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        // using var = гарантоване звільнення з'єднання/пам'яті наприкінці методу,
        // навіть якщо SendMailAsync кине виняток
        using var client = new SmtpClient()
        {
            Host = _emailSettings.SmtpHost,
            Port = _emailSettings.SmtpPort,
            EnableSsl = _emailSettings.EnableSsl,
            Credentials = new System.Net.NetworkCredential(_emailSettings.SmtpUser, _emailSettings.SmtpPassword)
        };

        using var message = new MailMessage()
        {
            From = new MailAddress(_emailSettings.FromEmail, _emailSettings.FromName),
            Subject = subject,
            Body = body
        };
        message.To.Add(to);

        await client.SendMailAsync(message);
    }
}