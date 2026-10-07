namespace TaroSideAI.Application.DTOs;

// Рядок таблиці користувачів в адмінці.
// Role — рядок (не enum), щоб фронт отримував "Premium", а не число.
public class AdminUserDto
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int DailyChatMessagesUsed { get; set; }
    public int DailyQuestionsUsed { get; set; }
    public DateTime? SubscriptionExpiresAt { get; set; }
}

// Картка користувача в адмінці: профіль + активність. Вміст розкладів/чатів свідомо НЕ віддаємо —
// адмін бачить цифри, а не особисті питання людини (див. принцип «Конфіденційність» на сторінці About).
public class AdminUserDetailsDto : AdminUserDto
{
    public int ConversationsCount { get; set; }
    public int MessagesCount { get; set; }
    public int ReadingsCount { get; set; }          // повідомлення, у яких випали карти
    public DateTime? LastActiveAt { get; set; }
    public int ReadingsLimit { get; set; }
    public int ChatMessagesLimit { get; set; }
    public int MaxCards { get; set; }
    public int SupportMessagesCount { get; set; }
}

// Тіло PUT /api/admin/users/{id}/subscription.
// Days = null → безстроково. Role = "Free" → підписку знято.
public class GrantSubscriptionDto
{
    public string Role { get; set; } = string.Empty;
    public int? Days { get; set; }
}

// Загальна статистика для дашборду адмінки.
public class AdminStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalConversations { get; set; }
    public int TotalMessages { get; set; }
    public int TotalCards { get; set; }
}

// Тіло PUT /api/admin/users/{id}/role. Role — рядок ("Free", "Premium"...),
// бо глобального JsonStringEnumConverter немає і enum з рядка сам не збіндиться.
public class ChangeUserRoleDto
{
    public string Role { get; set; } = string.Empty;
}
