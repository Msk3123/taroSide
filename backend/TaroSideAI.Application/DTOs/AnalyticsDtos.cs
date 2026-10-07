namespace TaroSideAI.Application.DTOs;

// Тіло POST /api/analytics/track — те, що надсилає фронт.
public class TrackEventDto
{
    public string VisitorId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
}

// Відповідь GET /api/admin/analytics — усе для вкладки «Аналітика».
public class AnalyticsSummaryDto
{
    public int Days { get; set; }
    public int Visitors { get; set; }          // унікальні браузери
    public int PageViews { get; set; }
    public int BouncedVisitors { get; set; }   // переглянули лише одну сторінку й пішли
    public List<AnalyticsDayDto> Daily { get; set; } = [];
    public List<AnalyticsPageDto> TopPages { get; set; } = [];
    public List<FunnelStepDto> Funnel { get; set; } = [];

    // Окремі сигнали інтересу, що не є кроками воронки (гість хотів погадати, хтось хотів купити)
    public List<FunnelStepDto> Signals { get; set; } = [];
}

public class AnalyticsDayDto
{
    public string Date { get; set; } = string.Empty;   // yyyy-MM-dd
    public int Visitors { get; set; }
    public int PageViews { get; set; }
}

public class AnalyticsPageDto
{
    public string Path { get; set; } = string.Empty;
    public int Views { get; set; }
    public int Visitors { get; set; }
}

// Крок воронки: «скільки людей дійшло до цього місця». Різниця між сусідніми кроками = де відпадають.
public class FunnelStepDto
{
    public string Step { get; set; } = string.Empty;
    public int Count { get; set; }
}
