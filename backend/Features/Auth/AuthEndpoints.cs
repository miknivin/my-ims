using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Infrastructure.Authentication;
using backend.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace backend.Features.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Authentication");

        group.MapPost("/register", RegisterAsync).AllowAnonymous();
        group.MapPost("/login", LoginAsync).AllowAnonymous();
        group.MapPost("/logout", LogoutAsync).AllowAnonymous();
        group.MapGet("/session", GetSessionAsync).RequireAuthorization();

        return app;
    }

    private static async Task<IResult> RegisterAsync(
        RegisterRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.EmployeeCode) ||
            string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Mobile) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Role) ||
            string.IsNullOrWhiteSpace(request.Department))
        {
            return TypedResults.BadRequest(new ApiResponse<object>(
                false,
                "Employee code, name, email, mobile, password, role, and department are required.",
                null));
        }

        if (request.Password.Length < 6)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(
                false,
                "Password must be at least 6 characters.",
                null));
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var employeeCode = request.EmployeeCode.Trim().ToUpperInvariant();
        var mobile = request.Mobile.Trim();

        if (await dbContext.Users.AnyAsync(
                user => user.Email == email || user.Mobile == mobile || user.EmployeeCode == employeeCode,
                cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "User with this email, mobile, or employee code already exists.", null));
        }

        var roleName = request.Role.Trim();
        var departmentName = request.Department.Trim();

        var role = await dbContext.Roles.FirstOrDefaultAsync(role => role.Name == roleName, cancellationToken)
            ?? new Role { Name = roleName };

        var department = await dbContext.Departments.FirstOrDefaultAsync(department => department.Name == departmentName, cancellationToken)
            ?? new Department { Name = departmentName };

        if (role.Id == Guid.Empty)
        {
            dbContext.Roles.Add(role);
        }

        if (department.Id == Guid.Empty)
        {
            dbContext.Departments.Add(department);
        }

        var user = new User
        {
            EmployeeCode = employeeCode,
            Name = request.Name.Trim(),
            Email = email,
            Mobile = mobile,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = role,
            Department = department,
            Designation = string.IsNullOrWhiteSpace(request.Designation) ? roleName : request.Designation.Trim(),
            IsActive = request.IsActive
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Created("/api/auth/register", new ApiResponse<AuthUserDto>(
            true,
            "User created successfully.",
            AuthUserDto.FromEntity(user)));
    }

    private static async Task<IResult> LoginAsync(
        LoginRequest request,
        AppDbContext dbContext,
        IOptions<JwtOptions> jwtOptions,
        HttpContext httpContext,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return TypedResults.BadRequest(new ApiResponse<object>(
                false,
                "Email and password are required.",
                null));
        }

        var email = request.Email.Trim().ToLowerInvariant();

        var user = await dbContext.Users
            .Include(current => current.Role)
            .Include(current => current.Department)
            .FirstOrDefaultAsync(current => current.Email == email && current.IsActive, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return TypedResults.Json(
                new ApiResponse<object>(false, "Invalid email or password.", null),
                statusCode: StatusCodes.Status401Unauthorized);
        }

        var token = CreateToken(user, jwtOptions.Value);
        WriteAuthCookie(httpContext.Response, token, jwtOptions.Value);

        return TypedResults.Ok(new AuthResponse(
            true,
            "Login successful.",
            AuthUserDto.FromEntity(user),
            token,
            jwtOptions.Value.ExpiryDays * 24 * 60 * 60));
    }

    private static IResult LogoutAsync(
        IOptions<JwtOptions> jwtOptions,
        HttpContext httpContext)
    {
        httpContext.Response.Cookies.Delete(jwtOptions.Value.CookieName, BuildCookieOptions(jwtOptions.Value));

        return TypedResults.Ok(new ApiResponse<object>(true, "Logged out successfully.", null));
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    private static async Task<IResult> GetSessionAsync(
        ClaimsPrincipal principal,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var userId = principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? principal.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userId, out var parsedUserId))
        {
            return TypedResults.Json(
                new ApiResponse<object>(false, "Unauthenticated.", null),
                statusCode: StatusCodes.Status401Unauthorized);
        }

        var user = await dbContext.Users
            .Include(current => current.Role)
            .Include(current => current.Department)
            .FirstOrDefaultAsync(current => current.Id == parsedUserId && current.IsActive, cancellationToken);

        return user is null
            ? TypedResults.Json(
                new ApiResponse<object>(false, "Unauthenticated.", null),
                statusCode: StatusCodes.Status401Unauthorized)
            : TypedResults.Ok(new AuthSessionResponse(true, "Session fetched successfully.", AuthUserDto.FromEntity(user)));
    }

    private static string CreateToken(User user, JwtOptions options)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Name, user.Name),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.Name)
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: options.Issuer,
            audience: options.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(options.ExpiryDays),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static void WriteAuthCookie(HttpResponse response, string token, JwtOptions options)
    {
        response.Cookies.Append(options.CookieName, token, BuildCookieOptions(options));
    }

    private static CookieOptions BuildCookieOptions(JwtOptions options)
    {
        return new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Secure = false,
            Expires = DateTimeOffset.UtcNow.AddDays(options.ExpiryDays),
            Path = "/"
        };
    }
}
