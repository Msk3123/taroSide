using TaroSideAI.Domain.Enums;

namespace TaroSideAI.Application.DTOs;

// DTO — це "конверт" з даними від юзера.
// Тут тільки те, що юзер має право надіслати.
// Id не приймаємо — БД генерує сама.
// ReadingCards не приймаємо — це внутрішній зв'язок.
public class CreateTarotCardDto
{
    public string Name { get; set; } = string.Empty;
    public string NameUkr { get; set; } = string.Empty;
    public Arcana Arcana { get; set; }

    // Nullable — для Major Arcana масть не потрібна
    public Suit? Suit { get; set; }

    public string UprightMeaning { get; set; } = string.Empty;
    public string ReversedMeaning { get; set; } = string.Empty;
    public string Keywords { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}
