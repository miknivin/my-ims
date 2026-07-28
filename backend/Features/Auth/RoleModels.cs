namespace backend.Features.Auth;

public sealed class RolePermissions
{
    public Guid RoleId { get; set; }
    public string PermissionsJson { get; set; } = "{}";
}

public sealed record RoleListItemDto(Guid Id, string Name);

public sealed record RoleDto(Guid Id, string Name, Dictionary<string, List<string>> Permissions);

public sealed record CreateRoleRequest(string Name, Dictionary<string, List<string>> Permissions);

public sealed record UpdateRoleRequest(string Name, Dictionary<string, List<string>> Permissions);
