namespace backend.Features.Auth;

public sealed class AuthBootstrapOptions
{
    public const string SectionName = "BootstrapAdmin";

    public bool Enabled { get; set; }

    public string EmployeeCode { get; set; } = "SA001";

    public string Name { get; set; } = "Super Admin";

    public string Email { get; set; } = "superadmin@ims.local";

    public string Mobile { get; set; } = "9999999999";

    public string Password { get; set; } = "SuperAdmin@123";

    public string Role { get; set; } = "superadmin";

    public string Department { get; set; } = "Administration";

    public string Designation { get; set; } = "Super Administrator";

    public bool IsActive { get; set; } = true;
}
