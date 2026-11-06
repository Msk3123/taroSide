using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaroSideAI.API.Extensions;
using TaroSideAI.Application.Interfaces;

namespace TaroSideAI.API.Controllers;

[ApiController]
[Route("api/[controller]")] // → /api/cards
public class CardsController : ControllerBase
{
    // Просимо ІНТЕРФЕЙС, бо в DI зареєстровано ICardService → CardService.
    // Конкретний клас контейнер віддати не може — його ніхто не реєстрував.
    private readonly ICardService _cardService;

    public CardsController(ICardService cardService)
    {
        _cardService = cardService;
    }

    // GET /api/cards/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCard(int id)
    {
        var card = await _cardService.GetCardAsync(id);
        if (card is null) return NotFound();
        return Ok(card);
    }

    // GET /api/cards
    [HttpGet]
    public async Task<IActionResult> GetAllCards()
    {
        var cards = await _cardService.GetAllCardsAsync();
        return Ok(cards);
    }

    // GET /api/cards/daily
    // Карта дня поточного юзера: перший запит за день її витягує, наступні — повертають ту саму
    [Authorize]
    [HttpGet("daily")]
    public async Task<IActionResult> GetDailyCard()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();
        var dailyCard = await _cardService.GetDailyCardAsync(userId.Value);
        return Ok(dailyCard);
    }
}
