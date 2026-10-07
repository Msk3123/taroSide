using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Exceptions;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Services;

public class SupportService : ISupportService
{
    private const int MaxLength = 2000;

    private readonly ISupportRepository _repository;

    public SupportService(ISupportRepository repository)
    {
        _repository = repository;
    }

    /* ------------------- користувач ------------------- */

    public async Task<List<SupportMessageDto>> GetMyThreadAsync(Guid userId)
    {
        // Юзер відкрив чат → відповіді адміна стають прочитаними
        await _repository.MarkReadAsync(userId, fromAdmin: true);
        var thread = await _repository.GetThreadAsync(userId);
        return thread.Select(ToDto).ToList();
    }

    public Task<SupportMessageDto> SendFromUserAsync(Guid userId, string text)
        => AddAsync(userId, text, fromAdmin: false);

    public Task<int> CountUnreadForUserAsync(Guid userId)
        => _repository.CountUnreadAsync(userId, fromAdmin: true);

    /* ------------------- адмін ------------------- */

    public Task<List<SupportThreadDto>> GetThreadsAsync()
        => _repository.GetThreadsAsync();

    public async Task<List<SupportMessageDto>> GetThreadForAdminAsync(Guid userId)
    {
        // Адмін відкрив гілку → повідомлення користувача стають прочитаними
        await _repository.MarkReadAsync(userId, fromAdmin: false);
        var thread = await _repository.GetThreadAsync(userId);
        return thread.Select(ToDto).ToList();
    }

    public Task<SupportMessageDto> ReplyFromAdminAsync(Guid userId, string text)
        => AddAsync(userId, text, fromAdmin: true);

    /* ------------------- спільне ------------------- */

    private async Task<SupportMessageDto> AddAsync(Guid userId, string text, bool fromAdmin)
    {
        var clean = (text ?? string.Empty).Trim();
        if (clean.Length == 0)
            throw new ValidationException("Повідомлення порожнє");
        if (clean.Length > MaxLength)
            throw new ValidationException($"Повідомлення задовге (максимум {MaxLength} символів)");

        var message = new SupportMessage
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            FromAdmin = fromAdmin,
            Text = clean,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };
        await _repository.AddAsync(message);
        return ToDto(message);
    }

    private static SupportMessageDto ToDto(SupportMessage m) => new()
    {
        Id = m.Id,
        FromAdmin = m.FromAdmin,
        Text = m.Text,
        CreatedAt = m.CreatedAt
    };
}
