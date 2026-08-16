using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace backend.Features.Audit;

public sealed class AuditInterceptor(IHttpContextAccessor httpContextAccessor) : SaveChangesInterceptor
{
    // Entity types that are internal bookkeeping — skip auditing them
    private static readonly HashSet<string> SkippedTypes =
    [
        nameof(AuditLog),
    ];

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is { } context)
            RecordAuditEntries(context);

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void RecordAuditEntries(DbContext context)
    {
        var userId = GetUserId();
        var userEmail = GetUserEmail();
        var now = DateTime.UtcNow;

        var entries = context.ChangeTracker.Entries()
            .Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .Where(e => !SkippedTypes.Contains(e.Entity.GetType().Name))
            .ToList();

        foreach (var entry in entries)
        {
            var id = entry.Properties
                .FirstOrDefault(p => p.Metadata.Name == "Id")
                ?.CurrentValue;

            if (id is not Guid entityId || entityId == Guid.Empty)
                continue;

            context.Set<AuditLog>().Add(new AuditLog
            {
                Id = Guid.NewGuid(),
                EntityType = entry.Entity.GetType().Name,
                EntityId = entityId,
                Action = entry.State switch
                {
                    EntityState.Added => "Created",
                    EntityState.Deleted => "Deleted",
                    _ => "Updated"
                },
                UserId = userId,
                UserEmail = userEmail,
                ChangedAtUtc = now,
                Notes = BuildNotes(entry),
            });
        }
    }

    private static string? BuildNotes(EntityEntry entry)
    {
        if (entry.State != EntityState.Modified)
            return null;

        var parts = entry.Properties
            .Where(p => p.IsModified && p.Metadata.Name is not ("UpdatedAtUtc" or "UpdatedById"))
            .Select(p =>
            {
                var oldVal = p.OriginalValue?.ToString() ?? "null";
                var newVal = p.CurrentValue?.ToString() ?? "null";
                return oldVal == newVal ? null : $"{p.Metadata.Name}: {oldVal} → {newVal}";
            })
            .Where(s => s is not null)
            .Take(10)
            .ToList();

        return parts.Count > 0 ? string.Join(" | ", parts) : null;
    }

    private Guid? GetUserId()
    {
        var user = httpContextAccessor.HttpContext?.User;
        var raw = user?.FindFirstValue(JwtRegisteredClaimNames.Sub)
                  ?? user?.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(raw, out var id) ? id : null;
    }

    private string? GetUserEmail() =>
        httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);
}
