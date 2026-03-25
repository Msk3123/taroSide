using TaroSideAI.Application.DTOs;
using TaroSideAI.Domain.Entities;
using TaroSideAI.Domain.Enums;
using Microsoft.AspNetCore.Identity;
namespace TaroSideAI.Application.Services;

public class UserService
{
    private readonly UserManager<AppUser> _userManager;
    
    public UserService( UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }
    
    public async Task<AppUser> CreateUserAsync (CreateUsersDto createUsersDto)
    {
        var user = new AppUser
        {
            UserName = createUsersDto.UserName,
            Email = createUsersDto.Email,
            Role = UserRole.Free
        };
        
        var result = await _userManager.CreateAsync(user, createUsersDto.Password);

        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

        return user;
    }
    
    public async Task<AppUser> UpdateUserAsync(AppUser user)
    {
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        await _userManager.UpdateSecurityStampAsync(user);
        return user;
    }
    
    public async Task<AppUser> DeleteUserAsync(AppUser user)
    {
        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        return user;
    }
    
    
    
    public async Task<AppUser?> GetUserByIdAsync(Guid id)
    {
        return await _userManager.FindByIdAsync(id.ToString());
    }

}