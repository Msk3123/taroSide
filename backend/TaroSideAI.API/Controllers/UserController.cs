using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;
namespace TaroSideAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]

public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    public UserController(IUserService userService)
    {
        _userService = userService;
    }
    
    
    [Authorize] 
    [HttpPut("{id:guid}")]
    
    public async Task<ActionResult<object>> UpdateUserAsync(Guid id, [FromBody] UpdateUserDto updateDto)    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user is null) return NotFound("Користувача не знайдено");
        if (updateDto.UserName != null)
            user.UserName = updateDto.UserName;
        if (updateDto.Email != null)
            user.Email = updateDto.Email;
        var updatedUser = await _userService.UpdateUserAsync(user);
        
        return Ok(new
        {
            updatedUser.Id,
            updatedUser.UserName,
            updatedUser.Email,
        });
    }
    [Authorize] 
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<AppUser>> DeleteUserAsync(Guid id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user is null)
        {
            return NotFound("такого користувача нема");
        }
        await _userService.DeleteUserAsync(user);
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult> GetCurrentUserAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();
        var user = await _userService.GetUserByIdAsync(Guid.Parse(userId));
        if (user is null) return NotFound();
        return Ok(new
        {
            user.Id,
            user.UserName,
            user.Email,
            Role = user.Role.ToString(),
            user.CreatedAt,
        });

    }

    // Поточне використання денних лімітів + межі тарифу (для сайдбару чату й профілю).
    [Authorize]
    [HttpGet("usage")]
    public async Task<ActionResult<UserUsageDto>> GetUsageAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();
        var usage = await _userService.GetUsageAsync(Guid.Parse(userId));
        return Ok(usage);
    }

}