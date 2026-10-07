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
            throw new ValidationException(string.Join(", ", result.Errors.Select(e => e.Description)));

        return user;
    }
    
    public async Task<AppUser> UpdateUserAsync(AppUser user)
    {
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new ValidationException(string.Join(", ", result.Errors.Select(e => e.Description)));
        await _userManager.UpdateSecurityStampAsync(user);
        return user;
    }
    
    public async Task<AppUser> DeleteUserAsync(AppUser user)
    {
        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            throw new ValidationException(string.Join(", ", result.Errors.Select(e => e.Description)));
        return user;
    }
    
    
    
    public async Task<AppUser?> GetUserByIdAsync(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        // /me теж має показувати актуальний тариф, а не прострочений
        if (user is not null && ApplySubscriptionExpiry(user))
            await _userManager.UpdateAsync(user);
        return user;
    }

    /* ------------------- Денні ліміти ------------------- */

    public async Task<UserUsageDto> GetUsageAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
                   ?? throw new NotFoundException("Користувач");

        // | а не || — обидві перевірки мають виконатись, навіть якщо перша вже щось змінила
        if (ApplyDailyReset(user) | ApplySubscriptionExpiry(user))
            await _userManager.UpdateAsync(user);

        return BuildUsage(user);
    }

    public async Task<MessageAllowance> CheckMessageAllowanceAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
                   ?? throw new NotFoundException("Користувач");

        var changed = ApplyDailyReset(user) | ApplySubscriptionExpiry(user);
        var policy = RolePolicies.For(user.Role);

        if (user.DailyChatMessagesUsed >= policy.MaxChatMessagesPerDay)
        {
            if (changed) await _userManager.UpdateAsync(user);
            throw new LimitExceededException(
                $"Ви вичерпали денний ліміт повідомлень ({policy.MaxChatMessagesPerDay}). " +
                "Оновіть тариф або поверніться завтра.");
        }

        if (changed) await _userManager.UpdateAsync(user);

        // Чи дозволено новий розклад (карти) у цьому повідомленні + макс. карт за тарифом.
        var canDraw = user.DailyQuestionsUsed < policy.MaxReadingsPerDay;
        return new MessageAllowance(canDraw, policy.MaxCards, user.Role, policy.FreeMode, policy.DestinyMatrix);
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

    /// <summary>Повертає роль на Free, якщо виданий адміном тариф прострочився. True — якщо щось змінилось.</summary>
    private static bool ApplySubscriptionExpiry(AppUser user)
    {
        if (user.SubscriptionExpiresAt is not { } expires || expires > DateTime.UtcNow) return false;

        user.Role = UserRole.Free;
        user.SubscriptionExpiresAt = null;
        return true;
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
            FreeMode = policy.FreeMode,
            DestinyMatrix = policy.DestinyMatrix,
            ResetsAt = resetsAt.ToString("o"),
            SubscriptionExpiresAt = user.SubscriptionExpiresAt?.ToString("o")
        };
    }

}