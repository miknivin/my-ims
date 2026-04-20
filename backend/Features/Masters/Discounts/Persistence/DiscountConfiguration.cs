using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Masters.Discounts.Persistence;

public sealed class DiscountConfiguration : IEntityTypeConfiguration<Discount>
{
    public void Configure(EntityTypeBuilder<Discount> builder)
    {
        builder.ToTable("discounts");
        builder.HasKey(discount => discount.Id);

        builder.Property(discount => discount.Code)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(discount => discount.Name)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(discount => discount.Description)
            .HasMaxLength(300);

        builder.Property(discount => discount.Type)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(discount => discount.Value)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(discount => discount.Status)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(discount => discount.CreatedAtUtc).IsRequired();
        builder.Property(discount => discount.UpdatedAtUtc).IsRequired();

        builder.HasIndex(discount => discount.Code).IsUnique();
        builder.HasIndex(discount => discount.Name).IsUnique();
    }
}
