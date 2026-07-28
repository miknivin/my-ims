using System.Text.Json;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Auth;

internal static class RoleHandlers
{
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

    internal static async Task<IResult> GetAllAsync(
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var roles = await dbContext.Roles
            .AsNoTracking()
            .OrderBy(r => r.Name)
            .Select(r => new RoleListItemDto(r.Id, r.Name))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<RoleListItemDto>>(true, "Roles fetched.", roles));
    }

    internal static async Task<IResult> GetByIdAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var role = await dbContext.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (role is null)
            return TypedResults.NotFound(new ApiResponse<object>(false, "Role not found.", null));

        var perms = await GetPermissionsAsync(dbContext, id, cancellationToken);

        return TypedResults.Ok(new ApiResponse<RoleDto>(true, "Role fetched.", new RoleDto(role.Id, role.Name, perms)));
    }

    internal static async Task<IResult> CreateAsync(
        CreateRoleRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
            return TypedResults.BadRequest(new ApiResponse<object>(false, "Name is required.", null));

        var exists = await dbContext.Roles.AnyAsync(r => r.Name == name, cancellationToken);
        if (exists)
            return TypedResults.Conflict(new ApiResponse<object>(false, "Role name already exists.", null));

        var role = new Role { Name = name };
        dbContext.Roles.Add(role);

        dbContext.RolePermissions.Add(new RolePermissions
        {
            RoleId = role.Id,
            PermissionsJson = JsonSerializer.Serialize(request.Permissions ?? new(), JsonOpts)
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Created(
            $"/api/roles/{role.Id}",
            new ApiResponse<RoleDto>(true, "Role created.", new RoleDto(role.Id, role.Name, request.Permissions ?? new())));
    }

    internal static async Task<IResult> UpdateAsync(
        Guid id,
        UpdateRoleRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var role = await dbContext.Roles.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        if (role is null)
            return TypedResults.NotFound(new ApiResponse<object>(false, "Role not found.", null));

        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
            return TypedResults.BadRequest(new ApiResponse<object>(false, "Name is required.", null));

        var nameConflict = await dbContext.Roles.AnyAsync(r => r.Name == name && r.Id != id, cancellationToken);
        if (nameConflict)
            return TypedResults.Conflict(new ApiResponse<object>(false, "Role name already exists.", null));

        role.Name = name;

        var rp = await dbContext.RolePermissions.FirstOrDefaultAsync(p => p.RoleId == id, cancellationToken);
        if (rp is null)
        {
            rp = new RolePermissions { RoleId = id };
            dbContext.RolePermissions.Add(rp);
        }
        rp.PermissionsJson = JsonSerializer.Serialize(request.Permissions ?? new(), JsonOpts);

        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<RoleDto>(true, "Role updated.", new RoleDto(role.Id, role.Name, request.Permissions ?? new())));
    }

    internal static async Task<IResult> DeleteAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var role = await dbContext.Roles.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        if (role is null)
            return TypedResults.NotFound(new ApiResponse<object>(false, "Role not found.", null));

        var hasUsers = await dbContext.Users.AnyAsync(u => u.RoleId == id, cancellationToken);
        if (hasUsers)
            return TypedResults.Conflict(new ApiResponse<object>(false, "Cannot delete a role that is assigned to users.", null));

        var rp = await dbContext.RolePermissions.FirstOrDefaultAsync(p => p.RoleId == id, cancellationToken);
        if (rp is not null)
            dbContext.RolePermissions.Remove(rp);

        dbContext.Roles.Remove(role);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Role deleted.", null));
    }

    private static async Task<Dictionary<string, List<string>>> GetPermissionsAsync(
        AppDbContext dbContext, Guid roleId, CancellationToken cancellationToken)
    {
        var rp = await dbContext.RolePermissions
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.RoleId == roleId, cancellationToken);

        if (rp is null) return new();

        return JsonSerializer.Deserialize<Dictionary<string, List<string>>>(rp.PermissionsJson, JsonOpts) ?? new();
    }
}
