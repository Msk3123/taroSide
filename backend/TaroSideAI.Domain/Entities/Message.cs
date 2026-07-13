namespace TaroSideAI.Domain.Entities;

public class Message
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public Guid ReadingId { get; set;}

    // Карти, що випали в цьому повідомленні, у вигляді JSON (масив DrawnCardDto).
    // null/порожньо — якщо розкладу не було (звичайний діалог).
    // Завдяки цьому при повторному відкритті розмови картки не зникають.
    public string? CardsJson { get; set; }
}