using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.API.Extensions;

namespace TaroSideAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    // POST /api/analytics/track — фронт повідомляє «відкрили сторінку».
    // AllowAnonymous: гостей теж рахуємо. Якщо JWT є — User заповнений і подія прив'яжеться до юзера.
    // Звіти читає лише адмін: GET /api/admin/analytics.
    [AllowAnonymous]
    [HttpPost("track")]
    public async Task<IActionResult> TrackAsync([FromBody] TrackEventDto dto)
    {
        await _analyticsService.TrackAsync(dto, User.GetUserId());
        return NoContent();
    }
}
