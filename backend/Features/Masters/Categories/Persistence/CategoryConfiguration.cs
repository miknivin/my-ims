using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Masters.Categories.Persistence;

public sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories");
        builder.HasKey(category => category.Id);

        builder.Property(category => category.Code)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(category => category.Name)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(category => category.Status)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(category => category.CreatedAtUtc).IsRequired();
        builder.Property(category => category.UpdatedAtUtc).IsRequired();

        builder.HasIndex(category => category.Code).IsUnique();
        builder.HasIndex(category => category.Name).IsUnique();

        builder.HasOne(category => category.ParentCategory)
            .WithMany(parent => parent.ChildCategories)
            .HasForeignKey(category => category.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
