using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Masters.Customers.Persistence;

public sealed class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("customers");
        builder.HasKey(customer => customer.Id);

        builder.Property(customer => customer.Status).HasMaxLength(20).IsRequired();
        builder.Property(customer => customer.CreatedAtUtc).IsRequired();
        builder.Property(customer => customer.UpdatedAtUtc).IsRequired();

        builder.OwnsOne(customer => customer.BasicDetails, basic =>
        {
            basic.Property(item => item.Code).HasColumnName("code").HasMaxLength(20).IsRequired();
            basic.Property(item => item.Name).HasColumnName("name").HasMaxLength(150).IsRequired();
            basic.Property(item => item.Alias).HasColumnName("alias").HasMaxLength(150);
            basic.Property(item => item.CustomerType).HasColumnName("customer_type").HasMaxLength(30).IsRequired();
            basic.Property(item => item.Category).HasColumnName("category").HasMaxLength(120);
            basic.HasIndex(item => item.Code).IsUnique();
            basic.HasIndex(item => item.Name).IsUnique();
        });

        builder.OwnsOne(customer => customer.Contact, contact =>
        {
            contact.Property(item => item.Phone).HasColumnName("phone").HasMaxLength(30);
            contact.Property(item => item.Mobile).HasColumnName("mobile").HasMaxLength(30);
            contact.Property(item => item.Email).HasColumnName("email").HasMaxLength(120);
            contact.Property(item => item.Website).HasColumnName("website").HasMaxLength(200);
        });

        builder.OwnsOne(customer => customer.BillingAddress, address =>
        {
            address.Property(item => item.Street).HasColumnName("billing_street").HasMaxLength(250);
            address.Property(item => item.City).HasColumnName("billing_city").HasMaxLength(120);
            address.Property(item => item.State).HasColumnName("billing_state").HasMaxLength(120);
            address.Property(item => item.Pincode).HasColumnName("billing_pincode").HasMaxLength(20);
            address.Property(item => item.Country).HasColumnName("billing_country").HasMaxLength(120);
        });

        builder.OwnsOne(customer => customer.Financials, financials =>
        {
            financials.Property(item => item.CreditLimit).HasColumnName("credit_limit").HasColumnType("numeric(18,2)");
            financials.Property(item => item.CreditDays).HasColumnName("credit_days");
        });

        builder.OwnsOne(customer => customer.SalesAndPricing, sales =>
        {
            sales.Property(item => item.DefaultTaxId).HasColumnName("default_tax_id");
            sales.Property(item => item.PriceLevel).HasColumnName("price_level").HasMaxLength(20).IsRequired();
            sales.HasOne(item => item.DefaultTax).WithMany().HasForeignKey(item => item.DefaultTaxId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(customer => customer.StatusDetails, status =>
        {
            status.Property(item => item.Remarks).HasColumnName("remarks").HasMaxLength(500);
        });

        builder.OwnsMany(customer => customer.ShippingAddresses, shipping =>
        {
            shipping.ToTable("customer_shipping_addresses");
            shipping.WithOwner().HasForeignKey("customer_id");
            shipping.HasKey(item => item.Id);
            shipping.Property(item => item.Id).HasColumnName("id");
            shipping.Property(item => item.Name).HasColumnName("name").HasMaxLength(120);
            shipping.Property(item => item.Street).HasColumnName("street").HasMaxLength(250);
            shipping.Property(item => item.City).HasColumnName("city").HasMaxLength(120);
            shipping.Property(item => item.State).HasColumnName("state").HasMaxLength(120);
            shipping.Property(item => item.Pincode).HasColumnName("pincode").HasMaxLength(20);
            shipping.Property(item => item.Country).HasColumnName("country").HasMaxLength(120);
            shipping.Property(item => item.IsDefault).HasColumnName("is_default");
        });

        builder.OwnsMany(customer => customer.TaxDocuments, taxDocuments =>
        {
            taxDocuments.ToTable("customer_tax_documents");
            taxDocuments.WithOwner().HasForeignKey("customer_id");
            taxDocuments.HasKey(item => item.Id);
            taxDocuments.Property(item => item.Id).HasColumnName("id");
            taxDocuments.Property(item => item.TaxType).HasColumnName("tax_type").HasMaxLength(20).IsRequired();
            taxDocuments.Property(item => item.Number).HasColumnName("number").HasMaxLength(50).IsRequired();
            taxDocuments.Property(item => item.Verified).HasColumnName("verified");
            taxDocuments.Property(item => item.VerifiedAt).HasColumnName("verified_at");
            taxDocuments.Property(item => item.State).HasColumnName("state").HasMaxLength(120);
            taxDocuments.Property(item => item.FilingFrequency).HasColumnName("filing_frequency").HasMaxLength(20);
            taxDocuments.Property(item => item.EffectiveFrom).HasColumnName("effective_from").IsRequired();
            taxDocuments.Property(item => item.EffectiveTo).HasColumnName("effective_to");
        });

        builder.HasOne(customer => customer.Ledger)
            .WithMany()
            .HasForeignKey(customer => customer.LedgerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(customer => customer.OpeningBalance)
            .WithOne(opening => opening.Customer)
            .HasForeignKey<CustomerOpeningBalance>(opening => opening.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
