using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Auth;

internal static class UserHandlers
{
    internal static async Task<IResult> GetAllAsync(
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var users = await dbContext.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .Include(u => u.Department)
            .OrderBy(u => u.Name)
            .Select(u => new UserListItemDto(
                u.Id, u.EmployeeCode, u.Name, u.Email, u.Mobile,
                u.Role.Name, u.Department.Name, u.Designation, u.IsActive))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<UserListItemDto>>(
            true, "Users fetched.", users));
    }

    internal static async Task<IResult> UpdateAsync(
        Guid id,
        UpdateUserRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var user = await dbContext.Users
            .Include(u => u.Role)
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        if (user is null)
            return TypedResults.NotFound(new ApiResponse<object>(false, "User not found.", null));

        var email = request.Email.Trim().ToLowerInvariant();

        if (await dbContext.Users.AnyAsync(u => u.Email == email && u.Id != id, cancellationToken))
            return TypedResults.Conflict(new ApiResponse<object>(false, "Email already in use by another account.", null));

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            if (request.Password.Length < 6)
                return TypedResults.BadRequest(new ApiResponse<object>(false, "Password must be at least 6 characters.", null));
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }

        var roleName = request.Role.Trim();
        var departmentName = request.Department.Trim();

        var role = await dbContext.Roles.FirstOrDefaultAsync(r => r.Name == roleName, cancellationToken)
            ?? new Role { Name = roleName };
        var department = await dbContext.Departments.FirstOrDefaultAsync(d => d.Name == departmentName, cancellationToken)
            ?? new Department { Name = departmentName };

        if (role.Id == Guid.Empty) dbContext.Roles.Add(role);
        if (department.Id == Guid.Empty) dbContext.Departments.Add(department);

        user.Name = request.Name.Trim();
        user.Email = email;
        user.Mobile = request.Mobile.Trim();
        user.Role = role;
        user.Department = department;
        user.Designation = string.IsNullOrWhiteSpace(request.Designation) ? roleName : request.Designation.Trim();
        user.IsActive = request.IsActive;
        user.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<AuthUserDto>(
            true, "User updated.", AuthUserDto.FromEntity(user)));
    }

    internal static async Task<IResult> DeleteAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.FindAsync([id], cancellationToken);

        if (user is null)
            return TypedResults.NotFound(new ApiResponse<object>(false, "User not found.", null));

        dbContext.Users.Remove(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "User deleted.", null));
    }
}
