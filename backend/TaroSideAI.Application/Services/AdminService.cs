using Microsoft.AspNetCore.Identity;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Exceptions;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Authorization;
using TaroSideAI.Domain.Entities;
using TaroSideAI.Domain.Enums;

namespace TaroSideAI.Application.Services;

public class AdminService : IAdminService
{
    private readonly IAdminRepository _adminRepository;
    private readonly UserManager<AppUser> _userManager;

    public AdminService(IAdminRepository adminRepository, UserManager<AppUser> userManager)
    {
        _adminRepository = adminRepository;
        _userManager = userManager;
    }

    public async Task<List<AdminUserDto>> GetUsersAsync()
    {
        var users = await _adminRepository.GetAllUsersAsync();
        return users.Select(ToDto).ToList();
    }

    public Task<AdminStatsDto> GetStatsAsync()
        => _adminRepository.GetStatsAsync();

    public async Task<AdminUserDto?> ChangeUserRoleAsync(Guid userId, UserRole role)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null) return null;

        user.Role = role;
        user.SubscriptionExpiresAt = null; // ручна зміна ролі = безстроково
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new ValidationException(string.Join(", ", result.Errors.Select(e => e.Description)));


        return ToDto(user);
    }

    public async Task<AdminUserDetailsDto?> GetUserDetailsAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null) return null;

        var activity = await _adminRepository.GetUserActivityAsync(userId);
        var policy = RolePolicies.For(user.Role);

        return new AdminUserDetailsDto
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            Role = user.Role.ToString(),
            CreatedAt = user.CreatedAt,
            DailyChatMessagesUsed = user.DailyChatMessagesUsed,
            DailyQuestionsUsed = user.DailyQuestionsUsed,
            SubscriptionExpiresAt = user.SubscriptionExpiresAt,
            ConversationsCount = activity.Conversations,
            MessagesCount = activity.Messages,
            ReadingsCount = activity.Readings,
            LastActiveAt = activity.LastActive,
            SupportMessagesCount = activity.Support,
            ReadingsLimit = policy.MaxReadingsPerDay,
            ChatMessagesLimit = policy.MaxChatMessagesPerDay,
            MaxCards = policy.MaxCards
        };
    }

    public async Task<AdminUserDto?> GrantSubscriptionAsync(Guid userId, UserRole role, int? days)
    {
        // Через цей метод — лише тарифи. Видати Admin можна тільки явно, через ChangeUserRoleAsync.
        if (role is not (UserRole.Free or UserRole.Premium or UserRole.Vip))
            throw new ValidationException("Підписку можна видати лише Free, Premium або VIP");
        if (days is <= 0 or > 3650)
            throw new ValidationException("Термін — від 1 до 3650 днів");

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null) return null;
        if (user.Role == UserRole.Admin)
            throw new ValidationException("Адміну тариф не видається — у нього й так безліміт");

        user.Role = role;
        user.SubscriptionExpiresAt = role == UserRole.Free || days is null
            ? null
            : DateTime.UtcNow.AddDays(days.Value);

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new ValidationException(string.Join(", ", result.Errors.Select(e => e.Description)));

        return ToDto(user);
    }

    public async Task<bool> DeleteUserAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null) return false;

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            throw new ValidationException(string.Join(", ", result.Errors.Select(e => e.Description)));

        return true;
    }

    private static AdminUserDto ToDto(AppUser user) => new()
    {
        Id = user.Id,
        UserName = user.UserName ?? string.Empty,
        Email = user.Email ?? string.Empty,
        Role = user.Role.ToString(),
        CreatedAt = user.CreatedAt,
        DailyChatMessagesUsed = user.DailyChatMessagesUsed,
        DailyQuestionsUsed = user.DailyQuestionsUsed,
        SubscriptionExpiresAt = user.SubscriptionExpiresAt
    };
}
