using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Transactions.PurchaseOrders.Persistence;

public sealed class PurchaseOrderConfiguration : IEntityTypeConfiguration<PurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurchaseOrder> builder)
    {
        builder.ToTable("purchase_orders");
        builder.HasKey(purchaseOrder => purchaseOrder.Id);

        builder.Property(purchaseOrder => purchaseOrder.Status).HasMaxLength(20).IsRequired();
        builder.Property(purchaseOrder => purchaseOrder.CreatedAtUtc).IsRequired();
        builder.Property(purchaseOrder => purchaseOrder.UpdatedAtUtc).IsRequired();

        builder.OwnsOne(purchaseOrder => purchaseOrder.OrderDetails, details =>
        {
            details.Property(item => item.VoucherType).HasColumnName("voucher_type").HasMaxLength(20).IsRequired();
            details.Property(item => item.No).HasColumnName("no").HasMaxLength(50).IsRequired();
            details.Property(item => item.Date).HasColumnName("date").IsRequired();
            details.Property(item => item.DueDate).HasColumnName("due_date").IsRequired();
            details.Property(item => item.DeliveryDate).HasColumnName("delivery_date").IsRequired();
            details.HasIndex(item => item.No).IsUnique();
        });

        builder.OwnsOne(purchaseOrder => purchaseOrder.VendorInformation, vendor =>
        {
            vendor.Property(item => item.VendorId).HasColumnName("vendor_id").IsRequired();
            vendor.Property(item => item.VendorNameSnapshot).HasColumnName("vendor_name_snapshot").HasMaxLength(150).IsRequired();
            vendor.Property(item => item.Address).HasColumnName("vendor_address").HasMaxLength(500).IsRequired();
            vendor.Property(item => item.Attention).HasColumnName("vendor_attention").HasMaxLength(150);
            vendor.Property(item => item.Phone).HasColumnName("vendor_phone").HasMaxLength(50);
            vendor.HasOne(item => item.Vendor).WithMany().HasForeignKey(item => item.VendorId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(purchaseOrder => purchaseOrder.FinancialDetails, finance =>
        {
            finance.Property(item => item.PaymentMode).HasColumnName("payment_mode").HasMaxLength(20).IsRequired();
            finance.Property(item => item.CreditLimit).HasColumnName("credit_limit").HasColumnType("numeric(18,2)");
            finance.Property(item => item.CurrencyId).HasColumnName("currency_id");
            finance.Property(item => item.CurrencyLabelSnapshot).HasColumnName("currency_label_snapshot").HasMaxLength(120);
            finance.Property(item => item.Balance).HasColumnName("balance").HasColumnType("numeric(18,2)");
            finance.HasOne(item => item.Currency).WithMany().HasForeignKey(item => item.CurrencyId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(purchaseOrder => purchaseOrder.DeliveryInformation, delivery =>
        {
            delivery.Property(item => item.WarehouseId).HasColumnName("delivery_warehouse_id");
            delivery.Property(item => item.WarehouseNameSnapshot).HasColumnName("delivery_warehouse_name_snapshot").HasMaxLength(150);
            delivery.Property(item => item.Address).HasColumnName("delivery_address").HasMaxLength(500).IsRequired();
            delivery.Property(item => item.Attention).HasColumnName("delivery_attention").HasMaxLength(150);
            delivery.Property(item => item.Phone).HasColumnName("delivery_phone").HasMaxLength(50);
            delivery.HasOne(item => item.Warehouse).WithMany().HasForeignKey(item => item.WarehouseId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(purchaseOrder => purchaseOrder.ProductInformation, product =>
        {
            product.Property(item => item.VendorProducts).HasColumnName("vendor_products").HasMaxLength(50).IsRequired();
            product.Property(item => item.OwnProductsOnly).HasColumnName("own_products_only");
            product.Property(item => item.Reference).HasColumnName("reference").HasMaxLength(120);
            product.Property(item => item.MrNo).HasColumnName("mr_no").HasMaxLength(120);
        });

        builder.OwnsOne(purchaseOrder => purchaseOrder.Footer, footer =>
        {
            footer.Property(item => item.Notes).HasColumnName("notes").HasMaxLength(2000);
            footer.Property(item => item.Remarks).HasColumnName("remarks").HasMaxLength(2000);
            footer.Property(item => item.Taxable).HasColumnName("taxable");
            footer.Property(item => item.Addition).HasColumnName("addition").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Advance).HasColumnName("advance").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Total).HasColumnName("total").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Discount).HasColumnName("discount").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Tax).HasColumnName("tax").HasColumnType("numeric(18,2)");
            footer.Property(item => item.NetTotal).HasColumnName("net_total").HasColumnType("numeric(18,2)");
        });

        builder.OwnsMany(purchaseOrder => purchaseOrder.Additions, additions =>
        {
            additions.ToTable("purchase_order_additions");
            additions.WithOwner().HasForeignKey("purchase_order_id");
            additions.HasKey(item => item.Id);
            additions.Property(item => item.Id).HasColumnName("id");
            additions.Property(item => item.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
            additions.Property(item => item.LedgerId).HasColumnName("ledger_id");
            additions.Property(item => item.LedgerNameSnapshot).HasColumnName("ledger_name_snapshot").HasMaxLength(150).IsRequired();
            additions.Property(item => item.Description).HasColumnName("description").HasMaxLength(500);
            additions.Property(item => item.Amount).HasColumnName("amount").HasColumnType("numeric(18,2)");
            additions.HasOne(item => item.Ledger).WithMany().HasForeignKey(item => item.LedgerId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.HasMany(purchaseOrder => purchaseOrder.Items)
            .WithOne(item => item.PurchaseOrder)
            .HasForeignKey(item => item.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
