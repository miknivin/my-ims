using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Masters.Vendors.Persistence;

public sealed class VendorOpeningBalanceConfiguration : IEntityTypeConfiguration<VendorOpeningBalance>
{
    public void Configure(EntityTypeBuilder<VendorOpeningBalance> builder)
    {
        builder.ToTable("vendor_opening_balances");
        builder.HasKey(opening => opening.VendorId);

        builder.Property(opening => opening.Amount)
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Property(opening => opening.BalanceType)
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(opening => opening.AsOfDate).IsRequired();
        builder.Property(opening => opening.CreatedAtUtc).IsRequired();
        builder.Property(opening => opening.UpdatedAtUtc).IsRequired();
    }
}
