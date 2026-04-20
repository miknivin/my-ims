namespace backend.Infrastructure.Authentication;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Key { get; init; } = string.Empty;

    public string Issuer { get; init; } = "IMS";

    public string Audience { get; init; } = "IMS";

    public int ExpiryDays { get; init; } = 7;

    public string CookieName { get; init; } = "ims_auth";
}
