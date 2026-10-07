namespace TaroSideAI.Domain.Entities;

// Одна подія аналітики: «хтось відкрив сторінку» або «гість спробував написати в чат».
// Зберігаємо ЛИШЕ технічне: шлях і тип події. Тексти запитів користувачів сюди не потрапляють.
public class AnalyticsEvent
{
    public long Id { get; set; }

    // Анонімний id браузера (генерується на фронті й живе в localStorage).
    // Потрібен, щоб рахувати унікальних відвідувачів, а не перезавантаження сторінки.
    public string VisitorId { get; set; } = string.Empty;

    // Якщо людина залогінена — хто саме (null для гостей)
    public Guid? UserId { get; set; }

    // page_view | guest_message | buy_click — див. AnalyticsService.AllowedTypes
    public string Type { get; set; } = string.Empty;

    public string Path { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
