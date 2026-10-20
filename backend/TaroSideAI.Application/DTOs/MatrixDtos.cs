using System.Text;

namespace TaroSideAI.Application.DTOs;

/// <summary>Одна точка Матриці Долі: який аркан у ній стоїть і що він означає.</summary>
public class MatrixPointDto
{
    public string Key { get; set; } = string.Empty;     // center | left | top | right | bottom | tailMid | …
    public string Group { get; set; } = string.Empty;   // personality | karma | family | money_love | purpose
    public string Title { get; set; } = string.Empty;   // "Зона комфорту", "Призначення"…
    public string Hint { get; set; } = string.Empty;    // що означає сама позиція (незалежно від аркану)
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

    /// <summary>Компактний опис для промпту LLM (один рядок на точку — економія токенів).</summary>
    public string ToPromptText()
    {
        var sb = new StringBuilder($"Дата народження: {BirthDate:dd.MM.yyyy}\n");
        AppendPoints(sb, Points);
        return sb.ToString();
    }

    internal static void AppendPoints(StringBuilder sb, IEnumerable<MatrixPointDto> points)
    {
        foreach (var p in points)
            sb.Append($"- {p.Title}: {p.Arcana} {p.NameUkr} ({p.Keywords})\n");
    }
}

/// <summary>Матриця сумісності: парні точки + особисті матриці обох партнерів.</summary>
public class CompatibilityDto
{
    public DestinyMatrixDto First { get; set; } = new();
    public DestinyMatrixDto Second { get; set; } = new();
    public List<MatrixPointDto> Points { get; set; } = new();   // точки ПАРИ

    public string ToPromptText(string? firstName = null, string? secondName = null)
    {
        var a = string.IsNullOrWhiteSpace(firstName) ? "Партнер 1" : firstName.Trim();
        var b = string.IsNullOrWhiteSpace(secondName) ? "Партнер 2" : secondName.Trim();
        var sb = new StringBuilder($"{a}: {First.BirthDate:dd.MM.yyyy}; {b}: {Second.BirthDate:dd.MM.yyyy}\n");
        sb.Append("Матриця пари:\n");
        DestinyMatrixDto.AppendPoints(sb, Points);
        // З особистих матриць беремо лише ключове — інакше промпт роздувається вдвічі.
        foreach (var (name, m) in new[] { (a, First), (b, Second) })
        {
            sb.Append($"{name} (особисто): ");
            sb.Append(string.Join("; ", m.Points
                .Where(p => p.Key is "center" or "love" or "bottom")
                .Select(p => $"{p.Title} — {p.Arcana} {p.NameUkr}")));
            sb.Append('\n');
        }
        return sb.ToString();
    }
}

public record MatrixReadingRequestDto(DateOnly BirthDate, string? Question);

public record CompatibilityReadingRequestDto(DateOnly First, DateOnly Second, string? Question);

/// <summary>Матриця + текстове прочитання від Lunaris.</summary>
public class MatrixReadingDto
{
    public DestinyMatrixDto Matrix { get; set; } = new();
    public string Reply { get; set; } = string.Empty;
}

public class CompatibilityReadingDto
{
    public CompatibilityDto Compatibility { get; set; } = new();
    public string Reply { get; set; } = string.Empty;
}
