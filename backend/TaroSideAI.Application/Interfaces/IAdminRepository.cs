using TaroSideAI.Application.DTOs;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Interfaces;

// Запити до БД, які потрібні тільки адмінці (список УСІХ юзерів, глобальні лічильники).
// Звичайні репозиторії такого не дають — вони працюють у межах одного користувача.
public interface IAdminRepository
{
    Task<List<AppUser>> GetAllUsersAsync();
    Task<AdminStatsDto> GetStatsAsync();

    /// <summary>Лічильники активності одного юзера (розмови, повідомлення, розклади, остання дія).</summary>
    Task<(int Conversations, int Messages, int Readings, DateTime? LastActive, int Support)> GetUserActivityAsync(Guid userId);

    Task<List<AdminConversationDto>> GetUserConversationsAsync(Guid userId);

    /// <summary>Повідомлення розмови. Null — якщо це не розмова вказаного користувача.</summary>
    Task<List<AdminMessageDto>?> GetUserConversationMessagesAsync(Guid userId, Guid conversationId);
}
