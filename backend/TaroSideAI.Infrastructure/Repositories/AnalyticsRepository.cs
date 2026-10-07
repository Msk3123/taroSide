using Microsoft.EntityFrameworkCore;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;
using TaroSideAI.Domain.Enums;
using TaroSideAI.Infrastructure.Persistence;

namespace TaroSideAI.Infrastructure.Repositories;

public class AnalyticsRepository : IAnalyticsRepository
{
    private readonly AppDbContext _context;

    public AnalyticsRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(AnalyticsEvent e)
    {
        _context.AnalyticsEvents.Add(e);
        await _context.SaveChangesAsync();
    }

    public async Task<AnalyticsSummaryDto> GetSummaryAsync(int days)
    {
        var since = DateTime.UtcNow.Date.AddDays(-(days - 1));

        // Тягнемо в пам'ять лише 3 легкі колонки переглядів за період і групуємо в C#.
        // Для сайту з сотнями відвідувачів на день це копійки. Коли подій стане мільйони —
        // ці групування треба переносити в SQL (GROUP BY) або в окремі агреговані таблиці.
        var views = await _context.AnalyticsEvents
            .AsNoTracking()
            .Where(e => e.Type == "page_view" && e.CreatedAt >= since)
            .Select(e => new { e.VisitorId, e.Path, e.CreatedAt })
            .ToListAsync();

        var daily = Enumerable.Range(0, days)
            .Select(i => since.AddDays(i))
            .Select(day =>
            {
                var dayViews = views.Where(v => v.CreatedAt.Date == day).ToList();
                return new AnalyticsDayDto
                {
                    Date = day.ToString("yyyy-MM-dd"),
                    PageViews = dayViews.Count,
                    Visitors = dayViews.Select(v => v.VisitorId).Distinct().Count()
                };
            })
            .ToList();

        var topPages = views
            .GroupBy(v => v.Path)
            .Select(g => new AnalyticsPageDto
            {
                Path = g.Key,
                Views = g.Count(),
                Visitors = g.Select(v => v.VisitorId).Distinct().Count()
            })
            .OrderByDescending(p => p.Visitors)
            .Take(15)
            .ToList();

        var visitors = views.Select(v => v.VisitorId).Distinct().Count();
        var openedRegister = views.Where(v => v.Path == "/register").Select(v => v.VisitorId).Distinct().Count();
        var bounced = views.GroupBy(v => v.VisitorId).Count(g => g.Count() == 1);

        // Воронка після реєстрації рахується з реальних таблиць, а не з подій —
        // так вона не залежить від того, чи спрацював трекер на фронті.
        var newUsers = _context.Users.Where(u => u.CreatedAt >= since);
        var registered = await newUsers.CountAsync();
        var chatted = await newUsers.CountAsync(u => _context.Conversations.Any(c => c.UserId == u.Id));
        var gotReading = await newUsers.CountAsync(u =>
            _context.Conversations.Any(c => c.UserId == u.Id && c.Messages.Any(m => m.CardsJson != null)));
        var paid = await newUsers.CountAsync(u => u.Role == UserRole.Premium || u.Role == UserRole.Vip);

        var guestTries = await CountVisitorsAsync("guest_message", since);
        var buyClicks = await CountVisitorsAsync("buy_click", since);

        return new AnalyticsSummaryDto
        {
            Days = days,
            Visitors = visitors,
            PageViews = views.Count,
            BouncedVisitors = bounced,
            Daily = daily,
            TopPages = topPages,
            Funnel =
            [
                new() { Step = "Відвідали сайт", Count = visitors },
                new() { Step = "Відкрили реєстрацію", Count = openedRegister },
                new() { Step = "Зареєструвались", Count = registered },
                new() { Step = "Написали в чат", Count = chatted },
                new() { Step = "Отримали розклад", Count = gotReading },
                new() { Step = "Мають Premium / VIP", Count = paid },
            ],
            Signals =
            [
                new() { Step = "Гості пробували писати в чат", Count = guestTries },
                new() { Step = "Натиснули «Купити» на тарифах", Count = buyClicks },
            ]
        };
    }

    private Task<int> CountVisitorsAsync(string type, DateTime since)
        => _context.AnalyticsEvents
            .Where(e => e.Type == type && e.CreatedAt >= since)
            .Select(e => e.VisitorId)
            .Distinct()
            .CountAsync();
}
