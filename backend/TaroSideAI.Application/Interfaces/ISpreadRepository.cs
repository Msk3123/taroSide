using TaroSideAI.Domain.Entities;
namespace TaroSideAI.Application.Interfaces;

public interface ISpreadRepository
{
    public Task<List<Spread>> GetAllSpreadsAsync();
    public Task<Spread?> GetSpreadByIdAsync(int id);
    public Task<Spread> CreateSpreadAsync(Spread spread);
    
    public Task<Spread> UpdateSpreadAsync(Spread spread);
    
    public Task<bool> DeleteSpreadAsync(int id);
    
}