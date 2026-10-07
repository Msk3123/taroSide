namespace TaroSideAI.Domain;

// Результат розрахунку матриці.
// record + init → після створення змінити не можна (immutable).
public record DestinyMatrix
{
    public DateOnly BirthDate { get; init; }
    public int Left   { get; init; } // день       — чоловіча лінія
    public int Top    { get; init; } // місяць     — призначення
    public int Right  { get; init; } // рік        — жіноча лінія
    public int Bottom { get; init; } // L + T + R  — кармічний хвіст
    public int Center { get; init; } // сума всіх 4 — зона комфорту
}