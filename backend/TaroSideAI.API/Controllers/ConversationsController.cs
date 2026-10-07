using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaroSideAI.API.Extensions;
using TaroSideAI.Application.Interfaces;

namespace TaroSideAI.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ConversationsController : ControllerBase
{
    private readonly IConversationService _conversationService;

    public ConversationsController(IConversationService conversationService)
    {
        _conversationService = conversationService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateConversationDto dto)
    {
        var userId = User.GetUserId();                        
        if (userId is null) return Unauthorized();
        var conv = await _conversationService.CreateConversationAsync(userId.Value, dto.Title);
        return Ok(conv);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = User.GetUserId();                        
        if (userId is null) return Unauthorized();
        var list = await _conversationService.GetUserConversationsAsync(userId.Value);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = User.GetUserId();                        
        if (userId is null) return Unauthorized();
        var conv = await _conversationService.GetConversationByIdAsync(id);
        
        if (conv == null || conv.UserId != userId) return NotFound();
        
        return Ok(conv);
    }

    [HttpPost("{id:guid}/messages")]
    public async Task<IActionResult> SendMessage(Guid id, [FromBody] SendMessageDto dto, CancellationToken ct)
    {
        var userId = User.GetUserId();                        
        if (userId is null) return Unauthorized();
        
        var conv = await _conversationService.GetConversationByIdAsync(id);
        if (conv == null || conv.UserId != userId) return NotFound();

        var result = await _conversationService.ProcessUserMessageAsync(id, dto.Message, userId.Value, dto.SpreadId, dto.BirthDate, ct);
        return Ok(result);
    }
}

public record CreateConversationDto(string Title);

// BirthDate — необов'язкова: якщо є, оракул поєднує розклад із Матрицею Долі.
public record SendMessageDto(string Message, int SpreadId, DateOnly? BirthDate = null);