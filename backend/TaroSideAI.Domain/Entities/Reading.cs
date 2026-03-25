namespace TaroSideAI.Domain.Entities;

public class Reading
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Nullable — гість може робити розклад без реєстрації
    public Guid? UserId { get; set; }
    public AppUser? User { get; set; }

    public int SpreadId { get; set; }
    public Spread Spread { get; set; } = null!;

    public string UserQuestion { get; set; } = string.Empty;
    public string AiResponse { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ReadingCard> ReadingCards { get; set; } = [];
}
