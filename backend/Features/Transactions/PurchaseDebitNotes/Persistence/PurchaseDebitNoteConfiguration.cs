using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Transactions.PurchaseDebitNotes.Persistence;

public sealed class PurchaseDebitNoteConfiguration : IEntityTypeConfiguration<PurchaseDebitNote>
{
    public void Configure(EntityTypeBuilder<PurchaseDebitNote> builder)
    {
        builder.ToTable("purchase_debit_notes");
        builder.HasKey(current => current.Id);

        builder.Ignore(current => current.AffectsInventory);
        builder.Ignore(current => current.InventoryEffect);

        builder.Property(current => current.NoteNature)
            .HasColumnName("note_nature")
            .HasConversion<string>()
            .HasMaxLength(40)
            .IsRequired();
        builder.Property(current => current.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();
        builder.Property(current => current.CreatedAtUtc).IsRequired();
        builder.Property(current => current.UpdatedAtUtc).IsRequired();

        builder.OwnsOne(current => current.SourceRef, reference =>
        {
            reference.Property(item => item.ReferenceId).HasColumnName("source_reference_id");
            reference.Property(item => item.ReferenceNo).HasColumnName("source_reference_no").HasMaxLength(50).IsRequired();
        });

        builder.OwnsOne(current => current.Document, document =>
        {
            document.Property(item => item.VoucherType).HasColumnName("voucher_type").HasMaxLength(20).IsRequired();
            document.Property(item => item.No).HasColumnName("no").HasMaxLength(50).IsRequired();
            document.Property(item => item.Date).HasColumnName("date").IsRequired();
            document.Property(item => item.DueDate).HasColumnName("due_date").IsRequired();
            document.HasIndex(item => item.No).IsUnique();
        });

        builder.OwnsOne(current => current.VendorInformation, vendor =>
        {
            vendor.Property(item => item.VendorId).HasColumnName("vendor_id").IsRequired();
            vendor.Property(item => item.VendorNameSnapshot).HasColumnName("vendor_name_snapshot").HasMaxLength(150).IsRequired();
            vendor.Property(item => item.Address).HasColumnName("vendor_address").HasMaxLength(500).IsRequired();
            vendor.Property(item => item.Attention).HasColumnName("vendor_attention").HasMaxLength(150);
            vendor.Property(item => item.Phone).HasColumnName("vendor_phone").HasMaxLength(50);
            vendor.HasOne(item => item.Vendor).WithMany().HasForeignKey(item => item.VendorId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(current => current.FinancialDetails, finance =>
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
            finance.HasOne(item => item.Currency).WithMany().HasForeignKey(item => item.CurrencyId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(current => current.ProductInformation, product =>
        {
            product.Property(item => item.VendorProducts).HasColumnName("vendor_products").HasMaxLength(50).IsRequired();
            product.Property(item => item.OwnProductsOnly).HasColumnName("own_products_only");
        });

        builder.OwnsOne(current => current.General, general =>
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

        builder.OwnsOne(current => current.Footer, footer =>
        {
            footer.Property(item => item.Notes).HasColumnName("footer_notes").HasMaxLength(2000);
            footer.Property(item => item.Total).HasColumnName("total").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Discount).HasColumnName("discount").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Addition).HasColumnName("addition").HasColumnType("numeric(18,2)");
            footer.Property(item => item.Deduction).HasColumnName("deduction").HasColumnType("numeric(18,2)");
            footer.Property(item => item.NetTotal).HasColumnName("net_total").HasColumnType("numeric(18,2)");
        });

        builder.OwnsMany(current => current.Additions, additions =>
        {
            additions.ToTable("purchase_debit_note_additions");
            additions.WithOwner().HasForeignKey("purchase_debit_note_id");
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

        builder.HasMany(current => current.Items)
            .WithOne(item => item.PurchaseDebitNote)
            .HasForeignKey(item => item.PurchaseDebitNoteId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
