using Microsoft.AspNetCore.Mvc;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Services;
namespace TaroSideAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly UserService _userService;
    public AuthController(AuthService authService, UserService userService) : base()
    {
        _authService = authService;
        _userService = userService;
    }
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> LoginAsync([FromBody] LoginDto loginDto)
    {
        try
        {
            return Ok(await _authService.SignInAsync(loginDto));
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }
    
    [HttpPost("register")]
    public async Task<ActionResult<object>> CreateUserAsync([FromBody] CreateUsersDto createUsersDto)
    {
        try
        {
            var user = await _userService.CreateUserAsync(createUsersDto);
            return Ok(new { user.Id, user.UserName, user.Email });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    
}