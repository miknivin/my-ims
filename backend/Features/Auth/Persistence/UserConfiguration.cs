using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Auth.Persistence;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        builder.HasKey(user => user.Id);

        builder.Property(user => user.EmployeeCode).HasMaxLength(50);
        builder.Property(user => user.Name).HasMaxLength(150);
        builder.Property(user => user.Email).HasMaxLength(200);
        builder.Property(user => user.Mobile).HasMaxLength(30);
        builder.Property(user => user.PasswordHash).HasMaxLength(500);
        builder.Property(user => user.Designation).HasMaxLength(150);

        builder.HasIndex(user => user.EmployeeCode).IsUnique();
        builder.HasIndex(user => user.Email).IsUnique();
        builder.HasIndex(user => user.Mobile).IsUnique();

        builder.HasOne(user => user.Role)
            .WithMany()
            .HasForeignKey(user => user.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(user => user.Department)
            .WithMany()
            .HasForeignKey(user => user.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
