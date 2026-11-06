using TaroSideAI.Domain.Enums;

namespace TaroSideAI.Domain.Entities;

public class PromoCode
{
    public Guid Id { get; set; }

    // Те, що вводить людина. Завжди у верхньому регістрі.
    public string Code { get; set; } = string.Empty;

    // Внутрішня назва для адмінки: «Розіграш у TikTok, листопад».
    public string Name { get; set; } = string.Empty;

    public PromoType Type { get; set; }

    // Для Discount: 1..100.
    public int? DiscountPercent { get; set; }

    // Для Subscription: який тариф і на скільки днів (null — безстроково).
    public UserRole? GrantRole { get; set; }
    public int? GrantDays { get; set; }

    // null — без обмеження кількості активацій.
    public int? MaxRedemptions { get; set; }
    public int RedemptionsCount { get; set; }

    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
