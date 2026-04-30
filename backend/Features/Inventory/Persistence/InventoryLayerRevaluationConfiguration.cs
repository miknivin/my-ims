using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Inventory;

public sealed class InventoryLayerRevaluationConfiguration : IEntityTypeConfiguration<InventoryLayerRevaluation>
{
    public void Configure(EntityTypeBuilder<InventoryLayerRevaluation> builder)
    {
        builder.ToTable("inventory_layer_revaluations");

        builder.HasKey(current => current.Id);

        builder.Property(current => current.QuantityAtRevaluation).HasColumnType("numeric(18,2)");
        builder.Property(current => current.PreviousRate).HasColumnType("numeric(18,4)");
        builder.Property(current => current.NewRate).HasColumnType("numeric(18,4)");
        builder.Property(current => current.ValueDelta).HasColumnType("numeric(18,2)");
        builder.Property(current => current.CreatedAtUtc).HasColumnName("created_at_utc");

        builder.HasIndex(current => current.StockLedgerEntryId);
        builder.HasIndex(current => current.FifoLayerId);

        builder.HasOne(current => current.StockLedgerEntry)
            .WithMany()
            .HasForeignKey(current => current.StockLedgerEntryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(current => current.FifoLayer)
            .WithMany()
            .HasForeignKey(current => current.FifoLayerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
