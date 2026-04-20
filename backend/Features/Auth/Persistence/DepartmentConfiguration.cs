using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Auth.Persistence;

public sealed class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.ToTable("departments");
        builder.HasKey(department => department.Id);
        builder.Property(department => department.Name).HasMaxLength(100);
        builder.HasIndex(department => department.Name).IsUnique();
    }
}
