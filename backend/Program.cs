using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.SystemConsole.Themes;
using backend.Features.Auth;
using backend.Features.Accounting.Journals;
using backend.Features.Reports.FinancialStatements;
using backend.Features.Reports.Inventory;
using backend.Features.Reports.LedgerWise;
using backend.Features.Reports.ReceivablesPayables;
using backend.Features.Reports.SalesPurchase.PurchaseRegister;
using backend.Features.Reports.SalesPurchase.SalesRegister;
using backend.Features.Lookups;
using backend.Features.Utils;
using backend.Features.Inventory;
using backend.Features.Inventory.DeliveryNotes;
using backend.Features.Inventory.GoodsReceiptNotes;
using backend.Features.Masters.Categories;
using backend.Features.Masters.Customers;
using backend.Features.Masters.Currencies;
using backend.Features.Masters.Discounts;
using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Products;
using backend.Features.Masters.Taxes;
using backend.Features.Masters.Uoms;
using backend.Features.Masters.Vendors;
using backend.Features.Masters.Warehouses;
using backend.Features.Settings;
using backend.Features.Transactions.BillWisePayments;
using backend.Features.Transactions.BillWiseReceipts;
using backend.Features.Transactions.PurchaseCreditNotes;
using backend.Features.Transactions.PurchaseDebitNotes;
using backend.Features.Transactions.PurchaseInvoiceAi;
using backend.Features.Transactions.PurchaseInvoices;
using backend.Features.Transactions.PurchaseOrders;
using backend.Features.Transactions.SalesCreditNotes;
using backend.Features.Transactions.SalesDebitNotes;
using backend.Features.Transactions.SalesInvoices;
using backend.Features.Transactions.SalesOrders;
using backend.Infrastructure.Authentication;
using backend.Infrastructure.Middleware;
using backend.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore",          LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
    .MinimumLevel.Override("Npgsql",                        LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console(
        theme: AnsiConsoleTheme.Code,
        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);
LoadDotEnv(builder.Environment.ContentRootPath);
builder.Configuration.AddEnvironmentVariables();
builder.Host.UseSerilog();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient<PurchaseInvoiceAiMappingService>();
builder.Services.AddScoped<PurchaseInvoiceAiMasterMatchService>();
builder.Services.AddSingleton<PurchaseOrderPdfService>();
builder.Services.AddSingleton<GoodsReceiptNotePdfService>();
builder.Services.AddSingleton<PurchaseInvoicePdfService>();
builder.Services.AddSingleton<SalesInvoicePdfService>();
builder.Services.AddSingleton<DeliveryNotePdfService>();
builder.Services.AddSingleton<SalesOrderPdfService>();

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<AuthBootstrapOptions>(builder.Configuration.GetSection(AuthBootstrapOptions.SectionName));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = signingKey,
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var cookieName = jwtOptions.CookieName;

                if (context.Request.Cookies.TryGetValue(cookieName, out var token))
                {
                    context.Token = token;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddAuthorization();
builder.Services.AddAntiforgery();
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        var ip = context.Request.Headers["X-Forwarded-For"].FirstOrDefault()
                 ?? context.Connection.RemoteIpAddress?.ToString()
                 ?? "unknown";
        var path = context.Request.Path.Value ?? "";

        bool isAuth = path.StartsWith("/api/auth/login", StringComparison.OrdinalIgnoreCase)
                   || path.StartsWith("/api/auth/register", StringComparison.OrdinalIgnoreCase);
        bool isPdf  = path.EndsWith("/preview-pdf", StringComparison.OrdinalIgnoreCase);

        int    limit = isAuth ? 15 : isPdf ? 20 : 200;
        string key   = $"{(isAuth ? "auth" : isPdf ? "pdf" : "api")}:{ip}";

        return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit          = limit,
            Window               = TimeSpan.FromSeconds(60),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit           = 0,
        });
    });

    options.RejectionStatusCode = 429;
    options.OnRejected = async (ctx, ct) =>
    {
        ctx.HttpContext.Response.ContentType = "application/json";
        await ctx.HttpContext.Response.WriteAsJsonAsync(
            new backend.Features.Auth.ApiResponse<object>(false, "Too many requests. Please slow down.", null), ct);
    };
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"];
        policy.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

