using Microsoft.EntityFrameworkCore;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;
using TaroSideAI.Infrastructure.Persistence;

namespace TaroSideAI.Infrastructure.Repositories;

public class SupportRepository : ISupportRepository
{
    private readonly AppDbContext _context;

    public SupportRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<List<SupportMessage>> GetThreadAsync(Guid userId)
        => _context.SupportMessages
            .AsNoTracking()
            .Where(m => m.UserId == userId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();

    public async Task AddAsync(SupportMessage message)
    {
        _context.SupportMessages.Add(message);
        await _context.SaveChangesAsync();
    }

    public Task MarkReadAsync(Guid userId, bool fromAdmin)
        // ExecuteUpdate — один UPDATE у БД, без завантаження рядків у пам'ять
        => _context.SupportMessages
            .Where(m => m.UserId == userId && m.FromAdmin == fromAdmin && !m.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.IsRead, true));

    public Task<int> CountUnreadAsync(Guid userId, bool fromAdmin)
        => _context.SupportMessages
            .CountAsync(m => m.UserId == userId && m.FromAdmin == fromAdmin && !m.IsRead);

    public async Task<List<SupportThreadDto>> GetThreadsAsync()
    {
        // Останнє повідомлення кожної гілки: те, чий час дорівнює максимальному в гілці
        var last = await _context.SupportMessages
            .AsNoTracking()
            .Where(m => m.CreatedAt == _context.SupportMessages
                .Where(x => x.UserId == m.UserId)
                .Max(x => x.CreatedAt))
            .ToListAsync();

        var unread = await _context.SupportMessages
            .Where(m => !m.FromAdmin && !m.IsRead)
            .GroupBy(m => m.UserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count);

        var userIds = last.Select(m => m.UserId).ToList();
        var users = await _context.Users
            .AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id);

        return last
            .Where(m => users.ContainsKey(m.UserId))
            .Select(m => new SupportThreadDto
            {
                UserId = m.UserId,
                UserName = users[m.UserId].UserName ?? string.Empty,
                Email = users[m.UserId].Email ?? string.Empty,
                Role = users[m.UserId].Role.ToString(),
                LastText = m.Text,
                LastFromAdmin = m.FromAdmin,
                LastAt = m.CreatedAt,
                Unread = unread.GetValueOrDefault(m.UserId)
            })
            // Спершу гілки з непрочитаним, далі — найсвіжіші
            .OrderByDescending(t => t.Unread > 0)
            .ThenByDescending(t => t.LastAt)
            .ToList();
    }
}
