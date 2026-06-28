using backend.Infrastructure.Persistence;

namespace backend.Features.Utils;

internal static class CodeGeneratorEndpoints
{
    internal static void MapCodeGeneratorEndpoints(this WebApplication app)
    {
        app.MapGet("/api/utils/next-code", async (
            string entity,
            string? prefix,
            AppDbContext dbContext,
            CancellationToken cancellationToken) =>
            await CodeGeneratorHandler.GenerateAsync(entity, prefix, dbContext, cancellationToken))
            .WithTags("Utils");
    }
}
