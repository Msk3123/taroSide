using Microsoft.AspNetCore.Identity;

namespace TaroSideAI.API.Errors;

/// <summary>Тексти помилок Identity, які бачить користувач у формах реєстрації та профілю.</summary>
public class UkrainianIdentityErrorDescriber : IdentityErrorDescriber
{
    public override IdentityError InvalidUserName(string? userName) => new()
    {
        Code = nameof(InvalidUserName),
        Description = "Ім'я може містити лише літери, цифри, апостроф і символи - . _ @ +, без пробілів"
    };

    public override IdentityError DuplicateUserName(string userName) => new()
    {
        Code = nameof(DuplicateUserName),
        Description = $"Ім'я «{userName}» вже зайняте"
    };

    public override IdentityError InvalidEmail(string? email) => new()
    {
        Code = nameof(InvalidEmail),
        Description = "Перевірте адресу пошти: схоже, у ній помилка"
    };

    public override IdentityError DuplicateEmail(string email) => new()
    {
        Code = nameof(DuplicateEmail),
        Description = "Обліковий запис із такою поштою вже існує"
    };

    public override IdentityError PasswordTooShort(int length) => new()
    {
        Code = nameof(PasswordTooShort),
        Description = $"Пароль має містити щонайменше {length} символів"
    };

    public override IdentityError PasswordRequiresDigit() => new()
    {
        Code = nameof(PasswordRequiresDigit),
        Description = "Пароль має містити хоча б одну цифру"
    };

    public override IdentityError PasswordRequiresLower() => new()
    {
        Code = nameof(PasswordRequiresLower),
        Description = "Пароль має містити хоча б одну малу латинську літеру (a–z)"
    };

    public override IdentityError PasswordRequiresUpper() => new()
    {
        Code = nameof(PasswordRequiresUpper),
        Description = "Пароль має містити хоча б одну велику латинську літеру (A–Z)"
    };

    public override IdentityError InvalidToken() => new()
    {
        Code = nameof(InvalidToken),
        Description = "Посилання недійсне або застаріло. Запросіть новий лист для відновлення пароля"
    };

    public override IdentityError PasswordMismatch() => new()
    {
        Code = nameof(PasswordMismatch),
        Description = "Поточний пароль введено неправильно"
    };
}
