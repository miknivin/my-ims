using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Transactions.SalesCreditNotes.Persistence;

public sealed class SalesCreditNoteLineItemConfiguration : IEntityTypeConfiguration<SalesCreditNoteLineItem>
{
    public void Configure(EntityTypeBuilder<SalesCreditNoteLineItem> builder)
    {
        builder.ToTable("sales_credit_note_lines");
        builder.HasKey(lineItem => lineItem.Id);

        builder.Property(lineItem => lineItem.SourceLineId).HasColumnName("source_line_id").IsRequired();
        builder.Property(lineItem => lineItem.Sno).HasColumnName("sno").IsRequired();
        builder.Property(lineItem => lineItem.ProductCodeSnapshot).HasColumnName("product_code_snapshot").HasMaxLength(50);
        builder.Property(lineItem => lineItem.ProductNameSnapshot).HasColumnName("product_name_snapshot").HasMaxLength(150).IsRequired();
        builder.Property(lineItem => lineItem.HsnCode).HasColumnName("hsn_code").HasMaxLength(50);
        builder.Property(lineItem => lineItem.Quantity).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.Rate).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.GrossAmount).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.DiscountPercent).HasColumnName("discount_percent").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.DiscountAmount).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.TaxableAmount).HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.TaxPercent).HasColumnName("tax_percent").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.TaxAmount).HasColumnName("tax_amount").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.CostRate).HasColumnName("cost_rate").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.CogsAmount).HasColumnName("cogs_amount").HasColumnType("numeric(18,2)");
        builder.Property(lineItem => lineItem.GrossProfitAmount).HasColumnName("gross_profit_amount").HasColumnType("numeric(18,2)");
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
