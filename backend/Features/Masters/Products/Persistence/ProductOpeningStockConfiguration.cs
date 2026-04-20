using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Masters.Products.Persistence;

public sealed class ProductOpeningStockConfiguration : IEntityTypeConfiguration<ProductOpeningStock>
{
    public void Configure(EntityTypeBuilder<ProductOpeningStock> builder)
    {
        builder.ToTable("product_opening_stocks");
        builder.HasKey(opening => opening.ProductId);
        builder.Property(opening => opening.Quantity).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(opening => opening.AsOfDate).IsRequired();
        builder.Property(opening => opening.CreatedAtUtc).IsRequired();
        builder.Property(opening => opening.UpdatedAtUtc).IsRequired();
    }
}
