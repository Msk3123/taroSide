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
        Assert.Equal(cardId, MatrixService.CardIdForArcana(arcana));
    }

    [Fact]
    public void Calculate_AnyDate_AllPointsAreValidArcana()
    {
        // Перебираємо кожен день за 100 років — жодна точка не має вийти за 1..22.
        for (var d = new DateOnly(1925, 1, 1); d < new DateOnly(2025, 1, 1); d = d.AddDays(1))
        {
            var m = MatrixCalculator.Calculate(d);
            foreach (var v in new[] { m.Left, m.Top, m.Right, m.Bottom, m.Center })
                Assert.InRange(v, 1, 22);
        }
    }
}
