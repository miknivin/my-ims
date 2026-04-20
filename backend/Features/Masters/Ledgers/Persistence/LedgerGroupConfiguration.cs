using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Masters.Ledgers.Persistence;

public sealed class LedgerGroupConfiguration : IEntityTypeConfiguration<LedgerGroup>
{
    public void Configure(EntityTypeBuilder<LedgerGroup> builder)
    {
        builder.ToTable("ledger_groups");
        builder.HasKey(group => group.Id);

        builder.Property(group => group.Code)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(group => group.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(group => group.Nature)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(group => group.Status)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(group => group.IsSystem).IsRequired();
        builder.Property(group => group.CreatedAtUtc).IsRequired();
        builder.Property(group => group.UpdatedAtUtc).IsRequired();

        builder.HasIndex(group => group.Code).IsUnique();
        builder.HasIndex(group => group.Name).IsUnique();

        builder.HasOne(group => group.ParentGroup)
            .WithMany(parent => parent.ChildGroups)
            .HasForeignKey(group => group.ParentGroupId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
