using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Exceptions;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Authorization;
using TaroSideAI.Domain.Entities;
using TaroSideAI.Domain.Enums;
using Microsoft.AspNetCore.Identity;
namespace TaroSideAI.Application.Services;

public class UserService : IUserService
{
    private readonly UserManager<AppUser> _userManager;
    
    public UserService( UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }
    
    public async Task<AppUser> CreateUserAsync (CreateUsersDto createUsersDto)
    {
        var user = new AppUser
        {
            UserName = createUsersDto.UserName,
            Email = createUsersDto.Email,
            Role = UserRole.Free
        };
        
        var result = await _userManager.CreateAsync(user, createUsersDto.Password);

        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

        return user;
    }
    
    public async Task<AppUser> UpdateUserAsync(AppUser user)
    {
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        await _userManager.UpdateSecurityStampAsync(user);
        return user;
    }
    
    public async Task<AppUser> DeleteUserAsync(AppUser user)
    {
        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        return user;
    }
    
    
    
    public async Task<AppUser?> GetUserByIdAsync(Guid id)
    {
        return await _userManager.FindByIdAsync(id.ToString());
    }

    /* ------------------- Денні ліміти ------------------- */

    public async Task<UserUsageDto> GetUsageAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
                   ?? throw new Exception("Користувача не знайдено");

        if (ApplyDailyReset(user))
            await _userManager.UpdateAsync(user);

        return BuildUsage(user);
    }

    public async Task<bool> CheckMessageAllowanceAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
                   ?? throw new Exception("Користувача не знайдено");

        var changed = ApplyDailyReset(user);
        var policy = RolePolicies.For(user.Role);

        if (user.DailyChatMessagesUsed >= policy.MaxChatMessagesPerDay)
        {
            if (changed) await _userManager.UpdateAsync(user);
            throw new LimitExceededException(
                $"Ви вичерпали денний ліміт повідомлень ({policy.MaxChatMessagesPerDay}). " +
                "Оновіть тариф або поверніться завтра.");
        }

        if (changed) await _userManager.UpdateAsync(user);

        // Чи дозволено новий розклад (карти) у цьому повідомленні.
        return user.DailyQuestionsUsed < policy.MaxReadingsPerDay;
    }

    public async Task RegisterMessageAsync(Guid userId, bool readingHappened)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null) return;

        ApplyDailyReset(user);
        user.DailyChatMessagesUsed++;
        if (readingHappened) user.DailyQuestionsUsed++;

        await _userManager.UpdateAsync(user);
    }

    /// <summary>Обнуляє денні лічильники, якщо настала нова доба (UTC). True — якщо щось змінилось.</summary>
    private static bool ApplyDailyReset(AppUser user)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (user.DailyQuestionsReset == today) return false;

        user.DailyQuestionsReset = today;
        user.DailyChatMessagesUsed = 0;
        user.DailyQuestionsUsed = 0;
        return true;
    }

    private static UserUsageDto BuildUsage(AppUser user)
    {
        var policy = RolePolicies.For(user.Role);
        var resetsAt = DateTime.UtcNow.Date.AddDays(1); // наступна доба UTC

        return new UserUsageDto
        {
            Role = user.Role.ToString(),
            ChatMessagesUsed = user.DailyChatMessagesUsed,
            ChatMessagesLimit = policy.MaxChatMessagesPerDay,
            ReadingsUsed = user.DailyQuestionsUsed,
            ReadingsLimit = policy.MaxReadingsPerDay,
            MaxCards = policy.MaxCards,
            ResetsAt = resetsAt.ToString("o")
        };
    }

}