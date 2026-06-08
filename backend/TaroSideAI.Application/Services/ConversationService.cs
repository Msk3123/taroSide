using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;
using Microsoft.Extensions.AI;
namespace TaroSideAI.Application.Services;
public class ConversationService
{
    private readonly IConversationRepository _repo;
    private readonly IChatAiService _aiService;
    public ConversationService(IConversationRepository repo, IChatAiService aiService)
    {
        _repo = repo;
        _aiService = aiService;
    }
    public async Task<Conversation> CreateConversationAsync(Guid userId, string title)
    {
        var conv = new Conversation
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = string.IsNullOrWhiteSpace(title) ? "Новий розклад" : title,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        return await _repo.CreateAsync(conv);
    }
    public async Task<List<Conversation>> GetUserConversationsAsync(Guid userId)
    {
        return await _repo.GetAllByUserIdAsync(userId);
    }
    public async Task<Conversation> GetConversationByIdAsync(Guid id)
    {
        return await _repo.GetByIdAsync(id);
    }
    public async Task<string> ProcessUserMessageAsync(Guid conversationId, string message, int spreadId, CancellationToken ct)
    {
        var conv = await _repo.GetByIdAsync(conversationId);
        if (conv == null) throw new Exception("Чат не знайдено");
        // Зберігаємо повідомлення користувача
        var userMsg = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            Role = "user",
            Content = message,
            CreatedAt = DateTime.UtcNow
        };
        await _repo.AddMessageAsync(userMsg);
        // Формуємо історію для LLM (останні 10 повідомлень)
        var history = conv.Messages
            .OrderBy(m => m.CreatedAt)
            .TakeLast(10)
            .Select(m => new ChatMessage(m.Role == "user" ? ChatRole.User : ChatRole.Assistant, m.Content))
            .ToList();
        // LLM генерує відповідь
        var aiReply = await _aiService.ChatAsync(message, spreadId, history, ct);
        // Зберігаємо відповідь LLM
        var assistantMsg = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            Role = "assistant",
            Content = aiReply,
            CreatedAt = DateTime.UtcNow
        };
        await _repo.AddMessageAsync(assistantMsg);
        return aiReply;
    }
}
