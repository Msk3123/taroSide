using TaroSideAI.Application.DTOs;

namespace TaroSideAI.Application.Interfaces;

public interface IPromoService
{
    Task<List<PromoDto>> GetAllAsync();
    Task<PromoDto> CreateAsync(CreatePromoDto dto);
    Task SetActiveAsync(Guid id, bool isActive);
    Task DeleteAsync(Guid id);

    Task<PromoRedeemResultDto> RedeemAsync(Guid userId, string code);
    Task<PromoDiscountDto?> GetActiveDiscountAsync(Guid userId);
}
