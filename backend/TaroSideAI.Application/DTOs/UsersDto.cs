using TaroSideAI.Domain.Enums;

namespace TaroSideAI.Application.DTOs;


public class CreateUsersDto
{
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    public string UserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class UpdateUserDto
{
    public string? UserName { get; set; }
    public string? Email { get; set; }
}