using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Inventory;

public sealed class FifoLayerConfiguration : IEntityTypeConfiguration<FifoLayer>
{
    public void Configure(EntityTypeBuilder<FifoLayer> builder)
    {
        builder.ToTable("fifo_layers");

        builder.HasKey(current => current.Id);

        builder.Ignore(current => current.IsDepleted);

        builder.Property(current => current.SourceType).HasMaxLength(30);
        builder.Property(current => current.OriginalQuantity).HasColumnType("numeric(18,2)");
        builder.Property(current => current.RemainingQuantity).HasColumnType("numeric(18,2)");
        builder.Property(current => current.Rate).HasColumnType("numeric(18,4)");

        builder.HasIndex(current => new { current.ItemId, current.WarehouseId, current.PostingDateUtc });
        builder.HasIndex(current => new { current.SourceType, current.SourceId });

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
