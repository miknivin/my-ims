using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Masters.Currencies.Persistence;

public sealed class CurrencyConfiguration : IEntityTypeConfiguration<Currency>
{
    public void Configure(EntityTypeBuilder<Currency> builder)
    {
        builder.ToTable("currencies");
        builder.HasKey(currency => currency.Id);

        builder.Property(currency => currency.Code)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(currency => currency.Name)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(currency => currency.Symbol)
            .HasMaxLength(5)
            .IsRequired();

        builder.Property(currency => currency.Status)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(currency => currency.CreatedAtUtc).IsRequired();
        builder.Property(currency => currency.UpdatedAtUtc).IsRequired();

        builder.HasIndex(currency => currency.Code).IsUnique();
        builder.HasIndex(currency => currency.Name).IsUnique();
    }
}
