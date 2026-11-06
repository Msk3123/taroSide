namespace TaroSideAI.Domain;

// static — у калькулятора немає стану, він як Math:
// дав дату → отримав результат. Об'єкт створювати не треба.
public static class MatrixCalculator
{
    private const int MaxArcana = 22;

    // Операція 1: сума цифр. Тільки для року: 1998 → 1+9+9+8 = 27
    public static int SumDigits(int number)
    {
        int sum = 0;
        while (number > 0)
        {
            sum += number % 10; // остання цифра
            number /= 10;       // відкидаємо її
        }
        return sum;
    }

    // Операція 2: зведення до аркану. Більше за 22 — складаємо цифри: 27 → 9, 25 → 7, 99 → 18.
    public static int ReduceToArcana(int number)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(number, 1);

        while (number > MaxArcana)
            number = SumDigits(number);
        return number;
    }

    // Коротке ім'я, бо формул багато: R(a + b) читається як «звести суму до аркану».
    private static int R(int number) => ReduceToArcana(number);

    /// <summary>Особиста матриця: A = день, B = місяць, C = сума цифр року, D = A + B + C.</summary>
    public static DestinyMatrix Calculate(DateOnly birthDate)
    {
        int a = R(birthDate.Day);
        int b = R(birthDate.Month);              // місяць завжди ≤ 12
        int c = R(SumDigits(birthDate.Year));    // обидві операції
        int d = R(a + b + c);
        return FromBase(birthDate, a, b, c, d);
    }

    /// <summary>
    /// Матриця сумісності пари: кожна з чотирьох базових точок — сума точок партнерів
    /// (A = A₁ + A₂ …, і D теж D₁ + D₂, а не A + B + C). Решта рахується за тими самими формулами.
    /// BirthDate тут не має сенсу, тож лишається default.
    /// </summary>
    public static DestinyMatrix Compatibility(DestinyMatrix first, DestinyMatrix second) =>
        FromBase(default,
            R(first.Left + second.Left),
            R(first.Top + second.Top),
            R(first.Right + second.Right),
            R(first.Bottom + second.Bottom));

    /// <summary>Усі похідні точки октаграми з чотирьох базових (спільне для особистої і парної).</summary>
    private static DestinyMatrix FromBase(DateOnly birthDate, int a, int b, int c, int d)
    {
        int e = R(a + b + c + d);                // центр рахується після чотирьох базових

        int f = R(a + b), g = R(b + c), h = R(c + d), i = R(d + a);

        int a1 = R(a + e), b1 = R(b + e), c1 = R(c + e), d1 = R(d + e);

        int k = R(c1 + d1);

        int sky = R(b + d), earth = R(a + c);
        int male = R(f + h), female = R(g + i);
        int personal = R(sky + earth);
        int social = R(male + female);

        return new DestinyMatrix
        {
            BirthDate = birthDate,
            Left = a, Top = b, Right = c, Bottom = d, Center = e,
            TopLeft = f, TopRight = g, BottomRight = h, BottomLeft = i,
            LeftInner = a1, TopInner = b1, RightInner = c1, BottomInner = d1,
            LeftMid = R(a + a1), TopMid = R(b + b1), RightMid = R(c + c1), BottomMid = R(d + d1),
            LineCenter = k, Money = R(c1 + k), Love = R(d1 + k),
            Sky = sky, Earth = earth, Personal = personal,
            MaleLine = male, FemaleLine = female, Social = social,
            Spiritual = R(personal + social),
        };
    }
}
