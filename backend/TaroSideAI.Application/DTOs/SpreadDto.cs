using TaroSideAI.Domain.Enums;

namespace TaroSideAI.Application.DTOs;


public class SpreadUpdateDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? CardCount { get; set; }
}

public class SpreadCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CardCount { get; set; }
    public UserRole RequiredRole { get; set; } = UserRole.Free;
}

public class SpreadResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CardCount { get; set; }
    public UserRole RequiredRole { get; set; }
    public bool IsFreeMode { get; set; }
}