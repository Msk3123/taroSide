using TaroSideAI.Application.DTOs;
using TaroSideAI.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Application.Exceptions;

namespace TaroSideAI.Application.Services;

public class AuthService : IAuthService
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
            throw new InvalidCredentialsException();
        }
        
        var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);
        if (!result)
        {
                throw new InvalidCredentialsException();
        }
        
        var userJwt = _tokenService.GenerateToken(user);
        
        return new AuthResponseDto()
        {
            UserName = user.UserName ?? "",
            Role = user.Role.ToString(),
            Token = userJwt
        };
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
                   ?? throw new NotFoundException("Користувач");

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
            throw new ValidationException(string.Join(", ", result.Errors.Select(e => e.Description)));
    }

}