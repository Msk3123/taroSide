using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Infrastructure.Persistence.Configurations;

public class SupportMessageConfiguration : IEntityTypeConfiguration<SupportMessage>
{
    public void Configure(EntityTypeBuilder<SupportMessage> builder)
    {
        builder.Property(m => m.Text).HasMaxLength(2000).IsRequired();

        // Гілку завжди читаємо як «усі повідомлення юзера по часу»
        builder.HasIndex(m => new { m.UserId, m.CreatedAt });

        // Видалили юзера — його листування з підтримкою теж зникає
        builder.HasOne<AppUser>()
            .WithMany()
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
