using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Interfaces;

// Контракт (обіцянка) для роботи з картами в БД.
// Application знає ЩО потрібно зробити, але не знає ЯК.
// "Як" — це вже справа Infrastructure.
public interface ICardRepository
{
    Task<TarotCard?> GetByIdAsync(int id);
    Task<List<TarotCard>> GetAllCardAsync();
    Task<List<TarotCard>> GetRandomCardAsync(int countCard);
    Task<DailyCard?> GetDailyCardAsync(Guid userId, DateOnly date);
    Task<DailyCard> AddDailyCardAsync(DailyCard dailyCard);
}
