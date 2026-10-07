using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Exceptions;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain;

namespace TaroSideAI.Application.Services;

public class MatrixService : IMatrixService
{
    private readonly ICardService _cardService;
    private readonly IChatAiService _aiService;
    private readonly IUserService _userService;

    // Порядок точок у відповіді = порядок, у якому їх читає оракул.
    private static readonly (string Key, string Title, Func<DestinyMatrix, int> Pick)[] Points =
    [
        ("center", "Зона комфорту",   m => m.Center),
        ("top",    "Призначення",     m => m.Top),
        ("left",   "Чоловіча лінія",  m => m.Left),
        ("right",  "Жіноча лінія",    m => m.Right),
        ("bottom", "Кармічний хвіст", m => m.Bottom),
    ];

    public MatrixService(ICardService cardService, IChatAiService aiService, IUserService userService)
    {
        _cardService = cardService;
        _aiService = aiService;
        _userService = userService;
    }

    /// <summary>
    /// Аркан матриці (1..22) → Id карти в БД.
    /// Старші аркани в БД лежать за порядком Райдера–Вейта: Id = номер + 1 (Дурень 0 → Id 1).
    /// Матриця Долі рахує за марсельською нумерацією: 8 = Справедливість, 11 = Сила
    /// (у Райдера–Вейта навпаки), а 22 — це Дурень.
    /// </summary>
    public static int CardIdForArcana(int arcana) => arcana switch
    {
        < 1 or > 22 => throw new ArgumentOutOfRangeException(nameof(arcana)),
        22 => 1,   // Дурень
        8  => 12,  // Справедливість (RW №11)
        11 => 9,   // Сила (RW №8)
        _  => arcana + 1
    };

    public async Task<DestinyMatrixDto> CalculateAsync(DateOnly birthDate)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (birthDate < new DateOnly(1900, 1, 1) || birthDate > today)
            throw new ValidationException("Дата народження має бути між 01.01.1900 і сьогоднішнім днем");

        var matrix = MatrixCalculator.Calculate(birthDate);
        var cards = (await _cardService.GetAllCardsAsync()).ToDictionary(c => c.Id);

        var dto = new DestinyMatrixDto { BirthDate = birthDate };
        foreach (var (key, title, pick) in Points)
        {
            var arcana = pick(matrix);
            var card = cards[CardIdForArcana(arcana)];
            dto.Points.Add(new MatrixPointDto
            {
                Key = key,
                Title = title,
                Arcana = arcana,
                CardId = card.Id,
                NameUkr = card.NameUkr,
                Symbol = card.Symbol,
                Keywords = card.Keywords,
                Meaning = card.UprightMeaning
            });
        }
        return dto;
    }

    public async Task<MatrixReadingDto> ReadAsync(Guid userId, DateOnly birthDate, string? question, CancellationToken ct)
    {
        // Спершу ліміти (кидає 429, якщо вичерпано повідомлення), потім тариф.
        var allowance = await _userService.CheckMessageAllowanceAsync(userId);
        if (!allowance.DestinyMatrix)
            throw new ForbiddenException("AI-прочитання Матриці Долі доступне в пакеті VIP");
        if (!allowance.CanDraw)
            throw new LimitExceededException("Ви вичерпали денний ліміт розкладів. Поверніться завтра.");

        var matrix = await CalculateAsync(birthDate);
        var reply = await _aiService.InterpretMatrixAsync(matrix, question, ct);

        // Прочитання матриці рахується як розклад: +1 повідомлення, +1 розклад.
        await _userService.RegisterMessageAsync(userId, readingHappened: true);

        return new MatrixReadingDto { Matrix = matrix, Reply = reply };
    }
}
