namespace TaroSideAI.Application.DTOs;

public class CreatePromoDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "Discount" | "Subscription"
    public int? DiscountPercent { get; set; }
    public string? GrantRole { get; set; }           // "Premium" | "Vip"
    public int? GrantDays { get; set; }              // null — безстроково
    public int? MaxRedemptions { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class SetPromoActiveDto
{
    public bool IsActive { get; set; }
}

public class PromoDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int? DiscountPercent { get; set; }
    public string? GrantRole { get; set; }
    public int? GrantDays { get; set; }
    public int? MaxRedemptions { get; set; }
    public int RedemptionsCount { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class RedeemPromoDto
{
    public string Code { get; set; } = string.Empty;
}

public class PromoDiscountDto
{
    public string Code { get; set; } = string.Empty;
    public int Percent { get; set; }
}

public class PromoRedeemResultDto
{
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public PromoDiscountDto? Discount { get; set; }
}
