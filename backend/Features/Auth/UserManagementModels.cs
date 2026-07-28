namespace backend.Features.Auth;

public sealed record UserListItemDto(
    Guid Id,
    string EmployeeCode,
    string Name,
    string Email,
    string Mobile,
    string Role,
    string Department,
    string Designation,
    bool IsActive);

public sealed record UpdateUserRequest(
    string Name,
    string Email,
    string Mobile,
    string Role,
    string Department,
    string Designation,
    bool IsActive,
    string? Password = null);
