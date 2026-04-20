using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Masters.Ledgers.Persistence;

public sealed class LedgerConfiguration : IEntityTypeConfiguration<Ledger>
{
    public void Configure(EntityTypeBuilder<Ledger> builder)
    {
        builder.ToTable("ledgers");
        builder.HasKey(ledger => ledger.Id);

        builder.Property(ledger => ledger.Code)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(ledger => ledger.Name)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(ledger => ledger.Alias)
            .HasMaxLength(120);

        builder.Property(ledger => ledger.Status)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(ledger => ledger.IsSystem).IsRequired();
        builder.Property(ledger => ledger.AllowManualPosting).IsRequired();
        builder.Property(ledger => ledger.IsBillWise).IsRequired();
        builder.Property(ledger => ledger.CreatedAtUtc).IsRequired();
        builder.Property(ledger => ledger.UpdatedAtUtc).IsRequired();

        builder.HasIndex(ledger => ledger.Code).IsUnique();
        builder.HasIndex(ledger => ledger.Name).IsUnique();
        builder.HasIndex(ledger => ledger.LedgerGroupId);

        builder.HasOne(ledger => ledger.LedgerGroup)
            .WithMany(group => group.Ledgers)
            .HasForeignKey(ledger => ledger.LedgerGroupId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ledger => ledger.DefaultCurrency)
            .WithMany()
            .HasForeignKey(ledger => ledger.DefaultCurrencyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
