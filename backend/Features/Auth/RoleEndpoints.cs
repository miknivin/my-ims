namespace backend.Features.Auth;

public static class RoleEndpoints
{
    public static IEndpointRouteBuilder MapRoleEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/roles").WithTags("Roles").RequireAuthorization();

        group.MapGet("/", RoleHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", RoleHandlers.GetByIdAsync);
        group.MapPost("/", RoleHandlers.CreateAsync);
        group.MapPut("/{id:guid}", RoleHandlers.UpdateAsync);
        group.MapDelete("/{id:guid}", RoleHandlers.DeleteAsync);

        return app;
    }
}
