using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Accounting.Journals.Persistence;

public sealed class JournalVoucherConfiguration : IEntityTypeConfiguration<JournalVoucher>
{
    public void Configure(EntityTypeBuilder<JournalVoucher> builder)
    {
        builder.ToTable("journal_vouchers");
        builder.HasKey(current => current.Id);

        builder.Property(current => current.VoucherType)
            .HasColumnName("voucher_type")
            .HasColumnType("smallint")
            .IsRequired();
        builder.Property(current => current.VoucherNo)
            .HasColumnName("voucher_no")
            .HasMaxLength(50)
            .IsRequired();
        builder.Property(current => current.PostingDate)
            .HasColumnName("posting_date")
            .IsRequired();
        builder.Property(current => current.Status)
            .HasColumnName("status")
            .HasColumnType("smallint")
            .IsRequired();
        builder.Property(current => current.SourceType)
            .HasColumnName("source_type")
            .HasColumnType("smallint");
        builder.Property(current => current.SourceId)
            .HasColumnName("source_id");
        builder.Property(current => current.Narration)
            .HasColumnName("narration")
            .HasMaxLength(2000);
        builder.Property(current => current.ReversesJournalVoucherId)
            .HasColumnName("reverses_journal_voucher_id");
        builder.Property(current => current.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();
        builder.Property(current => current.UpdatedAtUtc)
            .HasColumnName("updated_at_utc")
            .IsRequired();

        builder.HasIndex(current => new { current.VoucherType, current.VoucherNo }).IsUnique();
        builder.HasIndex(current => new { current.PostingDate, current.Id });
        builder.HasIndex(current => new { current.SourceType, current.SourceId });

        builder.HasMany(current => current.Entries)
            .WithOne(item => item.JournalVoucher)
            .HasForeignKey(item => item.JournalVoucherId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
