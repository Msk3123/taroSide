using TaroSideAI.Application.Services;
using TaroSideAI.Domain;

namespace TaroSideAI.Application.Tests;

public class MatrixTests
{
    [Fact]
    public void Calculate_KnownDate_ReturnsExpectedArcana()
    {
        // 14.05.1998: день 14, місяць 5, рік 1+9+9+8=27→5, низ 14+5+5=24→2, центр 24+2=26→4
        var m = MatrixCalculator.Calculate(new DateOnly(1998, 5, 14));

        Assert.Equal(14, m.Left);
        Assert.Equal(5, m.Top);
        Assert.Equal(5, m.Right);
        Assert.Equal(2, m.Bottom);
        Assert.Equal(4, m.Center);
    }

    // [Theory] + [InlineData] — один тест, кілька наборів даних.
    [Theory]
    [InlineData(22, 22)]
    [InlineData(23, 1)]
    [InlineData(44, 22)]
    [InlineData(45, 1)]
    public void ReduceToArcana_StaysInRange(int input, int expected)
    {
        Assert.Equal(expected, MatrixCalculator.ReduceToArcana(input));
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
        // 14.05.1998: A=14 B=5 C=5 D=2 E=4 (див. тест вище)
        var m = MatrixCalculator.Calculate(new DateOnly(1998, 5, 14));

        // Рід: F=A+B=19, G=B+C=10, H=C+D=7, I=D+A=16
        Assert.Equal((19, 10, 7, 16), (m.TopLeft, m.TopRight, m.BottomRight, m.BottomLeft));
        // Кармічний хвіст: D=2, D1=D+E=6, D2=D+D1=8 → читається D → D2 → D1
        Assert.Equal(new[] { 2, 8, 6 }, m.KarmicTail);
        // Гроші/любов: C1=C+E=9, K=C1+D1=15, гроші=C1+K=24→2, любов=D1+K=21
        Assert.Equal((15, 2, 21), (m.LineCenter, m.Money, m.Love));
        // Призначення: небо B+D=7, земля A+C=19 → особисте 26→4;
        // чоловіча F+H=26→4, жіноча G+I=26→4 → соціальне 8; духовне 4+8=12
        Assert.Equal((7, 19, 4), (m.Sky, m.Earth, m.Personal));
        Assert.Equal((4, 4, 8, 12), (m.MaleLine, m.FemaleLine, m.Social, m.Spiritual));
    }

    [Fact]
    public void Compatibility_SumsBasePoints_ThenSameFormulas()
    {
        var a = MatrixCalculator.Calculate(new DateOnly(1998, 5, 14)); // A14 B5 C5 D2
        var b = MatrixCalculator.Calculate(new DateOnly(1997, 3, 12)); // A12 B3 C26→4 D19
        var pair = MatrixCalculator.Compatibility(a, b);

        // A=26→4, B=8, C=9, D=2+19=21 (саме сума D, а не A+B+C пари), E=42→20
        Assert.Equal((4, 8, 9, 21, 20), (pair.Left, pair.Top, pair.Right, pair.Bottom, pair.Center));
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
