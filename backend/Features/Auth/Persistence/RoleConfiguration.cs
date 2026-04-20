using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Auth.Persistence;

public sealed class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("roles");
        builder.HasKey(role => role.Id);
        builder.Property(role => role.Name).HasMaxLength(100);
        builder.HasIndex(role => role.Name).IsUnique();
    }
}
