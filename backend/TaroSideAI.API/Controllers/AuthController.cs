using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Interfaces;
namespace TaroSideAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserService _userService;
    public AuthController(IAuthService authService, IUserService userService) : base()
    {
        _authService = authService;
        _userService = userService;
    }
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> LoginAsync([FromBody] LoginDto loginDto)
    {
        return Ok(await _authService.SignInAsync(loginDto));
    }
    
    [HttpPost("register")]
    public async Task<ActionResult<object>> CreateUserAsync([FromBody] CreateUsersDto createUsersDto)
    {
        var user = await _userService.CreateUserAsync(createUsersDto);
        return Ok(new { user.Id, user.UserName, user.Email });
    }
    
    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePasswordAsync([FromBody] ChangePasswordDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();
        await _authService.ChangePasswordAsync(Guid.Parse(userId), dto);
        return NoContent();
    }

}