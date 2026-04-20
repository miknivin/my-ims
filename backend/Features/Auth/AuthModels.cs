namespace backend.Features.Auth;

public sealed class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string EmployeeCode { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Mobile { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public Guid RoleId { get; set; }

    public Role Role { get; set; } = null!;

    public Guid DepartmentId { get; set; }

    public Department Department { get; set; } = null!;

    public string Designation { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class Role
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;
}

public sealed class Department
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;
}

public sealed record LoginRequest(string Email, string Password);

public sealed record RegisterRequest(
    string EmployeeCode,
    string Name,
    string Email,
    string Mobile,
    string Password,
    string Role,
    string Department,
    string? Designation,
    bool IsActive = true);

public sealed record AuthUserDto(
    Guid Id,
    string EmployeeCode,
    string Name,
    string Email,
    string Mobile,
    string Role,
    string Department,
    string Designation,
    bool IsActive)
{
    public static AuthUserDto FromEntity(User user)
    {
        return new AuthUserDto(
            user.Id,
            user.EmployeeCode,
            user.Name,
            user.Email,
            user.Mobile,
            user.Role.Name,
            user.Department.Name,
            user.Designation,
            user.IsActive);
    }
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);

public sealed record AuthResponse(bool Success, string Message, AuthUserDto User, string Token, int ExpiresIn);

public sealed record AuthSessionResponse(bool Success, string Message, AuthUserDto User);
