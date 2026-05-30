namespace backend.Features.Masters.Vendors;

public static class VendorEndpoints
{
    public static IEndpointRouteBuilder MapVendorEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/vendors").WithTags("Vendor Masters");

        group.MapGet("/", VendorHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", VendorHandlers.GetByIdAsync);
        group.MapPost("/", VendorHandlers.CreateAsync);
        group.MapPut("/{id:guid}", VendorHandlers.UpdateAsync);
        group.MapDelete("/{id:guid}", VendorHandlers.DeleteAsync);

        return app;
    }
}


