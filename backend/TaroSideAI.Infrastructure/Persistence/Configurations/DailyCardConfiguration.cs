using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Infrastructure.Persistence.Configurations;

public class DailyCardConfiguration : IEntityTypeConfiguration<DailyCard>
{
    public void Configure(EntityTypeBuilder<DailyCard> builder)
    {
        // Гарантія на рівні БД: у одного юзера не може бути двох карт за один день
        builder.HasIndex(dc => new { dc.UserId, dc.Date }).IsUnique();

        builder.HasOne(dc => dc.Card)
            .WithMany()
            .HasForeignKey(dc => dc.CardId)
            .OnDelete(DeleteBehavior.Restrict);

        // Видалили юзера — його карти дня зникають разом з ним
        builder.HasOne<AppUser>()
            .WithMany()
            .HasForeignKey(dc => dc.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
