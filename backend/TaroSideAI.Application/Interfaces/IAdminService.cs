using TaroSideAI.Application.DTOs;
using TaroSideAI.Domain.Enums;

namespace TaroSideAI.Application.Interfaces;

public interface IAdminService
{
    Task<List<AdminUserDto>> GetUsersAsync();
    Task<AdminStatsDto> GetStatsAsync();

    /// <summary>Змінює роль користувача. Повертає null, якщо користувача не знайдено.</summary>
    Task<AdminUserDto?> ChangeUserRoleAsync(Guid userId, UserRole role);

    /// <summary>Профіль + активність користувача. Null — якщо не знайдено.</summary>
    Task<AdminUserDetailsDto?> GetUserDetailsAsync(Guid userId);

    /// <summary>Видає тариф Free/Premium/Vip на <paramref name="days"/> днів (null — безстроково).</summary>
    Task<AdminUserDto?> GrantSubscriptionAsync(Guid userId, UserRole role, int? days);

    /// <summary>Розмови користувача. Null — якщо користувача не знайдено.</summary>
    Task<List<AdminConversationDto>?> GetUserConversationsAsync(Guid userId);

    /// <summary>Повідомлення розмови. Null — якщо це не розмова вказаного користувача.</summary>
    Task<List<AdminMessageDto>?> GetUserConversationMessagesAsync(Guid userId, Guid conversationId);

    /// <summary>Видаляє користувача. False — якщо користувача не знайдено.</summary>
    Task<bool> DeleteUserAsync(Guid userId);
}
