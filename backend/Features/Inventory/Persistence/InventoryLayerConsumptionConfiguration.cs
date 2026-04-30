using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Inventory;

public sealed class InventoryLayerConsumptionConfiguration : IEntityTypeConfiguration<InventoryLayerConsumption>
{
    public void Configure(EntityTypeBuilder<InventoryLayerConsumption> builder)
    {
        builder.ToTable("inventory_layer_consumptions");

        builder.HasKey(current => current.Id);

        builder.Property(current => current.Quantity).HasColumnType("numeric(18,2)");
        builder.Property(current => current.Rate).HasColumnType("numeric(18,4)");
        builder.Property(current => current.Value).HasColumnType("numeric(18,2)");
        builder.Property(current => current.CreatedAtUtc).HasColumnName("created_at_utc");

        builder.HasIndex(current => current.IssueStockLedgerEntryId);
        builder.HasIndex(current => current.FifoLayerId);

        builder.HasOne(current => current.IssueStockLedgerEntry)
            .WithMany()
            .HasForeignKey(current => current.IssueStockLedgerEntryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(current => current.FifoLayer)
            .WithMany()
            .HasForeignKey(current => current.FifoLayerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
