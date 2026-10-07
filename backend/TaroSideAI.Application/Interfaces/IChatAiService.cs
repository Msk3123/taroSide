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
    Task<ChatResultDto> ChatAsync(string userMessage, int currentSpreadId, List<ChatMessage> history,
        MessageAllowance allowance, DestinyMatrixDto? matrix, CancellationToken ct);

    /// <summary>Текстове прочитання Матриці Долі (без інструментів і без карт).</summary>
    Task<string> InterpretMatrixAsync(DestinyMatrixDto matrix, string? question, CancellationToken ct);
}
