using Microsoft.EntityFrameworkCore;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;
using TaroSideAI.Infrastructure.Persistence;

namespace TaroSideAI.Infrastructure.Repositories;

public class SpreadRepository : ISpreadRepository
{
    private readonly AppDbContext _db;
    
    public SpreadRepository(AppDbContext db)
    {
        _db = db;
    }
    
    public async Task<List<Spread>> GetAllSpreadsAsync()
    {
        return await _db.Spreads.AsNoTracking().ToListAsync();
    }
    
    public async Task<Spread?> GetSpreadByIdAsync(int id)
    {
        return await _db.Spreads.FindAsync(id);
    }
    
    public async Task<Spread> CreateSpreadAsync(Spread spread)
    {
        _db.Spreads.Add(spread);
        await _db.SaveChangesAsync();
        return spread;
    }
    
    public async Task<Spread> UpdateSpreadAsync(Spread spread)
    {
        _db.Spreads.Update(spread);
        await _db.SaveChangesAsync();
        return spread;
    }
    
    public async Task<bool> DeleteSpreadAsync(int id)
    {
        var spread = await _db.Spreads.FindAsync(id);
        if (spread == null)
            throw new Exception("Spread not found");
        _db.Spreads.Remove(spread);
        await _db.SaveChangesAsync();
        return true;
    }
    
}