using TaroSideAI.Application.DTOs;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Interfaces;

public interface IAnalyticsRepository
{
    Task AddAsync(AnalyticsEvent e);

    /// <summary>Зведення за останні <paramref name="days"/> днів (UTC).</summary>
    Task<AnalyticsSummaryDto> GetSummaryAsync(int days);
}
