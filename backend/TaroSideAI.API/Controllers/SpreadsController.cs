using Microsoft.AspNetCore.Mvc;
using TaroSideAI.Application.Services;

namespace TaroSideAI.API.Controllers;

[ApiController]
[Route("api/[controller]")] // → /api/spreads
public class SpreadsController : ControllerBase
{
    private readonly SpreadService _spreadService;

    public SpreadsController(SpreadService spreadService)
    {
        _spreadService = spreadService;
    }

    // GET /api/spreads — список усіх типів розкладів для вибору на фронті
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var spreads = await _spreadService.GetAllSpreadsAsync();
        return Ok(spreads);
    }

    // GET /api/spreads/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var spread = await _spreadService.GetSpreadByIdAsync(id);
        if (spread is null) return NotFound();
        return Ok(spread);
    }
}
