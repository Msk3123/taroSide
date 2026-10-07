namespace TaroSideAI.Domain.Entities;

// Карта дня: один запис на (користувач, дата).
// Зберігаємо в БД, щоб протягом дня юзер бачив ту саму карту, а не нову при кожному запиті.
public class DailyCard
{
    public int Id { get; set; }

    public Guid UserId { get; set; }

    // Дата за UTC, для якої витягнута карта
    public DateOnly Date { get; set; }

    public int CardId { get; set; }
    public TarotCard Card { get; set; } = null!;

    // true = перевернута карта (інше значення)
    public bool IsReversed { get; set; }
}
