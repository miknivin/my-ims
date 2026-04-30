using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Settings;

public sealed class SettingsConfiguration : IEntityTypeConfiguration<AppSettings>
{
    public void Configure(EntityTypeBuilder<AppSettings> builder)
    {
        builder.ToTable("app_settings");

        builder.HasKey(current => current.Id);

        builder.Property(current => current.CreatedAtUtc)
            .HasColumnName("created_at_utc");

        builder.Property(current => current.UpdatedAtUtc)
            .HasColumnName("updated_at_utc");

        builder.OwnsOne(current => current.General, general =>
        {
            general.Property(value => value.BusinessName).HasMaxLength(200).HasColumnName("business_name");
            general.Property(value => value.ContactPerson).HasMaxLength(150).HasColumnName("contact_person");
            general.Property(value => value.Phone).HasMaxLength(30).HasColumnName("phone");
            general.Property(value => value.Email).HasMaxLength(200).HasColumnName("email");
            general.Property(value => value.AddressLine1).HasMaxLength(250).HasColumnName("address_line_1");
            general.Property(value => value.AddressLine2).HasMaxLength(250).HasColumnName("address_line_2");
            general.Property(value => value.City).HasMaxLength(120).HasColumnName("city");
            general.Property(value => value.State).HasMaxLength(120).HasColumnName("state");
            general.Property(value => value.Pincode).HasMaxLength(20).HasColumnName("pincode");
            general.Property(value => value.Country).HasMaxLength(120).HasColumnName("country");
            general.Property(value => value.Gstin).HasMaxLength(30).HasColumnName("gstin");
            general.Property(value => value.Pan).HasMaxLength(20).HasColumnName("pan");
        });

        builder.OwnsOne(current => current.InventorySettings, inventory =>
        {
            inventory.OwnsOne(value => value.StockControl, stockControl =>
            {
                stockControl.Property(value => value.AllowNegativeStock).HasColumnName("allow_negative_stock");
                stockControl.Property(value => value.TrackInventoryByWarehouse).HasColumnName("track_inventory_by_warehouse");
                stockControl.Property(value => value.DefaultWarehouseId).HasColumnName("default_warehouse_id");
                stockControl.Property(value => value.BlockSaleWhenStockUnavailable).HasColumnName("block_sale_when_stock_unavailable");
                stockControl.Property(value => value.AutoUpdateStockOnInvoicePosting).HasColumnName("auto_update_stock_on_invoice_posting");

                stockControl.HasOne(value => value.DefaultWarehouse)
                    .WithMany()
                    .HasForeignKey(value => value.DefaultWarehouseId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            inventory.OwnsOne(value => value.Costing, costing =>
            {
                costing.Property(value => value.ValuationMethod)
                    .HasConversion(
                        value => value == InventoryValuationMethod.FIFO ? "FIFO" : "Moving Average",
                        value => value == "FIFO" ? InventoryValuationMethod.FIFO : InventoryValuationMethod.MovingAverage)
                    .HasMaxLength(30)
                    .HasColumnName("valuation_method");
                costing.Property(value => value.CostPrecision).HasColumnName("cost_precision");
                costing.Property(value => value.RoundingPrecision).HasColumnName("rounding_precision");
                costing.Property(value => value.IncludeLandedCostInInventoryCost).HasColumnName("include_landed_cost_in_inventory_cost");
            });

            inventory.OwnsOne(value => value.BatchSerial, batchSerial =>
            {
                batchSerial.Property(value => value.EnableBatchTracking).HasColumnName("enable_batch_tracking");
                batchSerial.Property(value => value.EnableSerialTracking).HasColumnName("enable_serial_tracking");
                batchSerial.Property(value => value.RequireExpiryForBatchItems).HasColumnName("require_expiry_for_batch_items");
            });
        });

        builder.OwnsOne(current => current.AccountingSettings, accounting =>
        {
            accounting.Property(value => value.DiscountAllowedLedgerId).HasColumnName("discount_allowed_ledger_id");
            accounting.Property(value => value.DiscountReceivedLedgerId).HasColumnName("discount_received_ledger_id");
            accounting.Property(value => value.InventoryLedgerId).HasColumnName("inventory_ledger_id");
            accounting.Property(value => value.SalesLedgerId).HasColumnName("sales_ledger_id");
            accounting.Property(value => value.CostOfGoodsSoldLedgerId).HasColumnName("cost_of_goods_sold_ledger_id");
            accounting.Property(value => value.GrnClearingLedgerId).HasColumnName("grn_clearing_ledger_id");
            accounting.Property(value => value.PurchaseTaxLedgerId).HasColumnName("purchase_tax_ledger_id");
            accounting.Property(value => value.SalesTaxLedgerId).HasColumnName("sales_tax_ledger_id");
            accounting.Property(value => value.DefaultCashLedgerId).HasColumnName("default_cash_ledger_id");
            accounting.Property(value => value.GrnAdditionLedgerId).HasColumnName("grn_addition_ledger_id");
            accounting.Property(value => value.GrnDiscountLedgerId).HasColumnName("grn_discount_ledger_id");
            accounting.Property(value => value.RoundOffLedgerId).HasColumnName("round_off_ledger_id");

            accounting.HasOne(value => value.DiscountAllowedLedger)
                .WithMany()
                .HasForeignKey(value => value.DiscountAllowedLedgerId)
                .OnDelete(DeleteBehavior.Restrict);

            accounting.HasOne(value => value.DiscountReceivedLedger)
                .WithMany()
                .HasForeignKey(value => value.DiscountReceivedLedgerId)
                .OnDelete(DeleteBehavior.Restrict);

            accounting.HasOne(value => value.InventoryLedger)
                .WithMany()
                .HasForeignKey(value => value.InventoryLedgerId)
                .OnDelete(DeleteBehavior.Restrict);

            accounting.HasOne(value => value.SalesLedger)
                .WithMany()
                .HasForeignKey(value => value.SalesLedgerId)
                .OnDelete(DeleteBehavior.Restrict);

            accounting.HasOne(value => value.CostOfGoodsSoldLedger)
                .WithMany()
                .HasForeignKey(value => value.CostOfGoodsSoldLedgerId)
                .OnDelete(DeleteBehavior.Restrict);

            accounting.HasOne(value => value.GrnClearingLedger)
                .WithMany()
                .HasForeignKey(value => value.GrnClearingLedgerId)
                .OnDelete(DeleteBehavior.Restrict);

            accounting.HasOne(value => value.PurchaseTaxLedger)
                .WithMany()
                .HasForeignKey(value => value.PurchaseTaxLedgerId)
                .OnDelete(DeleteBehavior.Restrict);

            accounting.HasOne(value => value.SalesTaxLedger)
                .WithMany()
                .HasForeignKey(value => value.SalesTaxLedgerId)
                .OnDelete(DeleteBehavior.Restrict);

            accounting.HasOne(value => value.DefaultCashLedger)
                .WithMany()
                .HasForeignKey(value => value.DefaultCashLedgerId)
                .OnDelete(DeleteBehavior.Restrict);

            accounting.HasOne(value => value.GrnAdditionLedger)
                .WithMany()
                .HasForeignKey(value => value.GrnAdditionLedgerId)
                .OnDelete(DeleteBehavior.Restrict);

            accounting.HasOne(value => value.GrnDiscountLedger)
                .WithMany()
                .HasForeignKey(value => value.GrnDiscountLedgerId)
                .OnDelete(DeleteBehavior.Restrict);

            accounting.HasOne(value => value.RoundOffLedger)
                .WithMany()
                .HasForeignKey(value => value.RoundOffLedgerId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
