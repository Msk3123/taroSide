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

    public async Task<List<TarotCard>> GetAllCardAsync()
    {
        return await _db.TarotCards.AsNoTracking().ToListAsync();
    }
    
    public async Task<List<TarotCard>> GetRandomCardAsync(int countCard)
    {
        var allCards = await _db.TarotCards.ToListAsync();
        return allCards
            .OrderBy(_ => Random.Shared.Next())
            .Take(countCard)
            .ToList();
    }
    
    public async Task<DailyCard?> GetDailyCardAsync(Guid userId, DateOnly date)
    {
        // Include — щоб разом з записом підтягнути саму карту (назву, значення)
        return await _db.DailyCards
            .AsNoTracking()
            .Include(dc => dc.Card)
            .FirstOrDefaultAsync(dc => dc.UserId == userId && dc.Date == date);
    }

    public async Task<DailyCard> AddDailyCardAsync(DailyCard dailyCard)
    {
        _db.DailyCards.Add(dailyCard);
        try
        {
            await _db.SaveChangesAsync();
            return dailyCard;
        }
        catch (DbUpdateException)
        {
            // Два одночасні запити від одного юзера: другий впирається в унікальний
            // індекс (UserId, Date). Відкочуємо свій запис і віддаємо той, що вже зберігся.
            _db.Entry(dailyCard).State = EntityState.Detached;
            return await GetDailyCardAsync(dailyCard.UserId, dailyCard.Date)
                   ?? throw new InvalidOperationException("Не вдалося зберегти карту дня");
        }
    }
}
