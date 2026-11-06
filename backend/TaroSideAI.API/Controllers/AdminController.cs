using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Enums;
namespace TaroSideAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")] // весь контролер лише для адмінів — роль береться з JWT
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly IAnalyticsService _analyticsService;
    private readonly ISupportService _supportService;
    private readonly IPromoService _promoService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IAdminService adminService, IAnalyticsService analyticsService, ISupportService supportService,
        IPromoService promoService, ILogger<AdminController> logger)
    {
        _promoService = promoService;
        _logger = logger;
        _adminService = adminService;
        _analyticsService = analyticsService;
        _supportService = supportService;
    }

    // GET /api/admin/users — список усіх користувачів
    [HttpGet("users")]
    public async Task<ActionResult<List<AdminUserDto>>> GetUsersAsync()
    {
        return Ok(await _adminService.GetUsersAsync());
    }

    // GET /api/admin/stats — лічильники для дашборду
    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsDto>> GetStatsAsync()
    {
        return Ok(await _adminService.GetStatsAsync());
    }

    // GET /api/admin/users/{id} — профіль + активність користувача
    [HttpGet("users/{id:guid}")]
    public async Task<ActionResult<AdminUserDetailsDto>> GetUserAsync(Guid id)
    {
        var user = await _adminService.GetUserDetailsAsync(id);
        if (user is null) return NotFound("Користувача не знайдено");
        return Ok(user);
    }

    // GET /api/admin/users/{id}/conversations — список розмов користувача
    [HttpGet("users/{id:guid}/conversations")]
    public async Task<ActionResult<List<AdminConversationDto>>> GetUserConversationsAsync(Guid id)
    {
        var conversations = await _adminService.GetUserConversationsAsync(id);
        if (conversations is null) return NotFound("Користувача не знайдено");
        return Ok(conversations);
    }

    // GET /api/admin/users/{id}/conversations/{conversationId} — повідомлення розмови.
    // Кожен перегляд особистої переписки пишемо в лог: хто, чию і яку (без тексту).
    [HttpGet("users/{id:guid}/conversations/{conversationId:guid}")]
    public async Task<ActionResult<List<AdminMessageDto>>> GetUserConversationAsync(Guid id, Guid conversationId)
    {
        var messages = await _adminService.GetUserConversationMessagesAsync(id, conversationId);
        if (messages is null) return NotFound("Розмову не знайдено");

        _logger.LogInformation("Admin {AdminId} viewed conversation {ConversationId} of user {UserId}",
            User.FindFirstValue(ClaimTypes.NameIdentifier), conversationId, id);
        return Ok(messages);
    }

    // Промокоди: список, створення, увімкнення/вимкнення, видалення невикористаних
    [HttpGet("promos")]
    public async Task<ActionResult<List<PromoDto>>> GetPromosAsync()
    {
        return Ok(await _promoService.GetAllAsync());
    }

    [HttpPost("promos")]
    public async Task<ActionResult<PromoDto>> CreatePromoAsync([FromBody] CreatePromoDto dto)
    {
        return Ok(await _promoService.CreateAsync(dto));
    }

    [HttpPut("promos/{id:guid}/active")]
    public async Task<IActionResult> SetPromoActiveAsync(Guid id, [FromBody] SetPromoActiveDto dto)
    {
        await _promoService.SetActiveAsync(id, dto.IsActive);
        return NoContent();
    }

    [HttpDelete("promos/{id:guid}")]
    public async Task<IActionResult> DeletePromoAsync(Guid id)
    {
        await _promoService.DeleteAsync(id);
        return NoContent();
    }

    // PUT /api/admin/users/{id}/subscription — видати тариф на N днів (або безстроково)
    [HttpPut("users/{id:guid}/subscription")]
    public async Task<ActionResult<AdminUserDto>> GrantSubscriptionAsync(Guid id, [FromBody] GrantSubscriptionDto dto)
    {
        if (!Enum.TryParse<UserRole>(dto.Role, ignoreCase: true, out var role))
            return BadRequest($"Невідома роль: {dto.Role}");

        var updated = await _adminService.GrantSubscriptionAsync(id, role, dto.Days);
        if (updated is null) return NotFound("Користувача не знайдено");
        return Ok(updated);
    }

    // GET /api/admin/analytics?days=30 — відвідуваність, топ сторінок, воронка
    [HttpGet("analytics")]
    public async Task<ActionResult<AnalyticsSummaryDto>> GetAnalyticsAsync([FromQuery] int days = 30)
    {
        return Ok(await _analyticsService.GetSummaryAsync(days));
    }

    // GET /api/admin/support — «вхідні»: по гілці на кожного, хто писав
    [HttpGet("support")]
    public async Task<ActionResult<List<SupportThreadDto>>> GetSupportThreadsAsync()
    {
        return Ok(await _supportService.GetThreadsAsync());
    }

    // GET /api/admin/support/{userId} — листування з конкретним користувачем
    [HttpGet("support/{userId:guid}")]
    public async Task<ActionResult<List<SupportMessageDto>>> GetSupportThreadAsync(Guid userId)
    {
        return Ok(await _supportService.GetThreadForAdminAsync(userId));
    }

    // POST /api/admin/support/{userId} — відповісти користувачу
    [HttpPost("support/{userId:guid}")]
    public async Task<ActionResult<SupportMessageDto>> ReplySupportAsync(Guid userId, [FromBody] SendSupportMessageDto dto)
    {
        if (await _adminService.GetUserDetailsAsync(userId) is null)
            return NotFound("Користувача не знайдено");
        return Ok(await _supportService.ReplyFromAdminAsync(userId, dto.Text));
    }

    // PUT /api/admin/users/{id}/role — змінити тариф/роль користувача
    [HttpPut("users/{id:guid}/role")]
    public async Task<ActionResult<AdminUserDto>> ChangeRoleAsync(Guid id, [FromBody] ChangeUserRoleDto dto)
    {
        if (!Enum.TryParse<UserRole>(dto.Role, ignoreCase: true, out var role))
            return BadRequest($"Невідома роль: {dto.Role}");

        // Адмін не може розжалувати сам себе — інакше можна залишитись без адмінів
        if (IsSelf(id))
            return BadRequest("Не можна змінювати власну роль");

        var updated = await _adminService.ChangeUserRoleAsync(id, role);
        if (updated is null) return NotFound("Користувача не знайдено");
        return Ok(updated);
    }

    // DELETE /api/admin/users/{id} — видалити користувача
    [HttpDelete("users/{id:guid}")]
    public async Task<ActionResult> DeleteUserAsync(Guid id)
    {
        if (IsSelf(id))
            return BadRequest("Не можна видалити власний акаунт з адмінки");

        var deleted = await _adminService.DeleteUserAsync(id);
        if (!deleted) return NotFound("Користувача не знайдено");
        return NoContent();
    }

    private bool IsSelf(Guid id)
    {
        var currentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return currentId != null && Guid.TryParse(currentId, out var g) && g == id;
    }
}
