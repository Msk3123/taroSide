using Microsoft.EntityFrameworkCore;
using TaroSideAI.Application.DTOs;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;
using TaroSideAI.Infrastructure.Persistence;

namespace TaroSideAI.Infrastructure.Repositories;

public class AdminRepository : IAdminRepository
{
    private readonly AppDbContext _context;

    public AdminRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<AppUser>> GetAllUsersAsync()
    {
        // AsNoTracking — читаємо лише для показу, EF не має відстежувати зміни
        return await _context.Users
            .AsNoTracking()
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();
    }

    public async Task<AdminStatsDto> GetStatsAsync()
    {
        return new AdminStatsDto
        {
            TotalUsers = await _context.Users.CountAsync(),
            TotalConversations = await _context.Conversations.CountAsync(),
            TotalMessages = await _context.Messages.CountAsync(),
            TotalCards = await _context.TarotCards.CountAsync()
        };
    }
}