var swaggerEnabled = app.Environment.IsDevelopment() || builder.Configuration.GetValue<bool>("Swagger:Enabled");

if (swaggerEnabled)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (dbContext.Database.GetMigrations().Any())
    {
        dbContext.Database.Migrate();
    }
    else
    {
        dbContext.Database.EnsureCreated();
    }
}

await AuthBootstrapper.SeedAsync(app.Services);
await RoleSeeder.SeedAsync(app.Services);
await SystemLedgerSeeder.SeedAsync(app.Services);
await AccountingLedgerSeeder.SeedAsync(app.Services);

app.UseExceptionHandler();
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}
app.UseHttpsRedirection();
app.UseRateLimiter();
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseSerilogRequestLogging(options =>
{
    options.MessageTemplate =
        "HTTP {RequestMethod} {RequestPath} → {StatusCode} ({Elapsed:0}ms){UserContext}";

    options.EnrichDiagnosticContext = static (diag, ctx) =>
    {
        var email = ctx.User.FindFirstValue(ClaimTypes.Email);
        var id    = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
        diag.Set("UserContext", email is not null ? $" · {email} [{id}]" : string.Empty);
    };

    options.GetLevel = static (ctx, _, ex) =>
        ex is not null || ctx.Response.StatusCode >= 500 ? LogEventLevel.Error   :
        ctx.Response.StatusCode >= 400                   ? LogEventLevel.Warning :
                                                           LogEventLevel.Information;
});
app.UseAntiforgery();
app.UseMiddleware<SecurityHeadersMiddleware>();
app.MapGet("/", () => Results.Ok(new { message = "IMS backend is running." }));
app.MapAuthEndpoints();
app.MapRoleEndpoints();
app.MapUserEndpoints();
app.MapCodeGeneratorEndpoints();
app.MapLookupEndpoints();
app.MapJournalEntryEndpoints();
app.MapJournalVoucherEndpoints();
app.MapFinancialStatementEndpoints();
app.MapInventoryReportEndpoints();
app.MapLedgerWiseReportEndpoints();
app.MapReceivablesPayablesEndpoints();
app.MapPurchaseRegisterReportEndpoints();
app.MapSalesRegisterReportEndpoints();
app.MapCategoryEndpoints();
app.MapCustomerEndpoints();
app.MapCurrencyEndpoints();
app.MapDiscountEndpoints();
app.MapLedgerGroupEndpoints();
app.MapLedgerEndpoints();
app.MapProductEndpoints();
app.MapTaxEndpoints();
app.MapUomEndpoints();
app.MapVendorEndpoints();
app.MapWarehouseEndpoints();
app.MapBillWisePaymentEndpoints();
app.MapBillWiseReceiptEndpoints();
app.MapPurchaseCreditNoteEndpoints();
app.MapPurchaseDebitNoteEndpoints();
app.MapPurchaseInvoiceAiEndpoints();
app.MapPurchaseInvoiceEndpoints();
app.MapPurchaseOrderEndpoints();
app.MapSalesCreditNoteEndpoints();
app.MapSalesDebitNoteEndpoints();
app.MapSalesInvoiceEndpoints();
app.MapSalesOrderEndpoints();
app.MapSettingsEndpoints();
app.MapGoodsReceiptNoteEndpoints();
app.MapInventoryBalanceEndpoints();
app.MapDeliveryNoteEndpoints();

app.Run();

static void LoadDotEnv(string contentRootPath)
{
    var envPath = Path.Combine(contentRootPath, ".env");
    if (!File.Exists(envPath))
    {
        return;
    }

    foreach (var rawLine in File.ReadAllLines(envPath))
    {
        var line = rawLine.Trim();
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#", StringComparison.Ordinal))
        {
            continue;
        }

        var separatorIndex = line.IndexOf('=');
        if (separatorIndex <= 0)
        {
            continue;
        }

        var key = line[..separatorIndex].Trim();
        var value = line[(separatorIndex + 1)..].Trim().Trim('"');
        if (string.IsNullOrWhiteSpace(key) || !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(key)))
        {
            continue;
        }

        Environment.SetEnvironmentVariable(key, value);
    }
}
