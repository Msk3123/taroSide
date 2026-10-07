namespace TaroSideAI.Application.DTOs;

public class SupportMessageDto
{
    public Guid Id { get; set; }
    public bool FromAdmin { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

// Тіло POST /api/support і POST /api/admin/support/{userId}
public class SendSupportMessageDto
{
    public string Text { get; set; } = string.Empty;
}

// Рядок у «вхідних» адміна: одна гілка = один користувач.
public class SupportThreadDto
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string LastText { get; set; } = string.Empty;
    public bool LastFromAdmin { get; set; }
    public DateTime LastAt { get; set; }
    public int Unread { get; set; }   // непрочитані адміном повідомлення юзера
}
