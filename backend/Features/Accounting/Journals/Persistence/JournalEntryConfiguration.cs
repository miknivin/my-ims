using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Accounting.Journals.Persistence;

public sealed class JournalEntryConfiguration : IEntityTypeConfiguration<JournalEntry>
{
    public void Configure(EntityTypeBuilder<JournalEntry> builder)
    {
        builder.ToTable(
            "journal_entries",
            table =>
            {
                table.HasCheckConstraint(
                    "CK_journal_entries_amount_non_negative",
                    "\"debit_amount\" >= 0 AND \"credit_amount\" >= 0");
                table.HasCheckConstraint(
                    "CK_journal_entries_single_side",
                    "((\"debit_amount\" > 0 AND \"credit_amount\" = 0) OR (\"debit_amount\" = 0 AND \"credit_amount\" > 0))");
            });

        builder.HasKey(current => current.Id);

        builder.Property(current => current.JournalVoucherId)
            .HasColumnName("journal_voucher_id")
            .IsRequired();
        builder.Property(current => current.LineNo)
            .HasColumnName("line_no")
            .IsRequired();
        builder.Property(current => current.PostingDate)
            .HasColumnName("posting_date")
            .IsRequired();
        builder.Property(current => current.VoucherType)
            .HasColumnName("voucher_type")
            .HasColumnType("smallint")
            .IsRequired();
        builder.Property(current => current.VoucherNo)
            .HasColumnName("voucher_no")
            .HasMaxLength(50)
            .IsRequired();
        builder.Property(current => current.SourceType)
            .HasColumnName("source_type")
            .HasColumnType("smallint");
        builder.Property(current => current.SourceId)
            .HasColumnName("source_id");
        builder.Property(current => current.LedgerId)
            .HasColumnName("ledger_id")
            .IsRequired();
        builder.Property(current => current.SubLedgerType)
            .HasColumnName("sub_ledger_type")
            .HasColumnType("smallint");
        builder.Property(current => current.SubLedgerId)
            .HasColumnName("sub_ledger_id");
        builder.Property(current => current.SubLedgerCodeSnapshot)
            .HasColumnName("sub_ledger_code_snapshot")
            .HasMaxLength(50);
        builder.Property(current => current.SubLedgerNameSnapshot)
            .HasColumnName("sub_ledger_name_snapshot")
            .HasMaxLength(150);
        builder.Property(current => current.Narration)
            .HasColumnName("narration")
            .HasMaxLength(2000);
        builder.Property(current => current.DebitAmount)
            .HasColumnName("debit_amount")
            .HasColumnType("numeric(18,2)");
        builder.Property(current => current.CreditAmount)
            .HasColumnName("credit_amount")
            .HasColumnType("numeric(18,2)");
        builder.Property(current => current.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.HasIndex(current => new { current.JournalVoucherId, current.LineNo }).IsUnique();
        builder.HasIndex(current => new { current.LedgerId, current.PostingDate, current.Id });
        builder.HasIndex(current => new { current.LedgerId, current.SubLedgerType, current.SubLedgerId, current.PostingDate, current.Id });
        builder.HasIndex(current => new { current.SourceType, current.SourceId });

        builder.HasOne(current => current.Ledger)
            .WithMany()
            .HasForeignKey(current => current.LedgerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
