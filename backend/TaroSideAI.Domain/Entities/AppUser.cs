using Microsoft.AspNetCore.Identity;
using TaroSideAI.Domain.Enums;

namespace TaroSideAI.Domain.Entities;

// Наслідуємо IdentityUser щоб отримати Email, PasswordHash, SecurityStamp і т.д. безкоштовно
// Guid як тип ID — краще за int для безпеки (не можна вгадати наступний ID)
public class AppUser : IdentityUser<Guid>
{
    public UserRole Role { get; set; } = UserRole.Free;
    public int DailyQuestionsUsed { get; set; } = 0;
    public DateOnly DailyQuestionsReset { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Навігаційні властивості для EF Core
    public ICollection<Reading> Readings { get; set; } = [];
}
