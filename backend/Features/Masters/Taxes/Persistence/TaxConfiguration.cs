using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Masters.Taxes.Persistence;

public sealed class TaxConfiguration : IEntityTypeConfiguration<Tax>
{
    public void Configure(EntityTypeBuilder<Tax> builder)
    {
        builder.ToTable("taxes");
        builder.HasKey(tax => tax.Id);

        builder.Property(tax => tax.Name)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(tax => tax.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(tax => tax.Description)
            .HasMaxLength(500);

        builder.Property(tax => tax.Type)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(tax => tax.Status)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(tax => tax.Rate)
            .HasColumnType("numeric(18,2)");

        builder.Property(tax => tax.CreatedAtUtc).IsRequired();
        builder.Property(tax => tax.UpdatedAtUtc).IsRequired();

        builder.HasIndex(tax => tax.Name).IsUnique();
        builder.HasIndex(tax => tax.Code).IsUnique();

        builder.HasMany(tax => tax.Slabs)
            .WithOne(slab => slab.Tax)
            .HasForeignKey(slab => slab.TaxId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
