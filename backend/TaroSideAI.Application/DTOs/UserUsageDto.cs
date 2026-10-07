namespace TaroSideAI.Application.DTOs;

/// <summary>
/// Поточне використання денних лімітів + межі тарифу.
/// Ліміт int.MaxValue фронт трактує як «безліміт».
/// </summary>
public class UserUsageDto
{
    public string Role { get; set; } = string.Empty;

    public int ChatMessagesUsed { get; set; }
    public int ChatMessagesLimit { get; set; }

    public int ReadingsUsed { get; set; }
    public int ReadingsLimit { get; set; }

    public int MaxCards { get; set; }

    /// <summary>Чи відкритий тарифом «Вільний розклад» (фронт за цим блокує чіп).</summary>
    public bool FreeMode { get; set; }

    /// <summary>Чи відкрита тарифом AI-інтерпретація Матриці Долі.</summary>
    public bool DestinyMatrix { get; set; }

    /// <summary>ISO-8601 момент, коли лічильники обнуляться (наступна доба UTC).</summary>
    public string ResetsAt { get; set; } = string.Empty;

    /// <summary>ISO-8601 кінець платного тарифу, виданого адміном. null — безстроково або тариф Free.</summary>
    public string? SubscriptionExpiresAt { get; set; }
}
