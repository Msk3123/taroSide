using System.Buffers.Text;
using System.Text;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Application.Exceptions;
using TaroSideAI.Application.Options;

namespace TaroSideAI.Application.Services;

public class AuthService : IAuthService
{
    private const string InvalidResetLink = "Посилання недійсне або застаріло. Запросіть новий лист для відновлення пароля";

    private readonly UserManager<AppUser> _userManager;
    private readonly TokenService _tokenService;
    private readonly IEmailSender _emailSender;
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<AuthService> _logger;

    public AuthService(UserManager<AppUser> userManager, TokenService tokenService, IEmailSender emailSender,
        EmailSettings emailSettings, ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _emailSender = emailSender;
        _emailSettings = emailSettings;
        _logger = logger;
    }

    public async Task<AuthResponseDto> SignInAsync(LoginDto loginDto)
    {
        // Форма входу приймає «пошту або ім'я», тож шукаємо за обома.
        // Trim — клавіатура телефона часто дописує пробіл після підказаного слова.
        var login = loginDto.UserName.Trim();
        var user = await _userManager.FindByNameAsync(login)
                   ?? await _userManager.FindByEmailAsync(login);
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

    public async Task RequestPasswordResetAsync(string email)
    {
        // Це налаштування всього сайту, а не конкретного акаунта, тож чесна помилка нічого не видає.
        if (!_emailSettings.IsConfigured)
            throw new ValidationException("Відновлення через пошту тимчасово недоступне. Напишіть нам, і ми допоможемо вручну");

        var user = await _userManager.FindByEmailAsync(email.Trim());
        if (user?.Email is null) return; // відповідь та сама, що й для наявної пошти

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = Base64Url.EncodeToString(Encoding.UTF8.GetBytes(token));
        var link = $"{_emailSettings.PublicSiteUrl.TrimEnd('/')}/reset" +
                   $"?uid={Uri.EscapeDataString(user.Id.ToString())}&token={encodedToken}";

        var body =
            $"Вітаємо, {user.UserName}!\n\n" +
            "Хтось запросив відновлення пароля для вашого акаунта Lunaris. " +
            "Щоб створити новий пароль, перейдіть за посиланням (воно діє 1 годину):\n\n" +
            $"{link}\n\n" +
            "Якщо це були не ви, просто проігноруйте цей лист: ваш пароль не зміниться.";

        try
        {
            await _emailSender.SendEmailAsync(user.Email, "Відновлення пароля Lunaris", body);
        }
        catch (Exception ex)
        {
            // Помилка лише для наявних акаунтів видала б, яка пошта зареєстрована, тому пишемо її в лог.
            _logger.LogError(ex, "Не вдалося надіслати лист для відновлення пароля користувачу {UserId}", user.Id);
        }
    }

    public async Task ResetPasswordAsync(ResetPasswordDto dto)
    {
        if (!Guid.TryParse(dto.UserId, out var userId))
            throw new ValidationException(InvalidResetLink);

        var user = await _userManager.FindByIdAsync(userId.ToString())
                   ?? throw new ValidationException(InvalidResetLink);

        string token;
        try
        {
            token = Encoding.UTF8.GetString(Base64Url.DecodeFromChars(dto.Token));
        }
        catch (FormatException)
        {
            throw new ValidationException(InvalidResetLink);
        }

        var result = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);
        if (!result.Succeeded)
            throw new ValidationException(string.Join(", ", result.Errors.Select(e => e.Description)));
    }
}
