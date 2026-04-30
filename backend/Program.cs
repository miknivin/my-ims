using System.Text;
using backend.Features.Auth;
using backend.Features.Reports.LedgerWise;
using backend.Features.Lookups;
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
using backend.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
LoadDotEnv(builder.Environment.ContentRootPath);
builder.Configuration.AddEnvironmentVariables();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient<PurchaseInvoiceAiMappingService>();
builder.Services.AddScoped<PurchaseInvoiceAiMasterMatchService>();

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

builder.Services.AddAuthorization();
builder.Services.AddAntiforgery();
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

app.UseHttpsRedirection();
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();
app.MapGet("/", () => Results.Ok(new { message = "IMS backend is running." }));
app.MapAuthEndpoints();
app.MapLookupEndpoints();
app.MapLedgerWiseReportEndpoints();
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

