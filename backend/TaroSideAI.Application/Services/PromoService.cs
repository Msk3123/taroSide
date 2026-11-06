using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Identity;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Exceptions;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;
using TaroSideAI.Domain.Enums;

namespace TaroSideAI.Application.Services;

public partial class PromoService : IPromoService
{
    private const string NotAvailable = "Такого промокоду немає або він більше не діє";
    private const int MaxDays = 3650;

    private readonly IPromoRepository _repository;
    private readonly UserManager<AppUser> _userManager;

    public PromoService(IPromoRepository repository, UserManager<AppUser> userManager)
    {
        _repository = repository;
        _userManager = userManager;
    }

    [GeneratedRegex("^[A-Z0-9_-]{3,32}$")]
    private static partial Regex CodeFormat();

    private static string Normalize(string? code) => (code ?? string.Empty).Trim().ToUpperInvariant();

    public async Task<List<PromoDto>> GetAllAsync()
    {
        var promos = await _repository.GetAllAsync();
        return promos.Select(ToDto).ToList();
    }

    public async Task<PromoDto> CreateAsync(CreatePromoDto dto)
    {
        var code = Normalize(dto.Code);
        if (!CodeFormat().IsMatch(code))
            throw new ValidationException("Код: від 3 до 32 символів, латинські літери, цифри, «-» або «_»");

        var name = dto.Name?.Trim() ?? string.Empty;
        if (name.Length is 0 or > 80)
            throw new ValidationException("Назва: від 1 до 80 символів");

        if (!Enum.TryParse<PromoType>(dto.Type, ignoreCase: true, out var type) || !Enum.IsDefined(type))
            throw new ValidationException("Оберіть дію промокоду");

        if (dto.MaxRedemptions is <= 0)
            throw new ValidationException("Кількість активацій має бути більшою за нуль");

        var expiresAt = dto.ExpiresAt?.ToUniversalTime();
        if (expiresAt <= DateTime.UtcNow)
            throw new ValidationException("Дата завершення має бути в майбутньому");

        var promo = new PromoCode
        {
            Id = Guid.NewGuid(),
            Code = code,
            Name = name,
            Type = type,
            MaxRedemptions = dto.MaxRedemptions,
            ExpiresAt = expiresAt
        };

        if (type == PromoType.Discount)
        {
            if (dto.DiscountPercent is not (>= 1 and <= 100))
                throw new ValidationException("Знижка: від 1 до 100%");
            promo.DiscountPercent = dto.DiscountPercent;
        }
        else
        {
            if (!Enum.TryParse<UserRole>(dto.GrantRole, ignoreCase: true, out var role)
                || role is not (UserRole.Premium or UserRole.Vip))
                throw new ValidationException("Оберіть тариф: Premium або VIP");
            if (dto.GrantDays is <= 0 or > MaxDays)
                throw new ValidationException($"Термін: від 1 до {MaxDays} днів");
            promo.GrantRole = role;
            promo.GrantDays = dto.GrantDays;
        }

        if (await _repository.GetByCodeAsync(code) is not null)
            throw new ValidationException($"Код {code} уже існує");

        await _repository.AddAsync(promo);
        return ToDto(promo);
    }

    public async Task SetActiveAsync(Guid id, bool isActive)
    {
        if (!await _repository.SetActiveAsync(id, isActive))
            throw new NotFoundException("Промокод");
    }

    public Task DeleteAsync(Guid id) => _repository.DeleteUnusedAsync(id);

    public async Task<PromoRedeemResultDto> RedeemAsync(Guid userId, string code)
    {
        var promo = await _repository.GetByCodeAsync(Normalize(code));
        if (promo is null || !promo.IsActive || promo.ExpiresAt <= DateTime.UtcNow)
            throw new ValidationException(NotAvailable);

        var user = await _userManager.FindByIdAsync(userId.ToString())
                   ?? throw new NotFoundException("Користувач");

        Func<Task> apply = () => Task.CompletedTask;
        string message;
        PromoDiscountDto? discount = null;

        if (promo.Type == PromoType.Subscription)
        {
            var (role, expiresAt) = CalculateSubscription(user, promo);
            apply = async () =>
            {
                user.Role = role;
                user.SubscriptionExpiresAt = expiresAt;
                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    throw new ValidationException(string.Join(", ", result.Errors.Select(e => e.Description)));
            };
            var roleName = role == UserRole.Vip ? "VIP" : "Premium";
            message = expiresAt is null
                ? $"Тариф {roleName} активовано безстроково"
                : $"Тариф {roleName} активовано до {expiresAt:dd.MM.yyyy}";
        }
        else
        {
            discount = new PromoDiscountDto { Code = promo.Code, Percent = promo.DiscountPercent ?? 0 };
            message = $"Знижку {discount.Percent}% застосовано";
        }

        var outcome = await _repository.RedeemAsync(promo.Id, userId, apply);
        return outcome switch
        {
            PromoRedeemOutcome.Redeemed => new PromoRedeemResultDto
            {
                Type = promo.Type.ToString(),
                Message = message,
                Discount = discount
            },
            PromoRedeemOutcome.AlreadyUsed => throw new ValidationException("Ви вже використали цей промокод"),
            _ => throw new ValidationException("Усі активації цього промокоду вже використано")
        };
    }

    public async Task<PromoDiscountDto?> GetActiveDiscountAsync(Guid userId)
    {
        var promo = await _repository.GetActiveDiscountAsync(userId);
        return promo is null ? null : new PromoDiscountDto { Code = promo.Code, Percent = promo.DiscountPercent ?? 0 };
    }

    /// <summary>Який тариф і термін матиме людина. Код ніколи не погіршує те, що в неї вже є.</summary>
    private static (UserRole Role, DateTime? ExpiresAt) CalculateSubscription(AppUser user, PromoCode promo)
    {
        var now = DateTime.UtcNow;
        var granted = promo.GrantRole ?? throw new ValidationException(NotAvailable);

        // Термін уже минув, а фонового оновлення ще не було: фактично це Free.
        var expired = user.SubscriptionExpiresAt <= now;
        var current = expired ? UserRole.Free : user.Role;
        var currentExpiry = expired ? null : user.SubscriptionExpiresAt;

        if (current == UserRole.Admin)
            throw new ValidationException("Адміну тариф не потрібен: у нього й так безліміт");
        if (current > granted)
            throw new ValidationException("У вас уже вищий тариф");
        if (current >= UserRole.Premium && currentExpiry is null)
            throw new ValidationException("У вас уже безстроковий тариф");

        if (promo.GrantDays is not { } days)
            return (granted, null);

        // Той самий тариф подовжуємо. Підвищення не скорочує вже оплачений термін.
        var expiresAt = current == granted
            ? (currentExpiry ?? now).AddDays(days)
            : new[] { currentExpiry ?? now, now.AddDays(days) }.Max();

        return (granted, expiresAt);
    }

    private static PromoDto ToDto(PromoCode p) => new()
    {
        Id = p.Id,
        Code = p.Code,
        Name = p.Name,
        Type = p.Type.ToString(),
        DiscountPercent = p.DiscountPercent,
        GrantRole = p.GrantRole?.ToString(),
        GrantDays = p.GrantDays,
        MaxRedemptions = p.MaxRedemptions,
        RedemptionsCount = p.RedemptionsCount,
        ExpiresAt = p.ExpiresAt,
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt
    };
}
