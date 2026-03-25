namespace TaroSideAI.Domain.Entities;

// Pivot-таблиця: яка карта на якій позиції в якому розкладі випала
public class ReadingCard
{
    public int Id { get; set; }

    public Guid ReadingId { get; set; }
    public Reading Reading { get; set; } = null!;

    public int CardId { get; set; }
    public TarotCard Card { get; set; } = null!;

    // Порядкова позиція карти в розкладі (1, 2, 3...)
    public int Position { get; set; }

    // true = перевернута карта (інше значення)
    public bool IsReversed { get; set; }
}
