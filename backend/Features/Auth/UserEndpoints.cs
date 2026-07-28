namespace backend.Features.Auth;

public static class UserEndpoints
{
    public static IEndpointRouteBuilder MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users").WithTags("Users").RequireAuthorization();

        group.MapGet("/", UserHandlers.GetAllAsync);
        group.MapPut("/{id:guid}", UserHandlers.UpdateAsync);
        group.MapDelete("/{id:guid}", UserHandlers.DeleteAsync);

        return app;
    }
}
