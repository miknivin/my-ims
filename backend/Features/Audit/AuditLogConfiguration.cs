using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Features.Audit;

public sealed class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.EntityType).HasMaxLength(100).HasColumnName("entity_type").IsRequired();
        builder.Property(x => x.EntityId).HasColumnName("entity_id");
        builder.Property(x => x.Action).HasMaxLength(50).HasColumnName("action").IsRequired();
        builder.Property(x => x.UserId).HasColumnName("user_id");
        builder.Property(x => x.UserEmail).HasMaxLength(256).HasColumnName("user_email");
        builder.Property(x => x.ChangedAtUtc).HasColumnName("changed_at_utc");
        builder.Property(x => x.Notes).HasMaxLength(2000).HasColumnName("notes");

        builder.HasIndex(x => new { x.EntityType, x.EntityId }).HasDatabaseName("ix_audit_logs_entity");
        builder.HasIndex(x => x.UserId).HasDatabaseName("ix_audit_logs_user_id");
        builder.HasIndex(x => x.ChangedAtUtc).HasDatabaseName("ix_audit_logs_changed_at");
    }
}
