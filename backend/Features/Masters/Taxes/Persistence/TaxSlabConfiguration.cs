using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Masters.Taxes.Persistence;

public sealed class TaxSlabConfiguration : IEntityTypeConfiguration<TaxSlab>
{
    public void Configure(EntityTypeBuilder<TaxSlab> builder)
    {
        builder.ToTable("tax_slabs");
        builder.HasKey(slab => slab.Id);

        builder.Property(slab => slab.FromAmount)
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Property(slab => slab.ToAmount)
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Property(slab => slab.Rate)
            .HasColumnType("numeric(18,2)")
            .IsRequired();
    }
}
