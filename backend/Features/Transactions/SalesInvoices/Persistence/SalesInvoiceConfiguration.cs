using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Transactions.SalesInvoices.Persistence;

public sealed class SalesInvoiceConfiguration : IEntityTypeConfiguration<SalesInvoice>
{
    public void Configure(EntityTypeBuilder<SalesInvoice> builder)
    {
        builder.ToTable("sales_invoices");
        builder.HasKey(salesInvoice => salesInvoice.Id);

        builder.Property(salesInvoice => salesInvoice.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();
        builder.Property(salesInvoice => salesInvoice.CreatedAtUtc).IsRequired();
        builder.Property(salesInvoice => salesInvoice.UpdatedAtUtc).IsRequired();

        builder.OwnsOne(salesInvoice => salesInvoice.SourceRef, reference =>
        {
            reference.Property(item => item.Type)
                .HasColumnName("source_type")
                .HasConversion<string>()
                .HasMaxLength(30)
                .IsRequired();
            reference.Property(item => item.ReferenceId).HasColumnName("source_reference_id");
            reference.Property(item => item.ReferenceNo).HasColumnName("source_reference_no").HasMaxLength(50).IsRequired();
        });

        builder.OwnsOne(salesInvoice => salesInvoice.Document, document =>
        {
            document.Property(item => item.VoucherType).HasColumnName("voucher_type").HasMaxLength(20).IsRequired();
            document.Property(item => item.No).HasColumnName("no").HasMaxLength(50).IsRequired();
            document.Property(item => item.Date).HasColumnName("date").IsRequired();
            document.Property(item => item.DueDate).HasColumnName("due_date").IsRequired();
            document.HasIndex(item => item.No).IsUnique();
        });

        builder.OwnsOne(salesInvoice => salesInvoice.CustomerInformation, customer =>
        {
            customer.Property(item => item.CustomerId).HasColumnName("customer_id").IsRequired();
            customer.Property(item => item.CustomerNameSnapshot).HasColumnName("customer_name_snapshot").HasMaxLength(150).IsRequired();
            customer.Property(item => item.Address).HasColumnName("customer_address").HasMaxLength(500).IsRequired();
            customer.HasOne(item => item.Customer).WithMany().HasForeignKey(item => item.CustomerId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(salesInvoice => salesInvoice.FinancialDetails, finance =>
        {
            finance.Property(item => item.PaymentMode)
                .HasColumnName("payment_mode")
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();
            finance.Property(item => item.InvoiceNo).HasColumnName("invoice_no").HasMaxLength(120);
            finance.Property(item => item.LrNo).HasColumnName("lr_no").HasMaxLength(120);
            finance.Property(item => item.CurrencyId).HasColumnName("currency_id");
            finance.Property(item => item.CurrencyCodeSnapshot).HasColumnName("currency_code_snapshot").HasMaxLength(50);
            finance.Property(item => item.CurrencySymbolSnapshot).HasColumnName("currency_symbol_snapshot").HasMaxLength(20);
            finance.Property(item => item.Balance).HasColumnName("balance").HasColumnType("numeric(18,2)");
            finance.HasOne(item => item.Currency).WithMany().HasForeignKey(item => item.CurrencyId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(salesInvoice => salesInvoice.General, general =>
        {
            general.Property(item => item.Notes).HasColumnName("general_notes").HasMaxLength(2000);
            general.Property(item => item.Taxable).HasColumnName("taxable");
            general.Property(item => item.TaxApplication)
                .HasColumnName("tax_application")
                .HasConversion<string>()
                .HasMaxLength(30)
                .IsRequired();
            general.Property(item => item.InterState).HasColumnName("inter_state");
        });

        builder.OwnsOne(salesInvoice => salesInvoice.Footer, footer =>
        {
            footer.Property(item => item.Notes).HasColumnName("footer_notes").HasMaxLength(2000);
            footer.Property(item => item.Total).HasColumnName("total").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Addition).HasColumnName("addition").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Deduction).HasColumnName("deduction").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Paid).HasColumnName("paid").HasColumnType("numeric(18,2)");
            footer.Property(item => item.NetTotal).HasColumnName("net_total").HasColumnType("numeric(18,2)");
        });

        builder.OwnsMany(salesInvoice => salesInvoice.Additions, additions =>
        {
            additions.ToTable("sales_invoice_additions");
            additions.WithOwner().HasForeignKey("sales_invoice_id");
            additions.HasKey(item => item.Id);
            additions.Property(item => item.Id).HasColumnName("id");
            additions.Property(item => item.Type)
                .HasColumnName("type")
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();
            additions.Property(item => item.LedgerId).HasColumnName("ledger_id");
            additions.Property(item => item.LedgerNameSnapshot).HasColumnName("ledger_name_snapshot").HasMaxLength(150).IsRequired();
            additions.Property(item => item.Description).HasColumnName("description").HasMaxLength(500);
            additions.Property(item => item.Amount).HasColumnName("amount").HasColumnType("numeric(18,2)");
            additions.HasOne(item => item.Ledger).WithMany().HasForeignKey(item => item.LedgerId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.HasMany(salesInvoice => salesInvoice.Items)
            .WithOne(item => item.SalesInvoice)
            .HasForeignKey(item => item.SalesInvoiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
