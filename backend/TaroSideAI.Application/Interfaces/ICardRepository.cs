using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Interfaces;

// Контракт (обіцянка) для роботи з картами в БД.
// Application знає ЩО потрібно зробити, але не знає ЯК.
// "Як" — це вже справа Infrastructure.
public interface ICardRepository
{
    Task<TarotCard> CreateAsync(TarotCard card);
    Task<TarotCard?> GetByIdAsync(int id);
    Task<List<TarotCard>> GetAllAsync();
}
