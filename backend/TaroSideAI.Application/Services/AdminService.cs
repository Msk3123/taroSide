using Microsoft.AspNetCore.Identity;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Exceptions;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;
using TaroSideAI.Domain.Enums;

namespace TaroSideAI.Application.Services;

public class AdminService : IAdminService
{
    private readonly IAdminRepository _adminRepository;
    private readonly UserManager<AppUser> _userManager;

    public AdminService(IAdminRepository adminRepository, UserManager<AppUser> userManager)
    {
        _adminRepository = adminRepository;
        _userManager = userManager;
    }

    public async Task<List<AdminUserDto>> GetUsersAsync()
    {
        var users = await _adminRepository.GetAllUsersAsync();
        return users.Select(ToDto).ToList();
    }

    public Task<AdminStatsDto> GetStatsAsync()
        => _adminRepository.GetStatsAsync();

    public async Task<AdminUserDto?> ChangeUserRoleAsync(Guid userId, UserRole role)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null) return null;

        user.Role = role;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new ValidationException(string.Join(", ", result.Errors.Select(e => e.Description)));


        return ToDto(user);
    }

    public async Task<bool> DeleteUserAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null) return false;

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            throw new ValidationException(string.Join(", ", result.Errors.Select(e => e.Description)));

        return true;
    }

    private static AdminUserDto ToDto(AppUser user) => new()
    {
        Id = user.Id,
        UserName = user.UserName ?? string.Empty,
        Email = user.Email ?? string.Empty,
        Role = user.Role.ToString(),
        CreatedAt = user.CreatedAt,
        DailyChatMessagesUsed = user.DailyChatMessagesUsed,
        DailyQuestionsUsed = user.DailyQuestionsUsed
    };
}
