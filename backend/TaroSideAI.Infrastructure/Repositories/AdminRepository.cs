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

    public Task<List<AdminConversationDto>> GetUserConversationsAsync(Guid userId)
    {
        return _context.Conversations
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.UpdatedAt)
            .Select(c => new AdminConversationDto
            {
                Id = c.Id,
                Title = c.Title,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                MessagesCount = c.Messages.Count,
                ReadingsCount = c.Messages.Count(m => m.CardsJson != null)
            })
            .ToListAsync();
    }

    public async Task<List<AdminMessageDto>?> GetUserConversationMessagesAsync(Guid userId, Guid conversationId)
    {
        if (!await _context.Conversations.AnyAsync(c => c.Id == conversationId && c.UserId == userId))
            return null;

        return await _context.Messages
            .AsNoTracking()
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new AdminMessageDto
            {
                Id = m.Id,
                Role = m.Role,
                Content = m.Content,
                CreatedAt = m.CreatedAt,
                CardsJson = m.CardsJson
            })
            .ToListAsync();
    }

    public async Task<(int Conversations, int Messages, int Readings, DateTime? LastActive, int Support)> GetUserActivityAsync(Guid userId)
    {
        var conversations = _context.Conversations.Where(c => c.UserId == userId);
        var messages = _context.Messages.Where(m => conversations.Any(c => c.Id == m.ConversationId));

        return (
            await conversations.CountAsync(),
            await messages.CountAsync(),
            await messages.CountAsync(m => m.CardsJson != null),
            // Max по порожній множині в SQL дає NULL — тому каст у DateTime?
            await conversations.MaxAsync(c => (DateTime?)c.UpdatedAt),
            await _context.SupportMessages.CountAsync(m => m.UserId == userId)
        );
    }
}
