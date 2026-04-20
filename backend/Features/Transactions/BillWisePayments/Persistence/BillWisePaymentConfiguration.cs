using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Transactions.BillWisePayments.Persistence;

public sealed class BillWisePaymentConfiguration : IEntityTypeConfiguration<BillWisePayment>
{
    public void Configure(EntityTypeBuilder<BillWisePayment> builder)
    {
        builder.ToTable("billwise_payments");
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

        builder.OwnsOne(current => current.VendorInformation, vendor =>
        {
            vendor.Property(item => item.VendorId).HasColumnName("vendor_id").IsRequired();
            vendor.Property(item => item.VendorNameSnapshot).HasColumnName("vendor_name_snapshot").HasMaxLength(150).IsRequired();
            vendor.Property(item => item.Address).HasColumnName("vendor_address").HasMaxLength(500).IsRequired();
            vendor.Property(item => item.Attention).HasColumnName("vendor_attention").HasMaxLength(150);
            vendor.Property(item => item.Phone).HasColumnName("vendor_phone").HasMaxLength(50);
            vendor.HasOne(item => item.Vendor).WithMany().HasForeignKey(item => item.VendorId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(current => current.AccountInformation, account =>
        {
            account.Property(item => item.LedgerId).HasColumnName("ledger_id").IsRequired();
            account.Property(item => item.LedgerNameSnapshot).HasColumnName("ledger_name_snapshot").HasMaxLength(150).IsRequired();
            account.HasOne(item => item.Ledger).WithMany().HasForeignKey(item => item.LedgerId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.HasMany(current => current.Allocations)
            .WithOne(item => item.BillWisePayment)
            .HasForeignKey(item => item.BillWisePaymentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
