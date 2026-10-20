using TaroSideAI.Application.DTOs;

namespace TaroSideAI.Application.Interfaces;

public interface IMatrixService
{
    /// <summary>Чистий розрахунок (без AI і без лімітів) — доступний усім.</summary>
    Task<DestinyMatrixDto> CalculateAsync(DateOnly birthDate);

    /// <summary>Чистий розрахунок сумісності двох дат — доступний усім.</summary>
    Task<CompatibilityDto> CompatibilityAsync(DateOnly first, DateOnly second);

    /// <summary>
    /// AI-прочитання матриці. Потребує тарифу з DestinyMatrix (VIP/Admin),
    /// списує одне повідомлення й один розклад з денних лімітів.
    /// </summary>
    Task<MatrixReadingDto> ReadAsync(Guid userId, DateOnly birthDate, string? question, CancellationToken ct);

    /// <summary>AI-прочитання сумісності пари. Ті самі умови, що й ReadAsync.</summary>
    Task<CompatibilityReadingDto> ReadCompatibilityAsync(Guid userId, DateOnly first, DateOnly second,
        string? question, CancellationToken ct);
}
