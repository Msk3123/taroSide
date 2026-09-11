using System.Text.Json;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;
using Microsoft.Extensions.AI;
namespace TaroSideAI.Application.Services;
public class ConversationService : IConversationService
{
    private readonly IConversationRepository _repo;
    private readonly IChatAiService _aiService;
    private readonly IUserService _userService;

    // camelCase, щоб збережений JSON карт мав той самий вигляд, що й «жива» відповідь.
    private static readonly JsonSerializerOptions JsonCamelCase =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    public ConversationService(IConversationRepository repo, IChatAiService aiService, IUserService userService)
    {
        _repo = repo;
        _aiService = aiService;
        _userService = userService;
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
    public async Task<ChatResultDto> ProcessUserMessageAsync(Guid conversationId, string message, Guid userId, int spreadId, CancellationToken ct)
    {
        
        var conv = await _repo.GetByIdAsync(conversationId);
        if (conv == null || conv.UserId != userId) throw new Exception("Чат не знайдено");

       
        var allowance = await _userService.CheckMessageAllowanceAsync(conv.UserId);
        
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
        // LLM генерує відповідь (текст + карти)
        var result = await _aiService.ChatAsync(message, spreadId, history, allowance.CanDraw, allowance.MaxCards, ct);
        // Карти зберігаємо як JSON у самому повідомленні, щоб при повторному
        // відкритті розмови вони не зникали. camelCase — щоб формат збігався з
        // «живою» відповіддю (ChatReply.cards), яку фронт уже вміє малювати.
        var cardsJson = result.Cards.Count > 0
            ? JsonSerializer.Serialize(result.Cards, JsonCamelCase)
            : null;

        // У БД зберігаємо текст відповіді + карти (якщо випали).
        var assistantMsg = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            Role = "assistant",
            Content = result.Reply,
            CreatedAt = DateTime.UtcNow,
            CardsJson = cardsJson
        };
        await _repo.AddMessageAsync(assistantMsg);

        // Фіксуємо використання: +1 повідомлення, +1 розклад якщо випали карти.
        await _userService.RegisterMessageAsync(conv.UserId, result.Cards.Count > 0);

        return result;
    }
}
