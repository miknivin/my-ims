using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Masters.Uoms.Persistence;

public sealed class UomConfiguration : IEntityTypeConfiguration<Uom>
{
    public void Configure(EntityTypeBuilder<Uom> builder)
    {
        builder.ToTable("uoms");
        builder.HasKey(uom => uom.Id);

        builder.Property(uom => uom.Code)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(uom => uom.Name)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(uom => uom.Status)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(uom => uom.CreatedAtUtc).IsRequired();
        builder.Property(uom => uom.UpdatedAtUtc).IsRequired();

        builder.HasIndex(uom => uom.Code).IsUnique();
    }
}
