using TaroSideAI.Domain.Enums;

namespace TaroSideAI.Domain.Entities;

public class Spread
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CardCount { get; set; }

    // Мінімальна роль для використання цього розкладу
    public UserRole RequiredRole { get; set; } = UserRole.Free;

    public ICollection<Reading> Readings { get; set; } = [];
    
    public bool IsFreeMode { get; set; }
}
