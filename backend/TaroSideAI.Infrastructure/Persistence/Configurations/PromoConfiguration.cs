using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaroSideAI.Domain.Entities;

namespace TaroSideAI.Infrastructure.Persistence.Configurations;

public class PromoCodeConfiguration : IEntityTypeConfiguration<PromoCode>
{
    public void Configure(EntityTypeBuilder<PromoCode> builder)
    {
        builder.Property(p => p.Code).HasMaxLength(32).IsRequired();
        builder.Property(p => p.Name).HasMaxLength(80).IsRequired();
        builder.HasIndex(p => p.Code).IsUnique();
    }
}

public class PromoRedemptionConfiguration : IEntityTypeConfiguration<PromoRedemption>
{
    public void Configure(EntityTypeBuilder<PromoRedemption> builder)
    {
        // Унікальність гарантує «один код — один раз» навіть за одночасних запитів.
        builder.HasIndex(r => new { r.PromoCodeId, r.UserId }).IsUnique();
        builder.HasIndex(r => r.UserId);

        builder.HasOne(r => r.PromoCode)
            .WithMany()
            .HasForeignKey(r => r.PromoCodeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<AppUser>()
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
