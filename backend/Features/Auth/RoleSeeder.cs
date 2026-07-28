using System.Text.Json;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Auth;

public static class RoleSeeder
{
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

    private static readonly Dictionary<string, Dictionary<string, List<string>>> DefaultRoles = new()
    {
        ["Sales Person"] = new()
        {
            ["masters.products"]       = ["view"],
            ["masters.customers"]      = ["view", "create", "edit"],
            ["ops.sales-orders"]       = ["view", "create"],
            ["ops.sales-invoices"]     = ["view", "create"],
            ["ops.delivery-notes"]     = ["view", "create"],
            ["reports.sales-register"] = ["view"],
        },
    };

    public static async Task SeedAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        foreach (var (roleName, permissions) in DefaultRoles)
        {
            var role = await dbContext.Roles
                .FirstOrDefaultAsync(r => r.Name == roleName, cancellationToken);

            if (role is null)
            {
                role = new Role { Name = roleName };
                dbContext.Roles.Add(role);
                await dbContext.SaveChangesAsync(cancellationToken);
            }

            var existing = await dbContext.RolePermissions
                .FirstOrDefaultAsync(rp => rp.RoleId == role.Id, cancellationToken);

            if (existing is null)
            {
                dbContext.RolePermissions.Add(new RolePermissions
                {
                    RoleId = role.Id,
                    PermissionsJson = JsonSerializer.Serialize(permissions, JsonOpts),
                });
                await dbContext.SaveChangesAsync(cancellationToken);
            }
        }
    }
}
