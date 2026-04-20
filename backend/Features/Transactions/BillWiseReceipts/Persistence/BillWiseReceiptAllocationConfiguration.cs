using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Transactions.BillWiseReceipts.Persistence;

public sealed class BillWiseReceiptAllocationConfiguration : IEntityTypeConfiguration<BillWiseReceiptAllocation>
{
    public void Configure(EntityTypeBuilder<BillWiseReceiptAllocation> builder)
    {
        builder.ToTable("billwise_receipt_allocations");
        builder.HasKey(current => current.Id);

        builder.Property(current => current.BillWiseReceiptId).HasColumnName("billwise_receipt_id").IsRequired();
        builder.Property(current => current.SalesInvoiceId).HasColumnName("sales_invoice_id").IsRequired();
        builder.Property(current => current.Sno).HasColumnName("sno").IsRequired();
        builder.Property(current => current.SourceVoucherType)
            .HasColumnName("source_voucher_type")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();
        builder.Property(current => current.SourceNo).HasColumnName("source_no").HasMaxLength(50).IsRequired();
        builder.Property(current => current.SourceDate).HasColumnName("source_date").IsRequired();
        builder.Property(current => current.SourceDueDate).HasColumnName("source_due_date");
        builder.Property(current => current.SourceReferenceNo).HasColumnName("source_reference_no").HasMaxLength(120);
        builder.Property(current => current.DescriptionSnapshot).HasColumnName("description_snapshot").HasMaxLength(2000);
        builder.Property(current => current.OriginalAmount).HasColumnName("original_amount").HasColumnType("numeric(18,2)");
        builder.Property(current => current.OutstandingBefore).HasColumnName("outstanding_before").HasColumnType("numeric(18,2)");
        builder.Property(current => current.PaidAmount).HasColumnName("paid_amount").HasColumnType("numeric(18,2)");
        builder.Property(current => current.DiscountAmount).HasColumnName("discount_amount").HasColumnType("numeric(18,2)");
        builder.Property(current => current.OutstandingAfter).HasColumnName("outstanding_after").HasColumnType("numeric(18,2)");

        builder.HasOne(current => current.SalesInvoice)
            .WithMany()
            .HasForeignKey(current => current.SalesInvoiceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
