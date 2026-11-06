using TaroSideAI.Application.DTOs;

namespace TaroSideAI.Application.Interfaces;

public interface IAuthService
{
    public Task<AuthResponseDto> SignInAsync(LoginDto loginDto);

    /// <summary>Зміна пароля авторизованого користувача (перевіряє поточний пароль).</summary>
    public Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto);

    /// <summary>Надсилає лист із посиланням на скидання пароля, якщо така пошта зареєстрована.</summary>
    public Task RequestPasswordResetAsync(string email);

    /// <summary>Встановлює новий пароль за токеном із листа.</summary>
    public Task ResetPasswordAsync(ResetPasswordDto dto);
}