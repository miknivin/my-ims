namespace backend.Infrastructure.Middleware;

public sealed class SecurityHeadersMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Path.StartsWithSegments("/swagger"))
        {
            var h = context.Response.Headers;
            h["X-Content-Type-Options"] = "nosniff";
            h["X-Frame-Options"]        = "DENY";
            h["X-XSS-Protection"]       = "1; mode=block";
            h["Referrer-Policy"]        = "strict-origin-when-cross-origin";
            h["Permissions-Policy"]     = "camera=(), microphone=(), geolocation=()";
        }
        await next(context);
    }
}
