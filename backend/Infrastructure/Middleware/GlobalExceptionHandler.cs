using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace backend.Infrastructure.Middleware;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken ct)
    {
        int status;
        string message;

        switch (exception)
        {
            case DbUpdateException { InnerException: PostgresException { SqlState: "23503" } pg }:
                logger.LogWarning(
                    "[ExceptionHandler] FK violation on delete — table: {Table}, constraint: {Constraint}",
                    pg.TableName ?? "unknown",
                    pg.ConstraintName ?? "unknown");
                status = StatusCodes.Status409Conflict;
                message = "Cannot delete: this record is referenced by other data.";
                break;

            case DbUpdateException { InnerException: PostgresException { SqlState: "23505" } pg2 }:
                logger.LogWarning(
                    "[ExceptionHandler] Unique constraint violation — constraint: {Constraint}",
                    pg2.ConstraintName ?? "unknown");
                status = StatusCodes.Status409Conflict;
                message = "A record with this code or name already exists.";
                break;

            case DbUpdateException dbEx:
                logger.LogError(dbEx,
                    "[ExceptionHandler] DbUpdateException on {Method} {Path}",
                    httpContext.Request.Method,
                    httpContext.Request.Path);
                status = StatusCodes.Status500InternalServerError;
                message = "A database error occurred.";
                break;

            default:
                logger.LogError(exception,
                    "[ExceptionHandler] Unhandled exception on {Method} {Path}",
                    httpContext.Request.Method,
                    httpContext.Request.Path);
                status = StatusCodes.Status500InternalServerError;
                message = "An unexpected error occurred.";
                break;
        }

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(
            new { success = false, message, data = (object?)null }, ct);
        return true;
    }
}
