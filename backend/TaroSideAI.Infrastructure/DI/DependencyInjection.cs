using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Application.Options;
using TaroSideAI.Infrastructure.Email;
using TaroSideAI.Infrastructure.Repositories;

namespace TaroSideAI.Infrastructure.DI;

public static class InfrastructureDі
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration config)
    {
        // Тільки репозиторії — те, що "торкається" БД/зовнішнього світу
        services.AddScoped<ICardRepository, CardRepository>();
        services.AddScoped<ISpreadRepository, SpreadRepository>();
        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddScoped<IAdminRepository, AdminRepository>();
        services.AddScoped<IAnalyticsRepository, AnalyticsRepository>();
        services.AddScoped<ISupportRepository, SupportRepository>();

        // Email: налаштування читаємо з секції "Email" один раз,
        // а сервіс реєструємо ЗА ІНТЕРФЕЙСОМ — щоб UserService просив IEmailSender,
        // не знаючи, що за ним стоїть саме SMTP (завтра — Brevo, і цей файл
        // буде єдиним місцем зміни)
        var emailSettings = config.GetSection("Email").Get<EmailSettings>() ?? new EmailSettings();
        services.AddSingleton(emailSettings);
        services.AddScoped<IEmailSender, SmtpEmailSender>();

        return services;
    }
}