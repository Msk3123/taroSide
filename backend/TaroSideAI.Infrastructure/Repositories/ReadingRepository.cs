using Microsoft.EntityFrameworkCore;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;
using TaroSideAI.Infrastructure.Persistence;

namespace TaroSideAI.Infrastructure.Repositories;

public class ReadingRepository : IReadingRepository
{
    private readonly AppDbContext _context;
    public ReadingRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<Reading> GetReadingByIdAsync(Guid id)
    {
        return await _context.Readings
            .Include(r =>
                r.ReadingCards).ThenInclude(rc => rc.Card)
            .Include(r => r.Spread)
            .FirstOrDefaultAsync(r => r.Id == id);
    }
    
    public async Task<Reading> CreateReadingAsync(Reading reading)
    {
        _context.Readings.Add(reading);
        await _context.SaveChangesAsync();
        return reading;
    }
    
    public async Task<Reading> UpdateReadingAsync(Reading reading)
    {
        _context.Readings.Update(reading);
        await _context.SaveChangesAsync();
        return reading;
    }

    public async Task<bool> DeleteReadingAsync(Guid id)
    {
        var reading = await _context.Readings.FindAsync(id);
        if (reading == null)
            throw new Exception("Reading not found");
        _context.Readings.Remove(reading);
        await _context.SaveChangesAsync();
        return true;
        
    }

    public async Task<int> CountTodayByUserAsync(Guid userId)
    {
        var today = DateTime.UtcNow.Date;
        return await _context.Readings.CountAsync(r => r.UserId == userId && r.CreatedAt.Date == today);
    }
    

    public async Task<List<Reading>> GetAllReadingsAsync(Guid userId)
    {
        return await _context.Readings
            .Where(r => r.UserId == userId)
            .Include(r => r.Spread)
            .OrderByDescending(r => r.CreatedAt)  
            .ToListAsync();
        
    }
}