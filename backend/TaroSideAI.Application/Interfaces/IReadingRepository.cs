using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Interfaces;

public interface IReadingRepository
{
    
    Task<Reading> GetReadingByIdAsync(Guid id);
    Task<Reading> CreateReadingAsync(Reading reading);
    Task<Reading> UpdateReadingAsync(Reading reading);
    Task<bool> DeleteReadingAsync(Guid id);

    Task<int> CountTodayByUserAsync(Guid userId);
    Task<List<Reading>> GetAllReadingsAsync(Guid userId);
}