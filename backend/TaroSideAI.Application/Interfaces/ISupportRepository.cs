using TaroSideAI.Application.DTOs;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Interfaces;

public interface ISupportRepository
{
    Task<List<SupportMessage>> GetThreadAsync(Guid userId);
    Task AddAsync(SupportMessage message);

    /// <summary>Позначає прочитаними повідомлення в гілці, які написала протилежна сторона.</summary>
    Task MarkReadAsync(Guid userId, bool fromAdmin);

    Task<List<SupportThreadDto>> GetThreadsAsync();
    Task<int> CountUnreadAsync(Guid userId, bool fromAdmin);
}
