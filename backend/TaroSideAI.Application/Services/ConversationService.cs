using System.Text.Json;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Exceptions;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;
using Microsoft.Extensions.AI;
namespace TaroSideAI.Application.Services;
public class ConversationService : IConversationService
{
    private readonly IConversationRepository _repo;
    private readonly IChatAiService _aiService;
    private readonly IUserService _userService;
    private readonly IMatrixService _matrixService;

    // camelCase, щоб збережений JSON карт мав той самий вигляд, що й «жива» відповідь.
    private static readonly JsonSerializerOptions JsonCamelCase =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    public ConversationService(IConversationRepository repo, IChatAiService aiService, IUserService userService,
        IMatrixService matrixService)
    {
        _matrixService = matrixService;
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
    public async Task<ChatResultDto> ProcessUserMessageAsync(Guid conversationId, string message, Guid userId, int spreadId, DateOnly? birthDate, CancellationToken ct)
    {

        var conv = await _repo.GetByIdAsync(conversationId);
        if (conv == null || conv.UserId != userId) throw new NotFoundException("Чат");


        var allowance = await _userService.CheckMessageAllowanceAsync(conv.UserId);

        // Комбіноване гадання: Таро + Матриця Долі. Матриця — функція тарифу (VIP/Admin).
        DestinyMatrixDto? matrix = null;
        if (birthDate is not null)
        {
            if (!allowance.DestinyMatrix)
                throw new ForbiddenException("Гадання з Матрицею Долі доступне в пакеті VIP");
            matrix = await _matrixService.CalculateAsync(birthDate.Value);
        }

        // Історію знімаємо ДО збереження нового повідомлення: після AddMessageAsync EF
        // (relationship fixup) додає його в conv.Messages, і воно пішло б у LLM двічі
        // — раз в історії, раз окремо як userMessage (зайві вхідні токени).
        var history = conv.Messages
            .OrderBy(m => m.CreatedAt)
            .TakeLast(10)
            .Select(m => new ChatMessage(m.Role == "user" ? ChatRole.User : ChatRole.Assistant, m.Content))
            .ToList();

        var userMsg = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            Role = "user",
            Content = message,
            CreatedAt = DateTime.UtcNow
        };
        await _repo.AddMessageAsync(userMsg);
        // LLM генерує відповідь (текст + карти)
        var result = await _aiService.ChatAsync(message, spreadId, history, allowance, matrix, ct);
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

        // Фіксуємо використання: +1 повідомлення, +1 розклад якщо випали карти або рахувалась матриця.
        await _userService.RegisterMessageAsync(conv.UserId, result.Cards.Count > 0 || result.MatrixUsed);

        return result;
    }
}
