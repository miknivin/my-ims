using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Transactions.SalesOrders.Persistence;

public sealed class SalesOrderLineItemConfiguration : IEntityTypeConfiguration<SalesOrderLineItem>
{
    public void Configure(EntityTypeBuilder<SalesOrderLineItem> builder)
    {
        builder.ToTable("sales_order_lines");
        builder.HasKey(lineItem => lineItem.Id);

        builder.Property(lineItem => lineItem.Sno).HasColumnName("sno").IsRequired();
        builder.Property(lineItem => lineItem.ProductNameSnapshot).HasColumnName("product_name_snapshot").HasMaxLength(150).IsRequired();
        builder.Property(lineItem => lineItem.HsnCode).HasColumnName("hsn_code").HasMaxLength(50);
        builder.Property(lineItem => lineItem.Quantity).HasColumnName("quantity").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.Foc).HasColumnName("foc").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.Mrp).HasColumnName("mrp").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.Rate).HasColumnName("unit_rate").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.GrossAmount).HasColumnName("gross_amount").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.DiscountPercent).HasColumnName("discount_percent").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.DiscountAmount).HasColumnName("discount_amount").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.TaxableAmount).HasColumnName("taxable_amount").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.TaxPercent).HasColumnName("tax_percent").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.TaxAmount).HasColumnName("tax_amount").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.NetAmount).HasColumnName("net_amount").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.WarehouseId).HasColumnName("warehouse_id");

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
