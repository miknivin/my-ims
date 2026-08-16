namespace backend.Features.Audit;

internal static class AuditEndpoints
{
    internal static void MapAuditEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/audit").RequireAuthorization();
        group.MapGet("/{entityType}/{entityId:guid}", AuditHandlers.GetByEntityAsync);
    }
}
