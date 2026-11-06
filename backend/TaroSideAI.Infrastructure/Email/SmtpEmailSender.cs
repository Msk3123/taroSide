using System.Net.Mail;
using System.Text;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Application.Options;

namespace TaroSideAI.Infrastructure.Email;

public class SmtpEmailSender : IEmailSender
{
    private static readonly TimeSpan SendTimeout = TimeSpan.FromSeconds(20);

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
            Credentials = new System.Net.NetworkCredential(_emailSettings.User, _emailSettings.Password)
        };

        var fromEmail = string.IsNullOrWhiteSpace(_emailSettings.FromEmail)
            ? _emailSettings.User
            : _emailSettings.FromEmail;

        using var message = new MailMessage()
        {
            From = new MailAddress(fromEmail, _emailSettings.FromName, Encoding.UTF8),
            Subject = subject,
            SubjectEncoding = Encoding.UTF8,
            Body = body,
            BodyEncoding = Encoding.UTF8
        };
        message.To.Add(to);

        // Таймаут SmtpClient не діє на асинхронне надсилання, тому обмежуємо токеном.
        using var timeout = new CancellationTokenSource(SendTimeout);
        await client.SendMailAsync(message, timeout.Token);
    }
}
