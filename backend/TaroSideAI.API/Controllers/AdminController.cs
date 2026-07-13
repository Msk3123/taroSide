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

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
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
