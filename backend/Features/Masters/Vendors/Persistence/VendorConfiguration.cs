using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Masters.Vendors.Persistence;

public sealed class VendorConfiguration : IEntityTypeConfiguration<Vendor>
{
    public void Configure(EntityTypeBuilder<Vendor> builder)
    {
        builder.ToTable("vendors");
        builder.HasKey(vendor => vendor.Id);

        builder.Property(vendor => vendor.Status)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(vendor => vendor.CreatedAtUtc).IsRequired();
        builder.Property(vendor => vendor.UpdatedAtUtc).IsRequired();

        builder.OwnsOne(vendor => vendor.BasicInfo, basicInfo =>
        {
            basicInfo.Property(info => info.Code)
                .HasColumnName("code")
                .HasMaxLength(20)
                .IsRequired();

            basicInfo.Property(info => info.Name)
                .HasColumnName("name")
                .HasMaxLength(120)
                .IsRequired();

            basicInfo.Property(info => info.Under)
                .HasColumnName("under")
                .HasMaxLength(120);

            basicInfo.HasIndex(info => info.Code).IsUnique();
            basicInfo.HasIndex(info => info.Name).IsUnique();
        });

        builder.OwnsOne(vendor => vendor.AddressAndContact, address =>
        {
            address.Property(info => info.ContactName).HasColumnName("contact_name").HasMaxLength(120);
            address.Property(info => info.NameInOl).HasColumnName("name_in_ol").HasMaxLength(120);
            address.Property(info => info.Address).HasColumnName("address").HasMaxLength(250).IsRequired();
            address.Property(info => info.Phone).HasColumnName("phone").HasMaxLength(30).IsRequired();
            address.Property(info => info.Mobile).HasColumnName("mobile").HasMaxLength(30);
            address.Property(info => info.Email).HasColumnName("email").HasMaxLength(120).IsRequired();
            address.Property(info => info.Web).HasColumnName("web").HasMaxLength(150);
            address.Property(info => info.Fax).HasColumnName("fax").HasMaxLength(50);
        });

        builder.OwnsOne(vendor => vendor.CreditAndFinance, finance =>
        {
            finance.Property(info => info.CreditLimit).HasColumnName("credit_limit").HasColumnType("numeric(18,2)");
            finance.Property(info => info.DueDays).HasColumnName("due_days");
            finance.Property(info => info.CurrencyId).HasColumnName("currency_id");
            finance.Property(info => info.PaymentTerms).HasColumnName("payment_terms").HasMaxLength(150);
            finance.Property(info => info.Remark).HasColumnName("remark").HasMaxLength(500);

            finance.HasOne(info => info.Currency)
                .WithMany()
                .HasForeignKey(info => info.CurrencyId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(vendor => vendor.TaxAndCompliance, tax =>
        {
            tax.Property(info => info.Gstin).HasColumnName("gstin").HasMaxLength(30);
            tax.Property(info => info.Tin).HasColumnName("tin").HasMaxLength(30);
        });

        builder.OwnsOne(vendor => vendor.BankDetails, bank =>
        {
            bank.Property(info => info.BankDetails).HasColumnName("bank_details").HasMaxLength(150);
            bank.Property(info => info.AccountNo).HasColumnName("account_no").HasMaxLength(50);
            bank.Property(info => info.BankAddress).HasColumnName("bank_address").HasMaxLength(250);
        });

        builder.OwnsOne(vendor => vendor.Other, other =>
        {
            other.Property(info => info.Company).HasColumnName("company").HasMaxLength(120);
        });

        builder.HasOne(vendor => vendor.Ledger)
            .WithMany()
            .HasForeignKey(vendor => vendor.LedgerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(vendor => vendor.OpeningBalance)
            .WithOne(opening => opening.Vendor)
            .HasForeignKey<VendorOpeningBalance>(opening => opening.VendorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
