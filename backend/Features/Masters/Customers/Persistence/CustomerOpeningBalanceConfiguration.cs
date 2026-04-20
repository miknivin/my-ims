using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Masters.Customers.Persistence;

public sealed class CustomerOpeningBalanceConfiguration : IEntityTypeConfiguration<CustomerOpeningBalance>
{
    public void Configure(EntityTypeBuilder<CustomerOpeningBalance> builder)
    {
        builder.ToTable("customer_opening_balances");
        builder.HasKey(item => item.CustomerId);

        builder.Property(item => item.Amount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(item => item.BalanceType).HasMaxLength(2).IsRequired();
        builder.Property(item => item.AsOfDate).IsRequired();
        builder.Property(item => item.CreatedAtUtc).IsRequired();
        builder.Property(item => item.UpdatedAtUtc).IsRequired();
    }
}
