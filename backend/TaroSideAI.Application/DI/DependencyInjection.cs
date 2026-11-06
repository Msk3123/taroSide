using Microsoft.Extensions.DependencyInjection;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Application.Services;

namespace TaroSideAI.Application.DI;

public static class ApplicationDI
{
    // Реєструє сервіси бізнес-логіки (Application-шар).
    // IConfiguration тут НЕ потрібен — сервіси не лізуть у конфіг напряму.
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ICardService, CardService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IChatAiService, ChatAiService>();
        services.AddScoped<ISpreadService, SpreadService>();
        services.AddScoped<IConversationService, ConversationService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IMatrixCalculationService, MatrixCalculationService>();
        services.AddScoped<IMatrixService, MatrixService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();
        services.AddScoped<ISupportService, SupportService>();
        services.AddScoped<IPromoService, PromoService>();

        // TokenService — внутрішня утиліта (генерація JWT), свідомо без інтерфейсу
        services.AddScoped<TokenService>();

        return services; // повертаємо, щоб працював ланцюжок .AddApplication().AddInfrastructure()
    }
}