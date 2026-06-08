using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaroSideAI.Application.Services;
namespace TaroSideAI.API.Controllers;
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ConversationsController : ControllerBase
{
    private readonly ConversationService _conversationService;
    public ConversationsController(ConversationService conversationService)
    {
        _conversationService = conversationService;
    }
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateConversationDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var conv = await _conversationService.CreateConversationAsync(userId, dto.Title);
        return Ok(conv);
    }
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var list = await _conversationService.GetUserConversationsAsync(userId);
        return Ok(list);
    }
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var conv = await _conversationService.GetConversationByIdAsync(id);
        if (conv == null) return NotFound();
        return Ok(conv);
    }
    [HttpPost("{id:guid}/messages")]
    public async Task<IActionResult> SendMessage(Guid id, [FromBody] SendMessageDto dto, CancellationToken ct)
    {
        try
        {
            var reply = await _conversationService.ProcessUserMessageAsync(id, dto.Message, dto.SpreadId, ct);
            return Ok(new { Reply = reply });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}
public record CreateConversationDto(string Title);
public record SendMessageDto(string Message, int SpreadId);
