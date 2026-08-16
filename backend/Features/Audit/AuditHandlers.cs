using backend.Infrastructure.Persistence;
using backend.Features.Masters.Ledgers;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Audit;

public sealed record AuditLogEntryDto(
    Guid Id,
    string Action,
    Guid? UserId,
    string? UserEmail,
    DateTime ChangedAtUtc,
    string? Notes);

internal static class AuditHandlers
{
    internal static async Task<IResult> GetByEntityAsync(
        string entityType,
        Guid entityId,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var logs = await dbContext.AuditLogs
            .Where(l => l.EntityType == entityType && l.EntityId == entityId)
            .OrderByDescending(l => l.ChangedAtUtc)
            .Select(l => new AuditLogEntryDto(
                l.Id, l.Action, l.UserId, l.UserEmail, l.ChangedAtUtc, l.Notes))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(
            new ApiResponse<IReadOnlyList<AuditLogEntryDto>>(true, "Audit log fetched.", logs));
    }
}
