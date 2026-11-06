using TaroSideAI.Application.Services;
using TaroSideAI.Domain;

namespace TaroSideAI.Application.Tests;

public class MatrixTests
{
    [Fact]
    public void Calculate_KnownDate_ReturnsExpectedArcana()
    {
        // 14.05.1998: день 14, місяць 5, рік 1+9+9+8=27→9, низ 14+5+9=28→10, центр 38→11
        var m = MatrixCalculator.Calculate(new DateOnly(1998, 5, 14));

        Assert.Equal(14, m.Left);
        Assert.Equal(5, m.Top);
        Assert.Equal(9, m.Right);
        Assert.Equal(10, m.Bottom);
        Assert.Equal(11, m.Center);
    }

    // [Theory] + [InlineData] — один тест, кілька наборів даних.
    [Theory]
    [InlineData(1, 1)]
    [InlineData(22, 22)]
    [InlineData(23, 5)]
    [InlineData(25, 7)]
    [InlineData(27, 9)]
    [InlineData(29, 11)]
    [InlineData(44, 8)]
    [InlineData(45, 9)]
    [InlineData(46, 10)]
    [InlineData(99, 18)]
    public void ReduceToArcana_SumsDigitsAbove22(int input, int expected)
    {
        Assert.Equal(expected, MatrixCalculator.ReduceToArcana(input));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void ReduceToArcana_NotPositive_Throws(int input)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => MatrixCalculator.ReduceToArcana(input));
    }

    [Theory]
    [InlineData(22, 1)]  // Дурень
    [InlineData(1, 2)]   // Маг
    [InlineData(8, 12)]  // у Матриці 8 = Справедливість
    [InlineData(11, 9)]  // у Матриці 11 = Сила
    [InlineData(21, 22)] // Світ
    public void CardIdForArcana_MapsToDeck(int arcana, int cardId)
    {
        Assert.Equal(cardId, MatrixCalculationService.CardIdForArcana(arcana));
    }

    [Fact]
    public void Calculate_KnownDate_DerivedPoints()
    {
        // 14.05.1998: A=14 B=5 C=9 D=10 E=11 (див. тест вище)
        var m = MatrixCalculator.Calculate(new DateOnly(1998, 5, 14));

        // Рід: F=A+B=19, G=B+C=14, H=C+D=19, I=D+A=24→6
        Assert.Equal((19, 14, 19, 6), (m.TopLeft, m.TopRight, m.BottomRight, m.BottomLeft));
        // Кармічний хвіст: D=10, D1=D+E=21, D2=D+D1=31→4 → читається D → D2 → D1
        Assert.Equal(new[] { 10, 4, 21 }, m.KarmicTail);
        // Гроші/любов: C1=C+E=20, K=C1+D1=41→5, гроші=C1+K=25→7, любов=D1+K=26→8
        Assert.Equal((5, 7, 8), (m.LineCenter, m.Money, m.Love));
        // Призначення: небо B+D=15, земля A+C=23→5 → особисте 20;
        // чоловіча F+H=38→11, жіноча G+I=20 → соціальне 31→4; духовне 20+4=24→6
        Assert.Equal((15, 5, 20), (m.Sky, m.Earth, m.Personal));
        Assert.Equal((11, 20, 4, 6), (m.MaleLine, m.FemaleLine, m.Social, m.Spiritual));
    }

    [Fact]
    public void Calculate_ReferenceDate_MatchesDigitSumRule()
    {
        // Еталон із задачі: за старою формулою тут 7 із 13 позицій «прилипали» до XXII.
        var m = MatrixCalculator.Calculate(new DateOnly(2002, 3, 15));

        Assert.Equal((15, 3, 4, 22, 8), (m.Left, m.Top, m.Right, m.Bottom, m.Center));
        Assert.Equal((18, 7, 8, 10), (m.TopLeft, m.TopRight, m.BottomRight, m.BottomLeft));
        Assert.Equal(new[] { 22, 7, 3 }, m.KarmicTail);
        Assert.Equal((15, 9, 18), (m.LineCenter, m.Money, m.Love));
        Assert.Equal((7, 19, 8), (m.Sky, m.Earth, m.Personal));
        Assert.Equal((8, 17, 7, 15), (m.MaleLine, m.FemaleLine, m.Social, m.Spiritual));
    }

    [Fact]
    public void Compatibility_SumsBasePoints_ThenSameFormulas()
    {
        var a = MatrixCalculator.Calculate(new DateOnly(1998, 5, 14)); // A14 B5 C9 D10
        var b = MatrixCalculator.Calculate(new DateOnly(1997, 3, 12)); // A12 B3 C26→8 D23→5
        var pair = MatrixCalculator.Compatibility(a, b);

        // A=26→8, B=8, C=17, D=10+5=15 (саме сума D, а не A+B+C пари), E=48→12
        Assert.Equal((8, 8, 17, 15, 12), (pair.Left, pair.Top, pair.Right, pair.Bottom, pair.Center));
        // Сумісність симетрична: порядок партнерів не важить
        Assert.Equal(pair, MatrixCalculator.Compatibility(b, a));
    }

    [Fact]
    public void Calculate_AnyDate_AllPointsAreValidArcana()
    {
        // Перебираємо кожен день за 100 років — жодна з ~27 точок не має вийти за 1..22.
        // Рефлексія: беремо ВСІ int-властивості, щоб нова точка не випала з перевірки.
        var props = typeof(DestinyMatrix).GetProperties().Where(p => p.PropertyType == typeof(int)).ToArray();
        for (var d = new DateOnly(1925, 1, 1); d < new DateOnly(2025, 1, 1); d = d.AddDays(1))
        {
            var m = MatrixCalculator.Calculate(d);
            foreach (var p in props)
                Assert.InRange((int)p.GetValue(m)!, 1, 22);
        }
    }
}
