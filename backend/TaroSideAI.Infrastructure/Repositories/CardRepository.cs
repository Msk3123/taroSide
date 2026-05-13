using Microsoft.EntityFrameworkCore;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;
using TaroSideAI.Infrastructure.Persistence;

namespace TaroSideAI.Infrastructure.Repositories;

// Реалізація контракту ICardRepository.
// Тут вже можна використовувати EF Core і AppDbContext —
// бо це Infrastructure, а не Application чи Domain.
public class CardRepository : ICardRepository

 

    
{
    private readonly AppDbContext _db;

    public CardRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<TarotCard> CreateAsync(TarotCard card)
    {
        _db.TarotCards.Add(card);
        await _db.SaveChangesAsync();
        return card; // після SaveChangesAsync — card.Id вже заповнений БД
    }

    public async Task<TarotCard?> GetByIdAsync(int id)
    {
        return await _db.TarotCards.FindAsync(id);
    }

    public async Task<List<TarotCard>> GetAllAsync()
    {
        return await _db.TarotCards.ToListAsync();
    }
}
