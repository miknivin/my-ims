using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Transactions.SalesOrders.Persistence;

public sealed class SalesOrderConfiguration : IEntityTypeConfiguration<SalesOrder>
{
    public void Configure(EntityTypeBuilder<SalesOrder> builder)
    {
        builder.ToTable("sales_orders");
        builder.HasKey(salesOrder => salesOrder.Id);

        builder.Property(salesOrder => salesOrder.Status).HasMaxLength(20).IsRequired();
        builder.Property(salesOrder => salesOrder.CreatedById).IsRequired();
        builder.Property(salesOrder => salesOrder.UpdatedById);
        builder.Property(salesOrder => salesOrder.CreatedAtUtc).IsRequired();
        builder.Property(salesOrder => salesOrder.UpdatedAtUtc).IsRequired();

        builder.OwnsOne(salesOrder => salesOrder.OrderDetails, details =>
        {
            details.Property(item => item.VoucherType).HasColumnName("voucher_type").HasMaxLength(20).IsRequired();
            details.Property(item => item.No).HasColumnName("no").HasMaxLength(50).IsRequired();
            details.Property(item => item.Date).HasColumnName("date").IsRequired();
            details.Property(item => item.DeliveryDate).HasColumnName("delivery_date");
            details.HasIndex(item => item.No).IsUnique();
        });

        builder.OwnsOne(salesOrder => salesOrder.PartyInformation, party =>
        {
            party.Property(item => item.CustomerId).HasColumnName("customer_id").IsRequired();
            party.Property(item => item.CustomerNameSnapshot).HasColumnName("customer_name_snapshot").HasMaxLength(150).IsRequired();
            party.Property(item => item.CustomerCodeSnapshot).HasColumnName("customer_code_snapshot").HasMaxLength(50);
            party.Property(item => item.Address).HasColumnName("customer_address").HasMaxLength(500);
            party.Property(item => item.Attention).HasColumnName("customer_attention").HasMaxLength(150);
            party.HasOne(item => item.Customer).WithMany().HasForeignKey(item => item.CustomerId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(salesOrder => salesOrder.CommercialDetails, commercial =>
        {
            commercial.Property(item => item.RateLevel).HasColumnName("rate_level").HasMaxLength(20).IsRequired();
            commercial.Property(item => item.CurrencyId).HasColumnName("currency_id");
            commercial.Property(item => item.CurrencyCodeSnapshot).HasColumnName("currency_code_snapshot").HasMaxLength(20);
            commercial.Property(item => item.CurrencySymbolSnapshot).HasColumnName("currency_symbol_snapshot").HasMaxLength(20);
            commercial.Property(item => item.CreditLimit).HasColumnName("credit_limit").HasColumnType("numeric(18,2)");
            commercial.Property(item => item.IsInterState).HasColumnName("is_inter_state");
            commercial.Property(item => item.TaxApplication).HasColumnName("tax_application").HasMaxLength(30).IsRequired();
            commercial.HasOne(item => item.Currency).WithMany().HasForeignKey(item => item.CurrencyId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(salesOrder => salesOrder.SalesDetails, sales =>
        {
            sales.Property(item => item.SalesManId).HasColumnName("sales_man_id");
            sales.Property(item => item.SalesManNameSnapshot).HasColumnName("sales_man_name_snapshot").HasMaxLength(150);
            sales.HasOne(item => item.SalesMan).WithMany().HasForeignKey(item => item.SalesManId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(salesOrder => salesOrder.Footer, footer =>
        {
            footer.Property(item => item.VehicleNo).HasColumnName("vehicle_no").HasMaxLength(50);
            footer.Property(item => item.Total).HasColumnName("total").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Discount).HasColumnName("discount").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Freight).HasColumnName("freight").HasColumnType("numeric(18,2)");
            footer.Property(item => item.SoAdvance).HasColumnName("so_advance").HasColumnType("numeric(18,2)");
            footer.Property(item => item.RoundOff).HasColumnName("round_off").HasColumnType("numeric(18,2)");
            footer.Property(item => item.NetTotal).HasColumnName("net_total").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Balance).HasColumnName("balance").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Remarks).HasColumnName("remarks").HasMaxLength(2000);
        });

        builder.OwnsMany(salesOrder => salesOrder.Additions, additions =>
        {
            additions.ToTable("sales_order_additions");
            additions.WithOwner().HasForeignKey("sales_order_id");
            additions.HasKey(item => item.Id);
            additions.Property(item => item.Id).HasColumnName("id");
            additions.Property(item => item.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
            additions.Property(item => item.LedgerId).HasColumnName("ledger_id");
            additions.Property(item => item.LedgerNameSnapshot).HasColumnName("ledger_name_snapshot").HasMaxLength(150).IsRequired();
            additions.Property(item => item.Description).HasColumnName("description").HasMaxLength(500);
            additions.Property(item => item.Amount).HasColumnName("amount").HasColumnType("numeric(18,2)");
            additions.HasOne(item => item.Ledger).WithMany().HasForeignKey(item => item.LedgerId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.HasOne(salesOrder => salesOrder.CreatedBy)
            .WithMany()
            .HasForeignKey(salesOrder => salesOrder.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(salesOrder => salesOrder.UpdatedBy)
            .WithMany()
            .HasForeignKey(salesOrder => salesOrder.UpdatedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(salesOrder => salesOrder.Items)
            .WithOne(item => item.SalesOrder)
            .HasForeignKey(item => item.SalesOrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
