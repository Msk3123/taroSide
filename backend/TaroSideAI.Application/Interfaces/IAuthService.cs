using TaroSideAI.Application.DTOs;

namespace TaroSideAI.Application.Interfaces;

public interface IAuthService
{
    public Task<AuthResponseDto> SignInAsync(LoginDto loginDto);

    /// <summary>Зміна пароля авторизованого користувача (перевіряє поточний пароль).</summary>
    public Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
}