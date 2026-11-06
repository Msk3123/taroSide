using Microsoft.EntityFrameworkCore;
using Npgsql;
using TaroSideAI.Application.Exceptions;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;
using TaroSideAI.Domain.Enums;
using TaroSideAI.Infrastructure.Persistence;

namespace TaroSideAI.Infrastructure.Repositories;

public class PromoRepository : IPromoRepository
{
    private const string UniqueViolation = "23505";

    private readonly AppDbContext _context;

    public PromoRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<List<PromoCode>> GetAllAsync()
        => _context.PromoCodes.AsNoTracking().OrderByDescending(p => p.CreatedAt).ToListAsync();

    public Task<PromoCode?> GetByCodeAsync(string code)
        => _context.PromoCodes.AsNoTracking().FirstOrDefaultAsync(p => p.Code == code);

    public async Task AddAsync(PromoCode promo)
    {
        _context.PromoCodes.Add(promo);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> SetActiveAsync(Guid id, bool isActive)
    {
        var updated = await _context.PromoCodes
            .Where(p => p.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsActive, isActive));
        return updated > 0;
    }

    public async Task DeleteUnusedAsync(Guid id)
    {
        if (await _context.PromoRedemptions.AnyAsync(r => r.PromoCodeId == id))
            throw new ValidationException("Цей код уже активували. Його можна лише вимкнути");

        var deleted = await _context.PromoCodes.Where(p => p.Id == id).ExecuteDeleteAsync();
        if (deleted == 0) throw new NotFoundException("Промокод");
    }

    public async Task<PromoRedeemOutcome> RedeemAsync(Guid promoId, Guid userId, Func<Task> apply)
    {
        if (await _context.PromoRedemptions.AnyAsync(r => r.PromoCodeId == promoId && r.UserId == userId))
            return PromoRedeemOutcome.AlreadyUsed;

        await using var transaction = await _context.Database.BeginTransactionAsync();

        // Умова прямо в UPDATE: двоє одночасних запитів не перевищать ліміт.
        var counted = await _context.PromoCodes
            .Where(p => p.Id == promoId && (p.MaxRedemptions == null || p.RedemptionsCount < p.MaxRedemptions))
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.RedemptionsCount, p => p.RedemptionsCount + 1));
        if (counted == 0) return PromoRedeemOutcome.LimitReached;

        _context.PromoRedemptions.Add(new PromoRedemption { Id = Guid.NewGuid(), PromoCodeId = promoId, UserId = userId });
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException e) when (e.InnerException is PostgresException { SqlState: UniqueViolation })
        {
            return PromoRedeemOutcome.AlreadyUsed;
        }

        await apply();
        await transaction.CommitAsync();
        return PromoRedeemOutcome.Redeemed;
    }

    public Task<PromoCode?> GetActiveDiscountAsync(Guid userId)
    {
        var now = DateTime.UtcNow;
        return _context.PromoRedemptions
            .AsNoTracking()
            .Where(r => r.UserId == userId && r.ConsumedAt == null)
            .Select(r => r.PromoCode!)
            .Where(p => p.Type == PromoType.Discount && p.IsActive && (p.ExpiresAt == null || p.ExpiresAt > now))
            .OrderByDescending(p => p.DiscountPercent)
            .FirstOrDefaultAsync();
    }

    public Task ConsumeDiscountsAsync(Guid userId)
    {
        var now = DateTime.UtcNow;
        return _context.PromoRedemptions
            .Where(r => r.UserId == userId && r.ConsumedAt == null && r.PromoCode!.Type == PromoType.Discount)
            .ExecuteUpdateAsync(s => s.SetProperty(r => r.ConsumedAt, now));
    }
}
