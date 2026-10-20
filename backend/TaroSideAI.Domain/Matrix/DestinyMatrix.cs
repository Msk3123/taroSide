namespace TaroSideAI.Domain;

// Результат розрахунку матриці (класична октаграма, школа Ладини).
// record + init → після створення змінити не можна (immutable).
//
//            F ─── B ─── G          B, A, C, D — «прямий» квадрат (особистість)
//            │  B2 │     │          F, G, H, I — «діагональний» квадрат (рід)
//            │  B1 │     │          …1 — точка біля центру, …2 — між зовнішньою і …1
//      A  A2  A1   E   C1  C2  C
//            │     D1    │          Кармічний хвіст: D → D2 → D1
//            │     D2    │          Гроші/любов: лінія між C1 і D1
//            I ─── D ─── H
public record DestinyMatrix
{
    public DateOnly BirthDate { get; init; }

    // --- Особистість (прямий квадрат) ---
    public int Left   { get; init; } // A: день       — особистість, «візитка»
    public int Top    { get; init; } // B: місяць     — таланти, духовна підтримка
    public int Right  { get; init; } // C: рік        — матеріальна сфера
    public int Bottom { get; init; } // D: A + B + C  — кармічний хвіст (вхід)
    public int Center { get; init; } // E: A+B+C+D    — зона комфорту

    // --- Рід (діагональний квадрат) ---
    public int TopLeft     { get; init; } // F = A + B — чоловічий рід (батько)
    public int TopRight    { get; init; } // G = B + C — жіночий рід (мати)
    public int BottomRight { get; init; } // H = C + D — чоловічий рід (батько)
    public int BottomLeft  { get; init; } // I = D + A — жіночий рід (мати)

    // --- Внутрішні точки осей ---
    public int LeftInner   { get; init; } // A1 = A + E
    public int TopInner    { get; init; } // B1 = B + E
    public int RightInner  { get; init; } // C1 = C + E
    public int BottomInner { get; init; } // D1 = D + E
    public int LeftMid     { get; init; } // A2 = A + A1
    public int TopMid      { get; init; } // B2 = B + B1
    public int RightMid    { get; init; } // C2 = C + C1
    public int BottomMid   { get; init; } // D2 = D + D1

    // --- Гроші й любов (лінія C1–D1) ---
    public int LineCenter { get; init; } // K = C1 + D1 — точка рівноваги
    public int Money      { get; init; } // C1 + K
    public int Love       { get; init; } // D1 + K

    // --- Призначення ---
    public int Sky       { get; init; } // B + D
    public int Earth     { get; init; } // A + C
    public int Personal  { get; init; } // небо + земля — особисте (≈20–40 років)
    public int MaleLine  { get; init; } // F + H
    public int FemaleLine{ get; init; } // G + I
    public int Social    { get; init; } // чоловіча + жіноча лінії — соціальне (≈40–60)
    public int Spiritual { get; init; } // особисте + соціальне — духовне (60+)

    /// <summary>Кармічний хвіст у порядку читання: зовні → до центру.</summary>
    public int[] KarmicTail => [Bottom, BottomMid, BottomInner];
}
