using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Application.Interfaces;

public interface IReadingRepository
{
    
    Task<Reading> GetReadingById(Guid id);
    Task<Reading> CreateReading(Reading reading);
    Task<Reading> UpdateReading(Reading reading);
    Task<Reading> DeleteReading(Guid id);
    Task<List<Reading>> GetAllReadings();
    Task<List<Reading>> GetReadingsByUserId(Guid userId);
    
}