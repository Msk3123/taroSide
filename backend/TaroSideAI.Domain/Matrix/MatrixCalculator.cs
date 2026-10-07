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

    // Операція 2: зведення до аркану. Для всього: 27 → 5, 25 → 3
    public static int ReduceToArcana(int number)
    {
        while (number > MaxArcana)
            number -= MaxArcana;
        return number;
    }

    public static DestinyMatrix Calculate(DateOnly birthDate)
    {
        int left  = ReduceToArcana(birthDate.Day);
        int top   = ReduceToArcana(birthDate.Month);              // місяць завжди ≤ 12
        int right = ReduceToArcana(SumDigits(birthDate.Year));    // обидві операції

        int bottom = ReduceToArcana(left + top + right);
        int center = ReduceToArcana(left + top + right + bottom); // рахується останнім

        return new DestinyMatrix
        {
            BirthDate = birthDate,
            Left = left,
            Top = top,
            Right = right,
            Bottom = bottom,
            Center = center
        };
    }
}