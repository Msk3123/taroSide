using TaroSideAI.Application.DTOs;

namespace TaroSideAI.Application.Interfaces;

public interface IAnalyticsService
{
    /// <summary>Записує подію. Некоректні події мовчки ігноруються — аналітика не має ламати сайт.</summary>
    Task TrackAsync(TrackEventDto dto, Guid? userId);

    Task<AnalyticsSummaryDto> GetSummaryAsync(int days);
}
