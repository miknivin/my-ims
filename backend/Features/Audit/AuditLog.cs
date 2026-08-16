namespace backend.Features.Audit;

public sealed class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string EntityType { get; set; }
    public Guid EntityId { get; set; }
    public required string Action { get; set; }
    public Guid? UserId { get; set; }
    public string? UserEmail { get; set; }
    public DateTime ChangedAtUtc { get; set; }
    public string? Notes { get; set; }
}
