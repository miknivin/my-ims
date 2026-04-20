using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Transactions.PurchaseOrders.Persistence;

public sealed class PurchaseOrderLineItemConfiguration : IEntityTypeConfiguration<PurchaseOrderLineItem>
{
    public void Configure(EntityTypeBuilder<PurchaseOrderLineItem> builder)
    {
        builder.ToTable("purchase_order_lines");
        builder.HasKey(lineItem => lineItem.Id);

        builder.Property(lineItem => lineItem.ProductNameSnapshot).HasColumnName("item_name_snapshot").HasMaxLength(150).IsRequired();
        builder.Property(lineItem => lineItem.HsnCode).HasMaxLength(50);
        builder.Property(lineItem => lineItem.Quantity).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.Rate).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.GrossAmount).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.DiscountType).HasMaxLength(20).IsRequired();
        builder.Property(lineItem => lineItem.DiscountValue).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.DiscountAmount).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.TaxableAmount).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.CgstRate).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.CgstAmount).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.SgstRate).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.SgstAmount).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.IgstRate).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.IgstAmount).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.LineTotal).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.ReceivedQty).HasColumnType("numeric(18,2)");

        builder.HasOne(lineItem => lineItem.Product)
            .WithMany()
            .HasForeignKey(lineItem => lineItem.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(lineItem => lineItem.Unit)
            .WithMany()
            .HasForeignKey(lineItem => lineItem.UnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(lineItem => lineItem.Warehouse)
            .WithMany()
            .HasForeignKey(lineItem => lineItem.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
