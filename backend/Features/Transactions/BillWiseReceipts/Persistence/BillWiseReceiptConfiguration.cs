using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Transactions.BillWiseReceipts.Persistence;

public sealed class BillWiseReceiptConfiguration : IEntityTypeConfiguration<BillWiseReceipt>
{
    public void Configure(EntityTypeBuilder<BillWiseReceipt> builder)
    {
        builder.ToTable("billwise_receipts");
        builder.HasKey(current => current.Id);

        builder.Property(current => current.VoucherType)
            .HasColumnName("voucher_type")
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();
        builder.Property(current => current.No).HasColumnName("no").HasMaxLength(50).IsRequired();
        builder.Property(current => current.Date).HasColumnName("date").IsRequired();
        builder.Property(current => current.ReferenceNo).HasColumnName("reference_no").HasMaxLength(120);
        builder.Property(current => current.InstrumentNo).HasColumnName("instrument_no").HasMaxLength(120);
        builder.Property(current => current.InstrumentDate).HasColumnName("instrument_date");
        builder.Property(current => current.Notes).HasColumnName("notes").HasMaxLength(2000);
        builder.Property(current => current.TotalAllocated).HasColumnName("total_allocated").HasColumnType("numeric(18,2)");
        builder.Property(current => current.TotalDiscount).HasColumnName("total_discount").HasColumnType("numeric(18,2)");
        builder.Property(current => current.Advance).HasColumnName("advance").HasColumnType("numeric(18,2)");
        builder.Property(current => current.Amount).HasColumnName("amount").HasColumnType("numeric(18,2)");
        builder.Property(current => current.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();
        builder.Property(current => current.CreatedAtUtc).HasColumnName("created_at_utc").IsRequired();
        builder.Property(current => current.UpdatedAtUtc).HasColumnName("updated_at_utc").IsRequired();

        builder.HasIndex(current => current.No).IsUnique();

        builder.OwnsOne(current => current.CustomerInformation, customer =>
        {
            customer.Property(item => item.CustomerId).HasColumnName("customer_id").IsRequired();
            customer.Property(item => item.CustomerNameSnapshot).HasColumnName("customer_name_snapshot").HasMaxLength(150).IsRequired();
            customer.Property(item => item.Address).HasColumnName("customer_address").HasMaxLength(500).IsRequired();
            customer.HasOne(item => item.Customer).WithMany().HasForeignKey(item => item.CustomerId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(current => current.AccountInformation, account =>
        {
            account.Property(item => item.LedgerId).HasColumnName("ledger_id").IsRequired();
            account.Property(item => item.LedgerNameSnapshot).HasColumnName("ledger_name_snapshot").HasMaxLength(150).IsRequired();
            account.HasOne(item => item.Ledger).WithMany().HasForeignKey(item => item.LedgerId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.HasMany(current => current.Allocations)
            .WithOne(item => item.BillWiseReceipt)
            .HasForeignKey(item => item.BillWiseReceiptId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
