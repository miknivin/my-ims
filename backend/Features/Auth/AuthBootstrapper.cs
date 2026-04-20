using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace backend.Features.Auth;

public static class AuthBootstrapper
{
    public static async Task SeedAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var options = scope.ServiceProvider.GetRequiredService<IOptions<AuthBootstrapOptions>>().Value;

        if (!options.Enabled)
        {
            return;
        }

        var email = options.Email.Trim().ToLowerInvariant();
        var employeeCode = options.EmployeeCode.Trim().ToUpperInvariant();
        var mobile = options.Mobile.Trim();
        var roleName = options.Role.Trim();
        var departmentName = options.Department.Trim();

        var existingUser = await dbContext.Users.AnyAsync(
            user => user.Email == email || user.EmployeeCode == employeeCode || user.Mobile == mobile,
            cancellationToken);

        if (existingUser)
        {
            return;
        }

        var role = await dbContext.Roles.FirstOrDefaultAsync(role => role.Name == roleName, cancellationToken);
        if (role is null)
        {
            role = new Role { Name = roleName };
            dbContext.Roles.Add(role);
        }

        var department = await dbContext.Departments.FirstOrDefaultAsync(department => department.Name == departmentName, cancellationToken);
        if (department is null)
        {
            department = new Department { Name = departmentName };
            dbContext.Departments.Add(department);
        }

        var user = new User
        {
            EmployeeCode = employeeCode,
            Name = options.Name.Trim(),
            Email = email,
            Mobile = mobile,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(options.Password),
            Role = role,
            Department = department,
            Designation = options.Designation.Trim(),
            IsActive = options.IsActive
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
