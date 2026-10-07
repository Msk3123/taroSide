using System.Text;

namespace TaroSideAI.Application.DTOs;

/// <summary>Одна точка Матриці Долі: який аркан у ній стоїть і що він означає.</summary>
public class MatrixPointDto
{
    public string Key { get; set; } = string.Empty;     // left | top | right | bottom | center
    public string Title { get; set; } = string.Empty;   // "Зона комфорту", "Призначення"…
    public int Arcana { get; set; }                     // 1..22 (22 = Дурень)
    public int CardId { get; set; }                     // id карти в TarotCards
    public string NameUkr { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Keywords { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
}

/// <summary>Розрахована матриця — детермінована, без AI: однакова дата → однаковий результат.</summary>
public class DestinyMatrixDto
{
    public DateOnly BirthDate { get; set; }
    public List<MatrixPointDto> Points { get; set; } = new();

    /// <summary>Компактний опис для системного промпту LLM (один рядок на точку — економія токенів).</summary>
    public string ToPromptText()
    {
        var sb = new StringBuilder($"Дата народження: {BirthDate:dd.MM.yyyy}\n");
        foreach (var p in Points)
            sb.Append($"- {p.Title}: {p.Arcana} аркан — {p.NameUkr} ({p.Keywords})\n");
        return sb.ToString();
    }
}

public record MatrixReadingRequestDto(DateOnly BirthDate, string? Question);

/// <summary>Матриця + текстове прочитання від Lunaris.</summary>
public class MatrixReadingDto
{
    public DestinyMatrixDto Matrix { get; set; } = new();
    public string Reply { get; set; } = string.Empty;
}
