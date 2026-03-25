using TaroSideAI.Domain.Enums;

namespace TaroSideAI.Domain.Entities;

public class TarotCard
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NameUkr { get; set; } = string.Empty;
    public Arcana Arcana { get; set; }

    // Null для Старших Арканів (Major) — у них немає масті
    public Suit? Suit { get; set; }

    public string UprightMeaning { get; set; } = string.Empty;
    public string ReversedMeaning { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }

    public ICollection<ReadingCard> ReadingCards { get; set; } = [];
}
