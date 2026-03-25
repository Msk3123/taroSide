using TaroSideAI.Application.DTOs;
using TaroSideAI.Domain.Entities;
using Microsoft.AspNetCore.Identity;
namespace TaroSideAI.Application.Services;

public class AuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly TokenService _tokenService;
    
    public AuthService(UserManager<AppUser> userManager, TokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }
    
    public async Task<AuthResponseDto> SignInAsync(LoginDto loginDto)
    {
        var user = await _userManager.FindByNameAsync(loginDto.UserName);
        if (user == null)
        {
            throw new Exception("Invalid username or password");
        }
        
        var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);
        if (!result)
        {
                throw new Exception("Invalid username or password");
        }
        
        var userJwt = _tokenService.GenerateToken(user);
        
        return new AuthResponseDto()
        {
            UserName = user.UserName ?? "",
            Role = user.Role.ToString(),
            Token = userJwt
        };
    }
    
}