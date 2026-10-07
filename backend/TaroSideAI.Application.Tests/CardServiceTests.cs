using TaroSideAI.Application.Services;

namespace TaroSideAI.Application.Tests;

// Клас public, інакше раннер його не знайде.
public class CardServiceTests
{
    // [Fact] = "тест без параметрів". Саме за цим атрибутом раннер
    // знаходить метод рефлексією. Немає атрибута — тесту не існує.
    [Fact]
    public async Task DrawRandomCardsAsync_CountIsZero_ThrowsArgumentException()
    {
        // ── Arrange ── готуємо об'єкт, який перевіряємо (SUT).
        // null! замість репозиторію: до нього виконання не дійде,
        // бо перевірка count <= 0 стоїть раніше.
        var sut = new CardService(null!);

        // ── Act + Assert ── викликаємо і одразу очікуємо виняток.
        // ThrowsAsync, а не Throws — метод async.
        // await обов'язковий, інакше виняток загубиться в Task.
        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => sut.DrawRandomCardsAsync(0));

        // Assert.ThrowsAsync повертає спійманий виняток —
        // можна перевірити й деталі, не лише сам факт падіння.
        Assert.Equal("count", ex.ParamName);
    }
}
