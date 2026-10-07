using TaroSideAI.Application.DTOs;

namespace TaroSideAI.Application.Interfaces;

public interface ISupportService
{
    // --- сторона користувача ---
    Task<List<SupportMessageDto>> GetMyThreadAsync(Guid userId);
    Task<SupportMessageDto> SendFromUserAsync(Guid userId, string text);
    Task<int> CountUnreadForUserAsync(Guid userId);

    // --- сторона адміна ---
    Task<List<SupportThreadDto>> GetThreadsAsync();
    Task<List<SupportMessageDto>> GetThreadForAdminAsync(Guid userId);
    Task<SupportMessageDto> ReplyFromAdminAsync(Guid userId, string text);
}
