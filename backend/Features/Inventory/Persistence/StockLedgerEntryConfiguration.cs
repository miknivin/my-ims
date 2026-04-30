using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Inventory;

public sealed class StockLedgerEntryConfiguration : IEntityTypeConfiguration<StockLedgerEntry>
{
    public void Configure(EntityTypeBuilder<StockLedgerEntry> builder)
    {
        builder.ToTable("stock_ledger_entries");

        builder.HasKey(current => current.Id);

        builder.Property(current => current.QuantityChange).HasColumnType("numeric(18,2)");
        builder.Property(current => current.ValuationRate).HasColumnType("numeric(18,4)");
        builder.Property(current => current.ValueChange).HasColumnType("numeric(18,2)");
        builder.Property(current => current.BalanceQuantity).HasColumnType("numeric(18,2)");
        builder.Property(current => current.BalanceValue).HasColumnType("numeric(18,2)");
        builder.Property(current => current.MovementType).HasMaxLength(30);
        builder.Property(current => current.SourceType).HasMaxLength(30);
        builder.Property(current => current.SourceLineId).HasColumnName("source_line_id");
        builder.Property(current => current.Remarks).HasMaxLength(500);

        builder.HasIndex(current => new { current.ItemId, current.WarehouseId, current.PostingDateUtc });
        builder.HasIndex(current => new { current.SourceType, current.SourceId });
        builder.HasIndex(current => new { current.SourceType, current.SourceId, current.SourceLineId });

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
