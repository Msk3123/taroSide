using Microsoft.Extensions.AI;
using TaroSideAI.Application.DTOs;

namespace TaroSideAI.Application.Interfaces;

public interface IChatAiService
{
    // Повертаємо ChatResultDto (текст + карти), а не голий string,
    // щоб витягнуті карти доходили до фронту й малювалися в розкладі.
    // allowance — що дозволяє тариф: чи можна тягнути карти (денний ліміт), макс. карт,
    // роль (для Spread.RequiredRole) і вільний режим.
    // matrix — якщо передано, оракул враховує Матрицю Долі користувача (комбіноване гадання).
    // priorReadings — скільки розкладів уже зроблено в цій розмові.
    Task<ChatResultDto> ChatAsync(string userMessage, int currentSpreadId, List<ChatMessage> history,
        MessageAllowance allowance, DestinyMatrixDto? matrix, int priorReadings, CancellationToken ct);

    /// <summary>Текстове прочитання Матриці Долі (без інструментів і без карт).</summary>
    Task<string> InterpretMatrixAsync(DestinyMatrixDto matrix, string? question, CancellationToken ct);

    /// <summary>Текстове прочитання сумісності пари за Матрицею Долі.</summary>
    Task<string> InterpretCompatibilityAsync(CompatibilityDto compatibility, string? question, CancellationToken ct);
}
