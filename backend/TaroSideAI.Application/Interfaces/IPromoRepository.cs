using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Interfaces;

public enum PromoRedeemOutcome
{
    Redeemed,
    AlreadyUsed,
    LimitReached
}

public interface IPromoRepository
{
    Task<List<PromoCode>> GetAllAsync();
    Task<PromoCode?> GetByCodeAsync(string code);
    Task AddAsync(PromoCode promo);

    /// <summary>False — якщо коду немає.</summary>
    Task<bool> SetActiveAsync(Guid id, bool isActive);

    Task DeleteUnusedAsync(Guid id);

    /// <summary>
    /// В одній транзакції рахує активацію, записує її і виконує <paramref name="apply"/>.
    /// Якщо apply кине виняток, активація не зарахується.
    /// </summary>
    Task<PromoRedeemOutcome> RedeemAsync(Guid promoId, Guid userId, Func<Task> apply);

    Task<PromoCode?> GetActiveDiscountAsync(Guid userId);
    Task ConsumeDiscountsAsync(Guid userId);
}
