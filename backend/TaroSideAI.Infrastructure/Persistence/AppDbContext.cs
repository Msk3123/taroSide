using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Infrastructure.Persistence;

// IdentityDbContext<AppUser, IdentityRole<Guid>, Guid> — розширений DbContext від Identity.
// Він автоматично додає таблиці: AspNetUsers, AspNetRoles, AspNetUserRoles і т.д.
public class AppDbContext : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>
    
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TarotCard> TarotCards => Set<TarotCard>();
    public DbSet<Spread> Spreads => Set<Spread>();
    public DbSet<Reading> Readings => Set<Reading>();
    public DbSet<ReadingCard> ReadingCards => Set<ReadingCard>();
    
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder); // ВАЖЛИВО: Identity налаштовує свої таблиці тут

        // Застосовуємо всі конфігурації з поточної збірки (IEntityTypeConfiguration<T>)
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
