using TaroSideAI.Application.DTOs;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Interfaces;

public interface IConversationService
{
    public Task<Conversation> CreateConversationAsync(Guid userId, string title);
    public Task<List<Conversation>> GetUserConversationsAsync(Guid userId);
    public Task<Conversation> GetConversationByIdAsync(Guid id);
    // Повертає текст + витягнуті карти (а не лише string).
    // birthDate != null → комбіноване гадання (Таро + Матриця Долі).
    public Task<ChatResultDto> ProcessUserMessageAsync(Guid conversationId, string message, Guid userId, int spreadId, DateOnly? birthDate, CancellationToken ct);
}
