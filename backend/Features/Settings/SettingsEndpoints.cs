namespace backend.Features.Settings;

public static class SettingsEndpoints
{
    public static IEndpointRouteBuilder MapSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/settings").WithTags("Settings");

        group.MapGet("/", SettingsHandlers.GetAsync);
        group.MapPut("/", SettingsHandlers.UpdateAsync);

        return app;
    }
}


