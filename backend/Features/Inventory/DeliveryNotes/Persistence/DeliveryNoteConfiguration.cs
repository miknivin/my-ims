using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Inventory.DeliveryNotes.Persistence;

public sealed class DeliveryNoteConfiguration : IEntityTypeConfiguration<DeliveryNote>
{
    public void Configure(EntityTypeBuilder<DeliveryNote> builder)
    {
        builder.ToTable("delivery_notes");
        builder.HasKey(dn => dn.Id);

        builder.Property(dn => dn.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
        builder.Property(dn => dn.CreatedAtUtc).IsRequired();
        builder.Property(dn => dn.UpdatedAtUtc).IsRequired();

        builder.OwnsOne(dn => dn.SourceRef, src =>
        {
            src.Property(x => x.Mode).HasColumnName("delivery_mode").HasMaxLength(40).IsRequired();
            src.Property(x => x.SalesOrderId).HasColumnName("sales_order_id");
            src.Property(x => x.SalesOrderNo).HasColumnName("sales_order_no").HasMaxLength(50);
            src.Property(x => x.DirectRefNo).HasColumnName("direct_ref_no").HasMaxLength(120);
        });

        builder.OwnsOne(dn => dn.Document, doc =>
        {
            doc.Property(x => x.VoucherType).HasColumnName("voucher_type").HasMaxLength(20).IsRequired();
            doc.Property(x => x.No).HasColumnName("no").HasMaxLength(50).IsRequired();
            doc.Property(x => x.Date).HasColumnName("date").IsRequired();
            doc.Property(x => x.ExpectedDeliveryDate).HasColumnName("expected_delivery_date");
            doc.HasIndex(x => x.No).IsUnique();
        });

        builder.OwnsOne(dn => dn.CustomerInformation, cust =>
        {
            cust.Property(x => x.CustomerId).HasColumnName("customer_id").IsRequired();
            cust.Property(x => x.CustomerNameSnapshot).HasColumnName("customer_name_snapshot").HasMaxLength(150).IsRequired();
            cust.Property(x => x.Address).HasColumnName("customer_address").HasMaxLength(500).IsRequired();
            cust.Property(x => x.ShippingAddress).HasColumnName("customer_shipping_address").HasMaxLength(500);
            cust.Property(x => x.Attention).HasColumnName("customer_attention").HasMaxLength(150);
            cust.Property(x => x.Phone).HasColumnName("customer_phone").HasMaxLength(50);
            cust.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.OwnsOne(dn => dn.Logistics, log =>
        {
            log.Property(x => x.TransportMode).HasColumnName("transport_mode").HasMaxLength(100);
            log.Property(x => x.LrNo).HasColumnName("lr_no").HasMaxLength(120);
            log.Property(x => x.LrDate).HasColumnName("lr_date");
            log.Property(x => x.VehicleNo).HasColumnName("vehicle_no").HasMaxLength(50);
            log.Property(x => x.EWayBillNo).HasColumnName("e_way_bill_no").HasMaxLength(20);
            log.Property(x => x.TransporterName).HasColumnName("transporter_name").HasMaxLength(150);
        });

        builder.OwnsOne(dn => dn.General, gen =>
        {
            gen.Property(x => x.Notes).HasColumnName("notes").HasMaxLength(2000);
        });

        builder.OwnsOne(dn => dn.Footer, footer =>
        {
            footer.Property(x => x.NetTotal).HasColumnName("net_total").HasColumnType("numeric(18,2)");
            footer.Property(x => x.TotalQty).HasColumnName("total_qty").HasColumnType("numeric(18,2)");
            footer.Property(x => x.TotalAmount).HasColumnName("total_amount").HasColumnType("numeric(18,2)");
        });

        builder.HasMany(dn => dn.Items)
            .WithOne(i => i.DeliveryNote)
            .HasForeignKey(i => i.DeliveryNoteId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
