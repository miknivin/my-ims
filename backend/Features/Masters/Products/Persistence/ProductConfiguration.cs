using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Masters.Products.Persistence;

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");
        builder.HasKey(product => product.Id);

        builder.Property(product => product.Status).HasMaxLength(20).IsRequired();
        builder.Property(product => product.CreatedAtUtc).IsRequired();
        builder.Property(product => product.UpdatedAtUtc).IsRequired();

        builder.OwnsOne(product => product.BasicInfo, basic =>
        {
            basic.Property(info => info.Code).HasColumnName("code").HasMaxLength(20).IsRequired();
            basic.Property(info => info.Name).HasColumnName("name").HasMaxLength(150).IsRequired();
            basic.Property(info => info.OtherLanguage).HasColumnName("other_language").HasMaxLength(150);
            basic.Property(info => info.TaxId).HasColumnName("tax_id");
            basic.HasIndex(info => info.Code).IsUnique();
            basic.HasIndex(info => info.Name).IsUnique();
            basic.HasOne(info => info.Tax).WithMany().HasForeignKey(info => info.TaxId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(product => product.PricingAndRates, pricing =>
        {
            pricing.Property(info => info.ProfitPercentage).HasColumnName("profit_percentage").HasColumnType("numeric(18,2)");
            pricing.Property(info => info.PurchaseRate).HasColumnName("purchase_rate").HasColumnType("numeric(18,2)");
            pricing.Property(info => info.Cost).HasColumnName("cost").HasColumnType("numeric(18,2)");
            pricing.Property(info => info.SalesRate).HasColumnName("sales_rate").HasColumnType("numeric(18,2)");
            pricing.Property(info => info.NormalRate).HasColumnName("normal_rate").HasColumnType("numeric(18,2)");
            pricing.Property(info => info.Mrp).HasColumnName("mrp").HasColumnType("numeric(18,2)");
            pricing.Property(info => info.WholesaleRate).HasColumnName("wholesale_rate").HasColumnType("numeric(18,2)");
        });

        builder.OwnsOne(product => product.StockAndMeasurement, stock =>
        {
            stock.Property(info => info.Hsn).HasColumnName("hsn").HasMaxLength(50);
            stock.Property(info => info.BaseUomId).HasColumnName("base_uom_id");
            stock.Property(info => info.PurchaseUomId).HasColumnName("purchase_uom_id");
            stock.Property(info => info.SalesUomId).HasColumnName("sales_uom_id");
            stock.Property(info => info.StockUomId).HasColumnName("stock_uom_id");
            stock.Property(info => info.MinimumStock).HasColumnName("minimum_stock").HasColumnType("numeric(18,2)");
            stock.Property(info => info.MaximumStock).HasColumnName("maximum_stock").HasColumnType("numeric(18,2)");
            stock.Property(info => info.ReOrderLevel).HasColumnName("reorder_level").HasColumnType("numeric(18,2)");
            stock.Property(info => info.ReOrderQuantity).HasColumnName("reorder_quantity").HasColumnType("numeric(18,2)");
            stock.HasOne(info => info.BaseUom).WithMany().HasForeignKey(info => info.BaseUomId).OnDelete(DeleteBehavior.Restrict);
            stock.HasOne(info => info.PurchaseUom).WithMany().HasForeignKey(info => info.PurchaseUomId).OnDelete(DeleteBehavior.Restrict);
            stock.HasOne(info => info.SalesUom).WithMany().HasForeignKey(info => info.SalesUomId).OnDelete(DeleteBehavior.Restrict);
            stock.HasOne(info => info.StockUom).WithMany().HasForeignKey(info => info.StockUomId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(product => product.Properties, properties =>
        {
            properties.OwnsOne(info => info.GeneralSettings, general =>
            {
                general.Property(item => item.Inactive).HasColumnName("inactive");
                general.Property(item => item.LessProfit).HasColumnName("less_profit");
                general.Property(item => item.CounterItem).HasColumnName("counter_item");
                general.Property(item => item.AutoEntry).HasColumnName("auto_entry");
                general.Property(item => item.HideFromDevice).HasColumnName("hide_from_device");
                general.Property(item => item.ExpiryDays).HasColumnName("expiry_days");
                general.Property(item => item.TaxInclusive).HasColumnName("tax_inclusive");
                general.Property(item => item.SerialNo).HasColumnName("serial_no");
            });

            properties.OwnsOne(info => info.Categorization, category =>
            {
                category.Property(item => item.GroupCategoryId).HasColumnName("group_category_id");
                category.Property(item => item.SubGroupCategoryId).HasColumnName("sub_group_category_id");
                category.Property(item => item.VendorId).HasColumnName("vendor_id");
                category.Property(item => item.Brand).HasColumnName("brand").HasMaxLength(120);
                category.HasOne(item => item.GroupCategory).WithMany().HasForeignKey(item => item.GroupCategoryId).OnDelete(DeleteBehavior.Restrict);
                category.HasOne(item => item.SubGroupCategory).WithMany().HasForeignKey(item => item.SubGroupCategoryId).OnDelete(DeleteBehavior.Restrict);
                category.HasOne(item => item.Vendor).WithMany().HasForeignKey(item => item.VendorId).OnDelete(DeleteBehavior.Restrict);
            });
        });

        builder.OwnsOne(product => product.AdditionalDetails, details =>
        {
            details.Property(info => info.PackUnit).HasColumnName("pack_unit").HasColumnType("numeric(18,2)");
            details.Property(info => info.AdditionPercentage).HasColumnName("addition_percentage").HasColumnType("numeric(18,2)");
            details.Property(info => info.Addition).HasColumnName("addition").HasColumnType("numeric(18,2)");
            details.Property(info => info.Company).HasColumnName("company").HasMaxLength(120);
            details.Property(info => info.WarehouseStock).HasColumnName("warehouse_stock").HasMaxLength(120);
            details.Property(info => info.Document).HasColumnName("document").HasMaxLength(250);
            details.Property(info => info.Barcode).HasColumnName("barcode").HasMaxLength(120);
            details.Property(info => info.PurchaseHistory).HasColumnName("purchase_history").HasMaxLength(250);
            details.Property(info => info.SalesHistory).HasColumnName("sales_history").HasMaxLength(250);
            details.Property(info => info.CompanyStock).HasColumnName("company_stock").HasMaxLength(120);
        });

        builder.HasOne(product => product.OpeningStock)
            .WithOne(opening => opening.Product)
            .HasForeignKey<ProductOpeningStock>(opening => opening.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
