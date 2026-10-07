using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Infrastructure.Persistence.Configurations;

public class AnalyticsEventConfiguration : IEntityTypeConfiguration<AnalyticsEvent>
{
    public void Configure(EntityTypeBuilder<AnalyticsEvent> builder)
    {
        builder.Property(e => e.VisitorId).HasMaxLength(64).IsRequired();
        builder.Property(e => e.Type).HasMaxLength(32).IsRequired();
        builder.Property(e => e.Path).HasMaxLength(200).IsRequired();

        // Усі звіти фільтрують за періодом — індекс по даті робить їх швидкими
        builder.HasIndex(e => e.CreatedAt);

        // Видалили юзера — його події лишаються як анонімні (статистика не «провалюється»)
        builder.HasOne<AppUser>()
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
