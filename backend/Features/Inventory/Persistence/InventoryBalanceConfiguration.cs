using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Inventory;

public sealed class InventoryBalanceConfiguration : IEntityTypeConfiguration<InventoryBalance>
{
    public void Configure(EntityTypeBuilder<InventoryBalance> builder)
    {
        builder.ToTable("inventory_balances");

        builder.HasKey(current => current.Id);

        builder.Property(current => current.QuantityOnHand).HasColumnType("numeric(18,2)");
        builder.Property(current => current.TotalValue).HasColumnType("numeric(18,2)");
        builder.Property(current => current.ValuationRate).HasColumnType("numeric(18,4)");

        builder.HasIndex(current => new { current.ItemId, current.WarehouseId }).IsUnique();

        builder.HasOne(current => current.Item)
            .WithMany()
            .HasForeignKey(current => current.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(current => current.Warehouse)
            .WithMany()
            .HasForeignKey(current => current.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
