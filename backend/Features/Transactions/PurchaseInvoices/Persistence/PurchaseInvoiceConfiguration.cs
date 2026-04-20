using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Transactions.PurchaseInvoices.Persistence;

public sealed class PurchaseInvoiceConfiguration : IEntityTypeConfiguration<PurchaseInvoice>
{
    public void Configure(EntityTypeBuilder<PurchaseInvoice> builder)
    {
        builder.ToTable("purchase_invoices");
        builder.HasKey(purchaseInvoice => purchaseInvoice.Id);

        builder.Property(purchaseInvoice => purchaseInvoice.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();
        builder.Property(purchaseInvoice => purchaseInvoice.CreatedAtUtc).IsRequired();
        builder.Property(purchaseInvoice => purchaseInvoice.UpdatedAtUtc).IsRequired();

        builder.OwnsOne(purchaseInvoice => purchaseInvoice.SourceRef, reference =>
        {
            reference.Property(item => item.Type)
                .HasColumnName("source_type")
                .HasConversion<string>()
                .HasMaxLength(30)
                .IsRequired();
            reference.Property(item => item.ReferenceId).HasColumnName("source_reference_id");
            reference.Property(item => item.ReferenceNo).HasColumnName("source_reference_no").HasMaxLength(50).IsRequired();
        });

        builder.OwnsOne(purchaseInvoice => purchaseInvoice.Document, document =>
        {
            document.Property(item => item.No).HasColumnName("no").HasMaxLength(50).IsRequired();
            document.Property(item => item.Date).HasColumnName("date").IsRequired();
            document.Property(item => item.DueDate).HasColumnName("due_date").IsRequired();
            document.HasIndex(item => item.No).IsUnique();
        });

        builder.OwnsOne(purchaseInvoice => purchaseInvoice.VendorInformation, vendor =>
        {
            vendor.Property(item => item.VendorId).HasColumnName("vendor_id").IsRequired();
            vendor.Property(item => item.VendorNameSnapshot).HasColumnName("vendor_name_snapshot").HasMaxLength(150).IsRequired();
            vendor.Property(item => item.Address).HasColumnName("vendor_address").HasMaxLength(500).IsRequired();
            vendor.Property(item => item.Attention).HasColumnName("vendor_attention").HasMaxLength(150);
            vendor.Property(item => item.Phone).HasColumnName("vendor_phone").HasMaxLength(50);
            vendor.HasOne(item => item.Vendor).WithMany().HasForeignKey(item => item.VendorId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(purchaseInvoice => purchaseInvoice.FinancialDetails, finance =>
        {
            finance.Property(item => item.PaymentMode)
                .HasColumnName("payment_mode")
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();
            finance.Property(item => item.SupplierInvoiceNo).HasColumnName("supplier_invoice_no").HasMaxLength(120);
            finance.Property(item => item.LrNo).HasColumnName("lr_no").HasMaxLength(120);
            finance.Property(item => item.CurrencyId).HasColumnName("currency_id");
            finance.Property(item => item.CurrencyCodeSnapshot).HasColumnName("currency_code_snapshot").HasMaxLength(50);
            finance.Property(item => item.CurrencySymbolSnapshot).HasColumnName("currency_symbol_snapshot").HasMaxLength(20);
            finance.Property(item => item.Balance).HasColumnName("balance").HasColumnType("numeric(18,2)");
            finance.HasOne(item => item.Currency).WithMany().HasForeignKey(item => item.CurrencyId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(purchaseInvoice => purchaseInvoice.ProductInformation, product =>
        {
            product.Property(item => item.VendorProducts).HasColumnName("vendor_products").HasMaxLength(50).IsRequired();
            product.Property(item => item.OwnProductsOnly).HasColumnName("own_products_only");
        });

        builder.OwnsOne(purchaseInvoice => purchaseInvoice.General, general =>
        {
            general.Property(item => item.Notes).HasColumnName("general_notes").HasMaxLength(2000);
            general.Property(item => item.SearchBarcode).HasColumnName("search_barcode").HasMaxLength(120);
            general.Property(item => item.Taxable).HasColumnName("taxable");
            general.Property(item => item.TaxApplication)
                .HasColumnName("tax_application")
                .HasConversion<string>()
                .HasMaxLength(30)
                .IsRequired();
            general.Property(item => item.InterState).HasColumnName("inter_state");
            general.Property(item => item.TaxOnFoc).HasColumnName("tax_on_foc");
        });

        builder.OwnsOne(purchaseInvoice => purchaseInvoice.Footer, footer =>
        {
            footer.Property(item => item.Notes).HasColumnName("footer_notes").HasMaxLength(2000);
            footer.Property(item => item.Total).HasColumnName("total").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Discount).HasColumnName("discount").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Addition).HasColumnName("addition").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Deduction).HasColumnName("deduction").HasColumnType("numeric(18,2)");
            footer.Property(item => item.NetTotal).HasColumnName("net_total").HasColumnType("numeric(18,2)");
        });

        builder.OwnsMany(purchaseInvoice => purchaseInvoice.Additions, additions =>
        {
            additions.ToTable("purchase_invoice_additions");
            additions.WithOwner().HasForeignKey("purchase_invoice_id");
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

        builder.HasMany(purchaseInvoice => purchaseInvoice.Items)
            .WithOne(item => item.PurchaseInvoice)
            .HasForeignKey(item => item.PurchaseInvoiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
