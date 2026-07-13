using Microsoft.Extensions.AI;
using TaroSideAI.Application.DTOs;

namespace TaroSideAI.Application.Interfaces;

public interface IChatAiService
{
    // Повертаємо ChatResultDto (текст + карти), а не голий string,
    // щоб витягнуті карти доходили до фронту й малювалися в розкладі.
    // canDraw — чи дозволено робити новий розклад (денний ліміт розкладів ще не вичерпано).
    // Якщо false — інструмент DrawTarotCards не підключається й оракул не може витягувати карти.
    // maxCards — макс. кількість карт за тарифом; розклад більший за цей ліміт сервер не дозволить.
    Task<ChatResultDto> ChatAsync(string userMessage, int currentSpreadId, List<ChatMessage> history, bool canDraw, int maxCards, CancellationToken ct);
}
