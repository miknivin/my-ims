using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Inventory.GoodsReceiptNotes.Persistence;

public sealed class GoodsReceiptNoteConfiguration : IEntityTypeConfiguration<GoodsReceiptNote>
{
    public void Configure(EntityTypeBuilder<GoodsReceiptNote> builder)
    {
        builder.ToTable("goods_receipt_notes");
        builder.HasKey(goodsReceiptNote => goodsReceiptNote.Id);

        builder.Property(goodsReceiptNote => goodsReceiptNote.Status)
            .HasColumnName("status")
            .HasMaxLength(20)
            .IsRequired();
        builder.Property(goodsReceiptNote => goodsReceiptNote.CreatedAtUtc).IsRequired();
        builder.Property(goodsReceiptNote => goodsReceiptNote.UpdatedAtUtc).IsRequired();

        builder.OwnsOne(goodsReceiptNote => goodsReceiptNote.SourceRef, source =>
        {
            source.Property(item => item.Mode).HasColumnName("receipt_mode").HasMaxLength(40).IsRequired();
            source.Property(item => item.PurchaseOrderId).HasColumnName("purchase_order_id");
            source.Property(item => item.PurchaseOrderNo).HasColumnName("purchase_order_no").HasMaxLength(50);
            source.Property(item => item.DirectLpoNo).HasColumnName("direct_lpo_no").HasMaxLength(120);
            source.Property(item => item.DirectVendorInvoiceNo).HasColumnName("direct_vendor_invoice_no").HasMaxLength(120);
        });

        builder.OwnsOne(goodsReceiptNote => goodsReceiptNote.Document, document =>
        {
            document.Property(item => item.VoucherType).HasColumnName("voucher_type").HasMaxLength(20).IsRequired();
            document.Property(item => item.No).HasColumnName("no").HasMaxLength(50).IsRequired();
            document.Property(item => item.Date).HasColumnName("date").IsRequired();
            document.Property(item => item.DeliveryDate).HasColumnName("delivery_date");
            document.HasIndex(item => item.No).IsUnique();
        });

        builder.OwnsOne(goodsReceiptNote => goodsReceiptNote.VendorInformation, vendor =>
        {
            vendor.Property(item => item.VendorId).HasColumnName("vendor_id").IsRequired();
            vendor.Property(item => item.VendorNameSnapshot).HasColumnName("vendor_name_snapshot").HasMaxLength(150).IsRequired();
            vendor.Property(item => item.Address).HasColumnName("vendor_address").HasMaxLength(500).IsRequired();
            vendor.Property(item => item.Attention).HasColumnName("vendor_attention").HasMaxLength(150);
            vendor.Property(item => item.Phone).HasColumnName("vendor_phone").HasMaxLength(50);
            vendor.HasOne(item => item.Vendor).WithMany().HasForeignKey(item => item.VendorId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(goodsReceiptNote => goodsReceiptNote.Logistics, logistics =>
        {
            logistics.Property(item => item.LrService).HasColumnName("lr_service").HasMaxLength(120);
            logistics.Property(item => item.LrNo).HasColumnName("lr_no").HasMaxLength(120);
            logistics.Property(item => item.LrDate).HasColumnName("lr_date");
        });

        builder.OwnsOne(goodsReceiptNote => goodsReceiptNote.General, general =>
        {
            general.Property(item => item.OwnProductsOnly).HasColumnName("own_products_only");
            general.Property(item => item.TaxableMode).HasColumnName("taxable_mode").HasMaxLength(20).IsRequired();
            general.Property(item => item.Notes).HasColumnName("notes").HasMaxLength(2000);
        });

        builder.OwnsOne(goodsReceiptNote => goodsReceiptNote.Footer, footer =>
        {
            footer.Property(item => item.Addition).HasColumnName("addition").HasColumnType("numeric(18,2)");
            footer.Property(item => item.DiscountFooter).HasColumnName("discount_footer").HasColumnType("numeric(18,2)");
            footer.Property(item => item.RoundOff).HasColumnName("round_off").HasColumnType("numeric(18,2)");
            footer.Property(item => item.NetTotal).HasColumnName("net_total").HasColumnType("numeric(18,2)");
            footer.Property(item => item.TotalQty).HasColumnName("total_qty").HasColumnType("numeric(18,2)");
            footer.Property(item => item.TotalFoc).HasColumnName("total_foc").HasColumnType("numeric(18,2)");
            footer.Property(item => item.TotalAmount).HasColumnName("total_amount").HasColumnType("numeric(18,2)");
        });

        builder.HasMany(goodsReceiptNote => goodsReceiptNote.Items)
            .WithOne(item => item.GoodsReceiptNote)
            .HasForeignKey(item => item.GoodsReceiptNoteId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
