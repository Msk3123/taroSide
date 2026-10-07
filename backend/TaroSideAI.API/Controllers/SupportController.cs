using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.API.Extensions;

namespace TaroSideAI.API.Controllers;

// Чат користувача з адміном (сторона користувача). Сторона адміна — в AdminController.
// UserId завжди беремо з JWT, а не з URL — тож прочитати чужу гілку неможливо (той самий захист від IDOR).
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SupportController : ControllerBase
{
    private readonly ISupportService _supportService;

    public SupportController(ISupportService supportService)
    {
        _supportService = supportService;
    }

    // GET /api/support — моє листування з підтримкою
    [HttpGet]
    public async Task<ActionResult<List<SupportMessageDto>>> GetMyThreadAsync()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();
        return Ok(await _supportService.GetMyThreadAsync(userId.Value));
    }

    // POST /api/support — написати адміну
    [HttpPost]
    public async Task<ActionResult<SupportMessageDto>> SendAsync([FromBody] SendSupportMessageDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();
        return Ok(await _supportService.SendFromUserAsync(userId.Value, dto.Text));
    }

    // GET /api/support/unread — скільки нових відповідей від адміна (для бейджа в меню)
    [HttpGet("unread")]
    public async Task<ActionResult<int>> GetUnreadAsync()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();
        return Ok(await _supportService.CountUnreadForUserAsync(userId.Value));
    }
}
