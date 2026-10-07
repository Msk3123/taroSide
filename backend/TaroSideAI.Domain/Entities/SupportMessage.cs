namespace TaroSideAI.Domain.Entities;

// Повідомлення в чаті «користувач ↔ адмін». У кожного юзера рівно одна гілка,
// тому окрема сутність «тікет» не потрібна — гілку ідентифікує UserId.
public class SupportMessage
{
    public Guid Id { get; set; }

    // Чия це гілка (завжди користувач, навіть якщо пише адмін)
    public Guid UserId { get; set; }

    // true — написав адмін, false — користувач
    public bool FromAdmin { get; set; }

    public string Text { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Чи прочитала повідомлення ІНША сторона (для лічильника «нових»)
    public bool IsRead { get; set; }
}
