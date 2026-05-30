namespace backend.Features.Masters.Categories;

public static class CategoryEndpoints
{
    public static IEndpointRouteBuilder MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/categories").WithTags("Category Masters");

        group.MapGet("/", CategoryHandlers.GetAllAsync);
        group.MapGet("/{id:guid}", CategoryHandlers.GetByIdAsync);
        group.MapPost("/", CategoryHandlers.CreateAsync);
        group.MapPut("/{id:guid}", CategoryHandlers.UpdateAsync);
        group.MapDelete("/{id:guid}", CategoryHandlers.DeleteAsync);

        return app;
    }
}


