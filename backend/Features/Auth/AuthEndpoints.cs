namespace backend.Features.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Authentication");

        group.MapPost("/register", AuthHandlers.RegisterAsync).AllowAnonymous();
        group.MapPost("/login", AuthHandlers.LoginAsync).AllowAnonymous();
        group.MapPost("/logout", AuthHandlers.LogoutAsync).AllowAnonymous();
        group.MapGet("/session", AuthHandlers.GetSessionAsync).RequireAuthorization();

        return app;
    }
}


