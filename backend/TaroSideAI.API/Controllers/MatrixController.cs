using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaroSideAI.API.Extensions;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Interfaces;

namespace TaroSideAI.API.Controllers;

[ApiController]
[Route("api/[controller]")] // → /api/matrix
public class MatrixController : ControllerBase
{
    private readonly IMatrixService _matrixService;

    public MatrixController(IMatrixService matrixService)
    {
        _matrixService = matrixService;
    }

    // GET /api/matrix?birthDate=1998-05-14 — чиста математика, без AI: відкрито для всіх.
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<DestinyMatrixDto>> Calculate([FromQuery] DateOnly birthDate)
    {
        return Ok(await _matrixService.CalculateAsync(birthDate));
    }

    // POST /api/matrix/reading — AI-прочитання матриці (VIP/Admin), списує розклад з лімітів.
    [Authorize]
    [HttpPost("reading")]
    public async Task<ActionResult<MatrixReadingDto>> Read([FromBody] MatrixReadingRequestDto dto, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();
        return Ok(await _matrixService.ReadAsync(userId.Value, dto.BirthDate, dto.Question, ct));
    }
}
