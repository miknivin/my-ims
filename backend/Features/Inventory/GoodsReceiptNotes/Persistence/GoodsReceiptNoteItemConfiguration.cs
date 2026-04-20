using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Inventory.GoodsReceiptNotes.Persistence;

public sealed class GoodsReceiptNoteItemConfiguration : IEntityTypeConfiguration<GoodsReceiptNoteItem>
{
    public void Configure(EntityTypeBuilder<GoodsReceiptNoteItem> builder)
    {
        builder.ToTable("goods_receipt_note_lines");
        builder.HasKey(lineItem => lineItem.Id);

        builder.Property(lineItem => lineItem.SerialNo).HasColumnName("serial_no").IsRequired();
        builder.Property(lineItem => lineItem.ProductNameSnapshot).HasColumnName("product_name_snapshot").HasMaxLength(150).IsRequired();
        builder.Property(lineItem => lineItem.HsnCode).HasColumnName("hsn_code").HasMaxLength(50);
        builder.Property(lineItem => lineItem.Code).HasColumnName("code").HasMaxLength(50);
        builder.Property(lineItem => lineItem.Ubc).HasColumnName("ubc").HasMaxLength(120);
        builder.Property(lineItem => lineItem.Quantity).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.FRate).HasColumnName("f_rate").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.Rate).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.FocQuantity).HasColumnName("foc_quantity").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.GrossAmount).HasColumnName("gross").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.DiscountPercent).HasColumnName("discount_percent").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.DiscountAmount).HasColumnName("discount_amount").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.TaxableAmount).HasColumnName("taxable_amount").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.Total).HasColumnName("total").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.ManufacturingDateUtc).HasColumnName("manufacturing_date_utc");
        builder.Property(lineItem => lineItem.ExpiryDateUtc).HasColumnName("expiry_date_utc");
        builder.Property(lineItem => lineItem.Remark).HasColumnName("remark").HasMaxLength(500);
        builder.Property(lineItem => lineItem.SellingRate).HasColumnName("selling_rate").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.PurchaseOrderLineId).HasColumnName("purchase_order_line_id");

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
