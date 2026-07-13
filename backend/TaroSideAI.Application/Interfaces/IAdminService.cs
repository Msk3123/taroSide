using TaroSideAI.Application.DTOs;
using TaroSideAI.Domain.Enums;

namespace TaroSideAI.Application.Interfaces;

public interface IAdminService
{
    Task<List<AdminUserDto>> GetUsersAsync();
    Task<AdminStatsDto> GetStatsAsync();

    /// <summary>Змінює роль користувача. Повертає null, якщо користувача не знайдено.</summary>
    Task<AdminUserDto?> ChangeUserRoleAsync(Guid userId, UserRole role);

    /// <summary>Видаляє користувача. False — якщо користувача не знайдено.</summary>
    Task<bool> DeleteUserAsync(Guid userId);
}
