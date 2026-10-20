using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Exceptions;
using TaroSideAI.Application.Interfaces;

namespace TaroSideAI.Application.Services;

/// <summary>Матриця Долі як фіча: розрахунок (делегує в IMatrixCalculationService) + AI-прочитання з лімітами.</summary>
public class MatrixService : IMatrixService
{
    private readonly IMatrixCalculationService _calc;
    private readonly IChatAiService _aiService;
    private readonly IUserService _userService;

    public MatrixService(IMatrixCalculationService calc, IChatAiService aiService, IUserService userService)
    {
        _calc = calc;
        _aiService = aiService;
        _userService = userService;
    }

    public Task<DestinyMatrixDto> CalculateAsync(DateOnly birthDate) => _calc.CalculateAsync(birthDate);

    public Task<CompatibilityDto> CompatibilityAsync(DateOnly first, DateOnly second) =>
        _calc.CompatibilityAsync(first, second);

    public async Task<MatrixReadingDto> ReadAsync(Guid userId, DateOnly birthDate, string? question, CancellationToken ct)
    {
        await EnsureCanReadAsync(userId);

        var matrix = await _calc.CalculateAsync(birthDate);
        var reply = await _aiService.InterpretMatrixAsync(matrix, question, ct);

        // Прочитання матриці рахується як розклад: +1 повідомлення, +1 розклад.
        await _userService.RegisterMessageAsync(userId, readingHappened: true);

        return new MatrixReadingDto { Matrix = matrix, Reply = reply };
    }

    public async Task<CompatibilityReadingDto> ReadCompatibilityAsync(Guid userId, DateOnly first, DateOnly second,
        string? question, CancellationToken ct)
    {
        await EnsureCanReadAsync(userId);

        var compatibility = await _calc.CompatibilityAsync(first, second);
        var reply = await _aiService.InterpretCompatibilityAsync(compatibility, question, ct);

        await _userService.RegisterMessageAsync(userId, readingHappened: true);

        return new CompatibilityReadingDto { Compatibility = compatibility, Reply = reply };
    }

    /// <summary>Спершу ліміти (кидає 429, якщо вичерпано повідомлення), потім тариф.</summary>
    private async Task EnsureCanReadAsync(Guid userId)
    {
        var allowance = await _userService.CheckMessageAllowanceAsync(userId);
        if (!allowance.DestinyMatrix)
            throw new ForbiddenException("AI-прочитання Матриці Долі доступне в пакеті VIP");
        if (!allowance.CanDraw)
            throw new LimitExceededException("Ви вичерпали денний ліміт розкладів. Поверніться завтра.");
    }
}
