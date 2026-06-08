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

    /// <summary>ISO-8601 момент, коли лічильники обнуляться (наступна доба UTC).</summary>
    public string ResetsAt { get; set; } = string.Empty;
}
