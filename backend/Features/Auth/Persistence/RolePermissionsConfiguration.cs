using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Auth.Persistence;

public sealed class RolePermissionsConfiguration : IEntityTypeConfiguration<RolePermissions>
{
    public void Configure(EntityTypeBuilder<RolePermissions> builder)
    {
        builder.ToTable("role_permissions");
        builder.HasKey(rp => rp.RoleId);
        builder.Property(rp => rp.RoleId).ValueGeneratedNever();
        builder.Property(rp => rp.PermissionsJson)
            .HasColumnType("jsonb")
            .HasDefaultValue("{}");
    }
}
