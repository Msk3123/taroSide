using Microsoft.EntityFrameworkCore;
using TaroSideAI.Application.Interfaces;
using TaroSideAI.Domain.Entities;
using TaroSideAI.Infrastructure.Persistence;
namespace TaroSideAI.Infrastructure.Repositories;
public class ConversationRepository : IConversationRepository
{
    private readonly AppDbContext _context;
    public ConversationRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<Conversation> GetByIdAsync(Guid id)
    {
        return await _context.Conversations
            .Include(c => c.Messages)
            .OrderBy(c => c.CreatedAt)
            .FirstOrDefaultAsync(c => c.Id == id);
    }
    public async Task<List<Conversation>> GetAllByUserIdAsync(Guid userId)
    {
        return await _context.Conversations
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.UpdatedAt)
            .ToListAsync();
    }
    public async Task<Conversation> CreateAsync(Conversation conversation)
    {
        _context.Conversations.Add(conversation);
        await _context.SaveChangesAsync();
        return conversation;
    }
    public async Task<Message> AddMessageAsync(Message message)
    {
        var conversation = await _context.Conversations.FindAsync(message.ConversationId);
        if (conversation != null)
        {
            conversation.UpdatedAt = DateTime.UtcNow;
            _context.Conversations.Update(conversation);
        }
        _context.Messages.Add(message);
        await _context.SaveChangesAsync();
        return message;
    }
    public async Task<bool> DeleteAsync(Guid id)
    {
        var conversation = await _context.Conversations.FindAsync(id);
        if (conversation == null) return false;
        _context.Conversations.Remove(conversation);
        await _context.SaveChangesAsync();
        return true;
    }
}
