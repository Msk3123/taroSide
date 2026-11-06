using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TaroSideAI.API.Extensions;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Interfaces;

namespace TaroSideAI.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")] // → /api/promo
public class PromoController : ControllerBase
{
    private readonly IPromoService _promoService;

    public PromoController(IPromoService promoService)
    {
        _promoService = promoService;
    }

    // POST /api/promo/redeem — активувати код. Ліміт захищає від перебору кодів.
    [EnableRateLimiting("promo-redeem")]
    [HttpPost("redeem")]
    public async Task<ActionResult<PromoRedeemResultDto>> RedeemAsync([FromBody] RedeemPromoDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();
        return Ok(await _promoService.RedeemAsync(userId.Value, dto.Code));
    }

    // GET /api/promo/discount — чинна знижка користувача (204, якщо її немає)
    [HttpGet("discount")]
    public async Task<ActionResult<PromoDiscountDto>> GetDiscountAsync()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();
        var discount = await _promoService.GetActiveDiscountAsync(userId.Value);
        return discount is null ? NoContent() : Ok(discount);
    }
}
