using Microsoft.AspNetCore.Mvc;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Services;

namespace TaroSideAI.API.Controllers;

[ApiController]
[Route("api/[controller]")] // → /api/cards
public class CardsController : ControllerBase
{
    private readonly CardService _cardService;

    public CardsController(CardService cardService)
    {
        _cardService = cardService;
    }

    // POST /api/cards
    // Тіло запиту: JSON з полями CreateTarotCardDto
    [HttpPost]
    public async Task<IActionResult> CreateCard([FromBody] CreateTarotCardDto dto)
    {
        var card = await _cardService.CreateCardAsync(dto);

        // 201 Created + заголовок Location: /api/cards/1
        return CreatedAtAction(nameof(GetCard), new { id = card.Id }, card);
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
}
