using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Masters.Warehouses.Persistence;

public sealed class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.ToTable("warehouses");
        builder.HasKey(warehouse => warehouse.Id);

        builder.Property(warehouse => warehouse.Code).HasMaxLength(20).IsRequired();
        builder.Property(warehouse => warehouse.Name).HasMaxLength(120).IsRequired();
        builder.Property(warehouse => warehouse.ContactPerson).HasMaxLength(120);
        builder.Property(warehouse => warehouse.Phone).HasMaxLength(30);
        builder.Property(warehouse => warehouse.Email).HasMaxLength(120);
        builder.Property(warehouse => warehouse.Address).HasMaxLength(250);
        builder.Property(warehouse => warehouse.Status).HasMaxLength(20).IsRequired();
        builder.Property(warehouse => warehouse.CreatedAtUtc).IsRequired();
        builder.Property(warehouse => warehouse.UpdatedAtUtc).IsRequired();

        builder.HasIndex(warehouse => warehouse.Code).IsUnique();
        builder.HasIndex(warehouse => warehouse.Name).IsUnique();
    }
}
