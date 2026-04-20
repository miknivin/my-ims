using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Transactions.PurchaseInvoices.Persistence;

public sealed class PurchaseInvoiceLineItemConfiguration : IEntityTypeConfiguration<PurchaseInvoiceLineItem>
{
    public void Configure(EntityTypeBuilder<PurchaseInvoiceLineItem> builder)
    {
        builder.ToTable("purchase_invoice_lines");
        builder.HasKey(lineItem => lineItem.Id);

        builder.Property(lineItem => lineItem.Sno).HasColumnName("sno").IsRequired();
        builder.Property(lineItem => lineItem.ProductCodeSnapshot).HasColumnName("product_code_snapshot").HasMaxLength(50);
        builder.Property(lineItem => lineItem.ProductNameSnapshot).HasColumnName("product_name_snapshot").HasMaxLength(150).IsRequired();
        builder.Property(lineItem => lineItem.HsnCode).HasColumnName("hsn_code").HasMaxLength(50);
        builder.Property(lineItem => lineItem.Quantity).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.Foc).HasColumnName("foc").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.Rate).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.GrossAmount).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.DiscountPercent).HasColumnName("discount_percent").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.DiscountAmount).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.TaxableAmount).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.TaxPercent).HasColumnName("tax_percent").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.TaxAmount).HasColumnName("tax_amount").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.Cost).HasColumnName("cost").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.ProfitPercent).HasColumnName("profit_percent").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.ProfitAmount).HasColumnName("profit_amount").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.SellingRate).HasColumnName("selling_rate").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.WholesaleRate).HasColumnName("wholesale_rate").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.Mrp).HasColumnName("mrp").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.LineTotal).HasColumnName("line_total").HasColumnType("numeric(18,2)");

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
