using System.Text.RegularExpressions;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Services;

public class AnalyticsService : IAnalyticsService
{
    // Білий список типів подій: ендпоінт анонімний, тож довільні рядки в БД не пускаємо
    private static readonly HashSet<string> AllowedTypes = ["page_view", "guest_message", "buy_click"];

    private static readonly Regex VisitorIdPattern = new("^[A-Za-z0-9-]{8,64}$", RegexOptions.Compiled);

    private readonly IAnalyticsRepository _repository;

    public AnalyticsService(IAnalyticsRepository repository)
    {
        _repository = repository;
    }

    public async Task TrackAsync(TrackEventDto dto, Guid? userId)
    {
        if (!AllowedTypes.Contains(dto.Type ?? string.Empty)) return;
        if (!VisitorIdPattern.IsMatch(dto.VisitorId ?? string.Empty)) return;

        var path = NormalizePath(dto.Path);
        if (path is null) return;

        await _repository.AddAsync(new AnalyticsEvent
        {
            VisitorId = dto.VisitorId!,
            UserId = userId,
            Type = dto.Type!,
            Path = path,
            CreatedAt = DateTime.UtcNow
        });
    }

    public Task<AnalyticsSummaryDto> GetSummaryAsync(int days)
        => _repository.GetSummaryAsync(Math.Clamp(days, 1, 365));

    /// <summary>
    /// Лишаємо тільки шлях: без ?query і #hash (там можуть бути токени, напр. у /reset?token=...).
    /// /card/17 → /card/:id, щоб 78 карт не розмазували топ сторінок.
    /// </summary>
    private static string? NormalizePath(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw) || raw[0] != '/') return null;

        var path = raw.Split('?', '#')[0].TrimEnd('/');
        if (path.Length == 0) path = "/";
        if (path.StartsWith("/card/")) path = "/card/:id";

        return path.Length > 200 ? path[..200] : path;
    }
}
