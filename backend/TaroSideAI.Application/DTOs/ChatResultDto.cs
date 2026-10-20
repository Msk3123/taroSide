namespace TaroSideAI.Application.DTOs;

/// <summary>
/// Одна витягнута карта — рівно те, що потрібно фронту, щоб намалювати міні-картку.
/// Це навмисно «худий» DTO: ніяких значень/описів, лише те, що видно в UI.
/// </summary>
public class DrawnCardDto
{
    public int Position { get; set; }            // порядок у розкладі (1, 2, 3…)
    public string Name { get; set; } = string.Empty;    // українська назва, напр. "Колісниця"
    public string Symbol { get; set; } = string.Empty;  // декоративний символ, напр. "⚔"
    public bool IsReversed { get; set; }         // перевернута чи пряма
}

/// <summary>
/// Результат одного звернення до оракула: текст відповіді + які карти випали.
/// Раніше сервіс віддавав лише string — через це карти губилися й не доходили до UI.
/// </summary>
public class ChatResultDto
{
    public string Reply { get; set; } = string.Empty;
    public List<DrawnCardDto> Cards { get; set; } = new();

    /// <summary>Чи рахував оракул Матрицю Долі / сумісність через інструмент (рахується як розклад).</summary>
    public bool MatrixUsed { get; set; }
}
