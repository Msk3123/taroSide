using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TaroSideAI.Application.Interfaces;
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

        return services;
    }
}