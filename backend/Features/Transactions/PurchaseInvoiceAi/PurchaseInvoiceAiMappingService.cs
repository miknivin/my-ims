using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Features.Masters.Currencies;
using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Products;
using backend.Features.Masters.Uoms;
using backend.Features.Masters.Vendors;
using backend.Features.Masters.Warehouses;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Transactions.PurchaseInvoiceAi;

public sealed class PurchaseInvoiceAiMappingService(HttpClient httpClient, IConfiguration configuration)
{
    private const string DefaultGatewayBaseUrl = "https://ai-gateway.vercel.sh/v1/";
    private const string DefaultModel = "openai/gpt-5.4";
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<(PurchaseInvoiceAiMappingResponse? Result, string? Error)> MapAsync(
        Stream pdfStream,
        string fileName,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var apiKey = configuration["AI_GATEWAY_API_KEY"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return (null, "AI gateway API key is not configured.");
        }

        using var memoryStream = new MemoryStream();
        await pdfStream.CopyToAsync(memoryStream, cancellationToken);
        var pdfBase64 = Convert.ToBase64String(memoryStream.ToArray());

        ConfigureHttpClient(apiKey);

        var extraction = await ExtractAsync(pdfBase64, fileName, cancellationToken);
        if (extraction.Error is not null)
        {
            return (null, extraction.Error);
        }

        var mapped = await BuildDraftAsync(dbContext, extraction.Result!, cancellationToken);
        return (mapped, null);
    }

    private void ConfigureHttpClient(string apiKey)
    {
        var configuredBaseUrl = configuration["AI_GATEWAY_BASE_URL"];
        httpClient.BaseAddress = new Uri(
            string.IsNullOrWhiteSpace(configuredBaseUrl)
                ? DefaultGatewayBaseUrl
                : configuredBaseUrl.EndsWith("/", StringComparison.Ordinal)
                    ? configuredBaseUrl
                    : $"{configuredBaseUrl}/");
        httpClient.Timeout = TimeSpan.FromSeconds(90);
        httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", apiKey);
    }

    private async Task<(PurchaseInvoiceAiExtraction? Result, string? Error)> ExtractAsync(
        string pdfBase64,
        string fileName,
        CancellationToken cancellationToken)
    {
        var request = new
        {
            model = string.IsNullOrWhiteSpace(configuration["AI_GATEWAY_MODEL"])
                ? DefaultModel
                : configuration["AI_GATEWAY_MODEL"],
            stream = false,
            messages = new object[]
            {
                new
                {
                    role = "system",
                    content =
                        "You extract purchase invoice data from PDFs into structured JSON. " +
                        "Do not invent internal IDs, ledgers, warehouses, or master-data names. " +
                        "Return invoice-visible data only. Prefer empty strings or nulls over guesses."
                },
                new
                {
                    role = "user",
                    content = new object[]
                    {
                        new
                        {
                            type = "text",
                            text =
                                "Extract this purchase invoice into the provided JSON schema. " +
                                "Use ISO dates (YYYY-MM-DD) when possible. " +
                                "If a field is missing, keep it empty. " +
                                "For payment_mode use Cash or Credit. " +
                                "For tax_application use After Discount or Before Discount. " +
                                "For addition type use Addition or Deduction."
                        },
                        new
                        {
                            type = "file",
                            file = new
                            {
                                data = pdfBase64,
                                media_type = "application/pdf",
                                filename = fileName
                            }
                        }
                    }
                }
            },
            response_format = new
            {
                type = "json_schema",
                json_schema = new
                {
                    name = "purchase_invoice_mapping",
                    schema = BuildSchema()
                }
            }
        };

        using var response = await httpClient.PostAsync(
            "chat/completions",
            new StringContent(JsonSerializer.Serialize(request, JsonOptions), Encoding.UTF8, "application/json"),
            cancellationToken);

        var rawResponse = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return (null, $"AI mapping request failed: {rawResponse}");
        }

        var gatewayResponse = JsonSerializer.Deserialize<PurchaseInvoiceAiGatewayResponse>(rawResponse, JsonOptions);
        var content = gatewayResponse?.Choices?.FirstOrDefault()?.Message?.Content;
        if (string.IsNullOrWhiteSpace(content))
        {
            return (null, "AI mapping returned an empty response.");
        }

        try
        {
            var extraction = JsonSerializer.Deserialize<PurchaseInvoiceAiExtraction>(content, JsonOptions);
            if (extraction is null)
            {
                return (null, "AI mapping response could not be parsed.");
            }

            return (extraction, null);
        }
        catch (JsonException)
        {
            return (null, "AI mapping response was not valid JSON.");
        }
    }

    private static object BuildSchema()
    {
        return new
        {
            type = "object",
            additionalProperties = false,
            required = new[]
            {
                "documentNo", "documentDate", "dueDate", "vendorName", "vendorAddress",
                "vendorAttention", "vendorPhone", "paymentMode", "supplierInvoiceNo",
                "lrNo", "currencyCode", "currencySymbol", "notes", "taxable",
                "taxApplication", "interState", "taxOnFoc", "items", "additions", "declaredTotals"
            },
            properties = new
            {
                documentNo = new { type = "string" },
                documentDate = new { type = "string" },
                dueDate = new { type = "string" },
                vendorName = new { type = "string" },
                vendorAddress = new { type = "string" },
                vendorAttention = new { type = "string" },
                vendorPhone = new { type = "string" },
                paymentMode = new { type = "string" },
                supplierInvoiceNo = new { type = "string" },
                lrNo = new { type = "string" },
                currencyCode = new { type = "string" },
                currencySymbol = new { type = "string" },
                notes = new { type = "string" },
                taxable = new { type = "boolean" },
                taxApplication = new { type = "string" },
                interState = new { type = "boolean" },
                taxOnFoc = new { type = "boolean" },
                items = new
                {
                    type = "array",
                    items = new
                    {
                        type = "object",
                        additionalProperties = false,
                        required = new[]
                        {
                            "productCode", "productName", "hsnCode", "unit", "quantity", "foc",
                            "rate", "discountPercent", "taxPercent", "warehouse", "sellingRate",
                            "wholesaleRate", "mrp"
                        },
                        properties = new
                        {
                            productCode = new { type = "string" },
                            productName = new { type = "string" },
                            hsnCode = new { type = "string" },
                            unit = new { type = "string" },
                            quantity = new { type = "number" },
                            foc = new { type = "number" },
                            rate = new { type = "number" },
                            discountPercent = new { type = "number" },
                            taxPercent = new { type = "number" },
                            warehouse = new { type = "string" },
                            sellingRate = new { type = "number" },
                            wholesaleRate = new { type = "number" },
                            mrp = new { type = "number" }
                        }
                    }
                },
                additions = new
                {
                    type = "array",
                    items = new
                    {
                        type = "object",
                        additionalProperties = false,
                        required = new[] { "type", "ledger", "description", "amount" },
                        properties = new
                        {
                            type = new { type = "string" },
                            ledger = new { type = "string" },
                            description = new { type = "string" },
                            amount = new { type = "number" }
                        }
                    }
                },
                declaredTotals = new
                {
                    type = "object",
                    additionalProperties = false,
                    required = new[] { "subtotal", "tax", "addition", "deduction", "netTotal" },
                    properties = new
                    {
                        subtotal = new { type = "number" },
                        tax = new { type = "number" },
                        addition = new { type = "number" },
                        deduction = new { type = "number" },
                        netTotal = new { type = "number" }
                    }
                }
            }
        };
    }

    private async Task<PurchaseInvoiceAiMappingResponse> BuildDraftAsync(
        AppDbContext dbContext,
        PurchaseInvoiceAiExtraction extraction,
        CancellationToken cancellationToken)
    {
        var warnings = new List<string>();
        var unresolvedFields = new List<string>();

        var vendorMatch = await MatchVendorAsync(dbContext, extraction.VendorName, cancellationToken);
        if (vendorMatch is null)
        {
            unresolvedFields.Add("Vendor requires manual selection.");
        }

        var currencyMatch = await MatchCurrencyAsync(
            dbContext,
            extraction.CurrencyCode,
            extraction.CurrencySymbol,
            vendorMatch?.CreditAndFinance.CurrencyId,
            cancellationToken);

        if (currencyMatch is null && !string.IsNullOrWhiteSpace(extraction.CurrencyCode))
        {
            unresolvedFields.Add("Currency requires manual selection.");
        }

        var general = new PurchaseInvoiceAiGeneralDto(
            extraction.Notes?.Trim() ?? string.Empty,
            string.Empty,
            extraction.Taxable ?? true,
            NormalizeTaxApplication(extraction.TaxApplication),
            extraction.InterState ?? false,
            extraction.TaxOnFoc ?? false);

        var items = new List<PurchaseInvoiceAiLineItemDto>();
        foreach (var item in extraction.Items ?? [])
        {
            var productMatch = await MatchProductAsync(
                dbContext,
                item.ProductName,
                item.ProductCode,
                item.HsnCode,
                vendorMatch?.Id,
                cancellationToken);

            if (productMatch is null)
            {
                unresolvedFields.Add($"Line {items.Count + 1}: product requires manual selection.");
            }

            var unitMatch = await MatchUomAsync(dbContext, item.Unit, cancellationToken);
            var unitId = unitMatch?.Id ?? productMatch?.StockAndMeasurement.PurchaseUomId;
            var unitName =
                unitMatch?.Name ??
                productMatch?.StockAndMeasurement.PurchaseUom?.Name ??
                (item.Unit?.Trim() ?? string.Empty);

            if (unitId is null)
            {
                unresolvedFields.Add($"Line {items.Count + 1}: unit requires manual selection.");
            }

            var warehouseMatch = await MatchWarehouseAsync(dbContext, item.Warehouse, cancellationToken);

            items.Add(new PurchaseInvoiceAiLineItemDto(
                items.Count + 1,
                productMatch?.Id,
                productMatch?.BasicInfo.Code ?? NormalizeText(item.ProductCode),
                productMatch?.BasicInfo.Name ?? NormalizeText(item.ProductName),
                productMatch?.StockAndMeasurement.Hsn ?? NormalizeText(item.HsnCode),
                unitId,
                unitName,
                FormatDecimal(item.Quantity ?? 1),
                FormatDecimal(item.Foc ?? 0),
                FormatDecimal(item.Rate ?? productMatch?.PricingAndRates.PurchaseRate ?? 0),
                FormatDecimal(item.DiscountPercent ?? 0),
                FormatDecimal(item.TaxPercent ?? 0),
                FormatDecimal(item.SellingRate ?? GetSellingRate(productMatch)),
                FormatDecimal(item.WholesaleRate ?? GetWholesaleRate(productMatch)),
                FormatDecimal(item.Mrp ?? GetMrp(productMatch)),
                warehouseMatch?.Id,
                warehouseMatch?.Name ?? NormalizeText(item.Warehouse)));
        }

        var additions = new List<PurchaseInvoiceAiAdditionDto>();
        foreach (var addition in extraction.Additions ?? [])
        {
            var ledgerMatch = await MatchLedgerAsync(dbContext, addition.Ledger, cancellationToken);
            if (ledgerMatch is null && (!string.IsNullOrWhiteSpace(addition.Ledger) || (addition.Amount ?? 0) != 0))
            {
                unresolvedFields.Add($"Addition '{NormalizeText(addition.Description)}' ledger requires manual selection.");
            }

            additions.Add(new PurchaseInvoiceAiAdditionDto(
                NormalizeAdditionType(addition.Type),
                ledgerMatch?.Id,
                ledgerMatch?.Name ?? NormalizeText(addition.Ledger),
                NormalizeText(addition.Description),
                FormatDecimal(addition.Amount ?? 0)));
        }

        var draft = new PurchaseInvoiceAiDraftDto(
            new PurchaseInvoiceAiSourceReferenceDto("Direct", null, string.Empty),
            new PurchaseInvoiceAiDocumentDto(
                NormalizeText(extraction.DocumentNo),
                NormalizeDate(extraction.DocumentDate),
                NormalizeDate(extraction.DueDate, extraction.DocumentDate)),
            new PurchaseInvoiceAiVendorInformationDto(
                vendorMatch?.Id,
                vendorMatch?.BasicInfo.Name ?? NormalizeText(extraction.VendorName),
                vendorMatch?.AddressAndContact.Address ?? NormalizeText(extraction.VendorAddress),
                vendorMatch?.AddressAndContact.ContactName ?? NormalizeText(extraction.VendorAttention),
                vendorMatch?.AddressAndContact.Phone ?? NormalizeText(extraction.VendorPhone)),
            new PurchaseInvoiceAiFinancialDetailsDto(
                NormalizePaymentMode(extraction.PaymentMode),
                NormalizeText(extraction.SupplierInvoiceNo),
                NormalizeText(extraction.LrNo),
                currencyMatch?.Id,
                currencyMatch?.Code ?? NormalizeText(extraction.CurrencyCode),
                currencyMatch?.Symbol ?? NormalizeText(extraction.CurrencySymbol)),
            new PurchaseInvoiceAiProductInformationDto("Vendor Products", false),
            general,
            items,
            additions,
            new PurchaseInvoiceAiFooterDto(string.Empty));

        var computedNetTotal = ComputeNetTotal(items, additions, general);
        var declaredTotals = new PurchaseInvoiceAiDeclaredTotalsDto(
            extraction.DeclaredTotals.Subtotal,
            extraction.DeclaredTotals.Tax,
            extraction.DeclaredTotals.Addition,
            extraction.DeclaredTotals.Deduction,
            extraction.DeclaredTotals.NetTotal,
            computedNetTotal);

        if (declaredTotals.NetTotal is not null &&
            Math.Abs(declaredTotals.NetTotal.Value - declaredTotals.ComputedNetTotal.GetValueOrDefault()) > 1)
        {
            warnings.Add(
                $"Declared net total {declaredTotals.NetTotal.Value:0.00} differs from computed total {declaredTotals.ComputedNetTotal.GetValueOrDefault():0.00}.");
        }

        if (items.Count == 0)
        {
            warnings.Add("AI did not confidently extract any line items. Please review the invoice manually.");
        }

        return new PurchaseInvoiceAiMappingResponse(draft, declaredTotals, warnings, unresolvedFields);
    }

    private static decimal? ComputeNetTotal(
        IReadOnlyList<PurchaseInvoiceAiLineItemDto> items,
        IReadOnlyList<PurchaseInvoiceAiAdditionDto> additions,
        PurchaseInvoiceAiGeneralDto general)
    {
        decimal total = 0;

        foreach (var item in items)
        {
            var quantity = ParseDecimal(item.Quantity);
            var foc = ParseDecimal(item.Foc);
            var totalQuantity = quantity + foc;
            var rate = ParseDecimal(item.Rate);
            var discountPercent = ParseDecimal(item.DiscountPercent);
            var taxPercent = ParseDecimal(item.TaxPercent);

            var grossAmount = Math.Round(totalQuantity * rate, 2, MidpointRounding.AwayFromZero);
            var discountAmount = Math.Round((grossAmount * discountPercent) / 100m, 2, MidpointRounding.AwayFromZero);
            var taxBaseQuantity = general.TaxOnFoc ? totalQuantity : quantity;
            var taxBaseGross = Math.Round(taxBaseQuantity * rate, 2, MidpointRounding.AwayFromZero);
            var discountRatio = grossAmount > 0 ? discountAmount / grossAmount : 0;
            var discountedTaxBase = general.TaxApplication == "After Discount"
                ? Math.Round(taxBaseGross * (1 - discountRatio), 2, MidpointRounding.AwayFromZero)
                : taxBaseGross;
            var taxableAmount = Math.Max(
                0,
                general.Taxable
                    ? discountedTaxBase
                    : Math.Round(grossAmount - discountAmount, 2, MidpointRounding.AwayFromZero));
            var taxAmount = general.Taxable
                ? Math.Round((taxableAmount * taxPercent) / 100m, 2, MidpointRounding.AwayFromZero)
                : 0;

            total += taxableAmount + taxAmount;
        }

        var additionTotal = additions
            .Where(current => current.Type == "Addition")
            .Sum(current => ParseDecimal(current.Amount));
        var deductionTotal = additions
            .Where(current => current.Type == "Deduction")
            .Sum(current => ParseDecimal(current.Amount));

        return Math.Round(total + additionTotal - deductionTotal, 2, MidpointRounding.AwayFromZero);
    }

    private static decimal ParseDecimal(string? value) =>
        decimal.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out var parsed)
            ? parsed
            : 0;

    private static async Task<Vendor?> MatchVendorAsync(
        AppDbContext dbContext,
        string? vendorName,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(vendorName))
        {
            return null;
        }

        var normalized = NormalizeForMatch(vendorName);
        var vendors = await dbContext.Vendors.AsNoTracking().ToListAsync(cancellationToken);

        return vendors
            .Select(current => new
            {
                Vendor = current,
                Score = ScoreTextMatch(normalized, current.BasicInfo.Name, current.BasicInfo.Code)
            })
            .Where(current => current.Score >= 75)
            .OrderByDescending(current => current.Score)
            .Select(current => current.Vendor)
            .FirstOrDefault();
    }

    private static async Task<Currency?> MatchCurrencyAsync(
        AppDbContext dbContext,
        string? currencyCode,
        string? currencySymbol,
        Guid? vendorCurrencyId,
        CancellationToken cancellationToken)
    {
        if (vendorCurrencyId is not null)
        {
            var vendorCurrency = await dbContext.Currencies.AsNoTracking()
                .FirstOrDefaultAsync(current => current.Id == vendorCurrencyId.Value, cancellationToken);
            if (vendorCurrency is not null)
            {
                return vendorCurrency;
            }
        }

        var currencies = await dbContext.Currencies.AsNoTracking().ToListAsync(cancellationToken);
        var normalizedCode = NormalizeForMatch(currencyCode);
        var normalizedSymbol = NormalizeForMatch(currencySymbol);

        return currencies
            .Select(current => new
            {
                Currency = current,
                Score = Math.Max(
                    ScoreTextMatch(normalizedCode, current.Code, current.Name),
                    ScoreTextMatch(normalizedSymbol, current.Symbol, current.Name))
            })
            .Where(current => current.Score >= 80)
            .OrderByDescending(current => current.Score)
            .Select(current => current.Currency)
            .FirstOrDefault();
    }

    private static async Task<Product?> MatchProductAsync(
        AppDbContext dbContext,
        string? productName,
        string? productCode,
        string? hsnCode,
        Guid? vendorId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(productName) && string.IsNullOrWhiteSpace(productCode))
        {
            return null;
        }

        var products = await dbContext.Products
            .AsNoTracking()
            .Include(current => current.StockAndMeasurement.PurchaseUom)
            .Include(current => current.Properties.Categorization.Vendor)
            .ToListAsync(cancellationToken);

        var normalizedName = NormalizeForMatch(productName);
        var normalizedCode = NormalizeForMatch(productCode);
        var normalizedHsn = NormalizeForMatch(hsnCode);

        return products
            .Select(current =>
            {
                var score = Math.Max(
                    ScoreTextMatch(normalizedName, current.BasicInfo.Name, current.BasicInfo.Code),
                    ScoreTextMatch(normalizedCode, current.BasicInfo.Code, current.BasicInfo.Name));

                if (!string.IsNullOrWhiteSpace(normalizedHsn) &&
                    NormalizeForMatch(current.StockAndMeasurement.Hsn) == normalizedHsn)
                {
                    score += 10;
                }

                if (vendorId is not null && current.Properties.Categorization.VendorId == vendorId)
                {
                    score += 5;
                }

                return new
                {
                    Product = current,
                    Score = score
                };
            })
            .Where(current => current.Score >= 75)
            .OrderByDescending(current => current.Score)
            .Select(current => current.Product)
            .FirstOrDefault();
    }

    private static async Task<Uom?> MatchUomAsync(
        AppDbContext dbContext,
        string? unit,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(unit))
        {
            return null;
        }

        var normalized = NormalizeForMatch(unit);
        var uoms = await dbContext.Uoms.AsNoTracking().ToListAsync(cancellationToken);

        return uoms
            .Select(current => new
            {
                Uom = current,
                Score = ScoreTextMatch(normalized, current.Name, current.Code)
            })
            .Where(current => current.Score >= 75)
            .OrderByDescending(current => current.Score)
            .Select(current => current.Uom)
            .FirstOrDefault();
    }

    private static async Task<Warehouse?> MatchWarehouseAsync(
        AppDbContext dbContext,
        string? warehouse,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(warehouse))
        {
            return null;
        }

        var normalized = NormalizeForMatch(warehouse);
        var warehouses = await dbContext.Warehouses.AsNoTracking().ToListAsync(cancellationToken);

        return warehouses
            .Select(current => new
            {
                Warehouse = current,
                Score = ScoreTextMatch(normalized, current.Name, current.Code)
            })
            .Where(current => current.Score >= 75)
            .OrderByDescending(current => current.Score)
            .Select(current => current.Warehouse)
            .FirstOrDefault();
    }

    private static async Task<Ledger?> MatchLedgerAsync(
        AppDbContext dbContext,
        string? ledger,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(ledger))
        {
            return null;
        }

        var normalized = NormalizeForMatch(ledger);
        var ledgers = await dbContext.Ledgers.AsNoTracking().ToListAsync(cancellationToken);

        return ledgers
            .Select(current => new
            {
                Ledger = current,
                Score = ScoreTextMatch(normalized, current.Name, current.Code, current.Alias)
            })
            .Where(current => current.Score >= 75)
            .OrderByDescending(current => current.Score)
            .Select(current => current.Ledger)
            .FirstOrDefault();
    }

    private static int ScoreTextMatch(string normalizedInput, params string?[] candidates)
    {
        if (string.IsNullOrWhiteSpace(normalizedInput))
        {
            return 0;
        }

        var best = 0;
        foreach (var candidate in candidates)
        {
            var normalizedCandidate = NormalizeForMatch(candidate);
            if (string.IsNullOrWhiteSpace(normalizedCandidate))
            {
                continue;
            }

            if (normalizedCandidate == normalizedInput)
            {
                return 100;
            }

            if (normalizedCandidate.StartsWith(normalizedInput, StringComparison.Ordinal) ||
                normalizedInput.StartsWith(normalizedCandidate, StringComparison.Ordinal))
            {
                best = Math.Max(best, 85);
            }
            else if (normalizedCandidate.Contains(normalizedInput, StringComparison.Ordinal) ||
                     normalizedInput.Contains(normalizedCandidate, StringComparison.Ordinal))
            {
                best = Math.Max(best, 75);
            }
        }

        return best;
    }

    private static string NormalizeForMatch(string? value) =>
        string.IsNullOrWhiteSpace(value)
            ? string.Empty
            : new string(
                    value
                        .Trim()
                        .ToUpperInvariant()
                        .Where(current => char.IsLetterOrDigit(current) || char.IsWhiteSpace(current))
                        .ToArray())
                .Replace("  ", " ", StringComparison.Ordinal);

    private static string NormalizeText(string? value) => value?.Trim() ?? string.Empty;

    private static string NormalizePaymentMode(string? value) =>
        value?.Trim().Equals("Cash", StringComparison.OrdinalIgnoreCase) == true
            ? "Cash"
            : "Credit";

    private static string NormalizeTaxApplication(string? value) =>
        value?.Trim().Equals("Before Discount", StringComparison.OrdinalIgnoreCase) == true
            ? "Before Discount"
            : "After Discount";

    private static string NormalizeAdditionType(string? value) =>
        value?.Trim().Equals("Deduction", StringComparison.OrdinalIgnoreCase) == true
            ? "Deduction"
            : "Addition";

    private static string NormalizeDate(string? rawDate, string? fallbackDate = null)
    {
        if (TryParseDate(rawDate, out var parsed))
        {
            return parsed.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        }

        if (TryParseDate(fallbackDate, out parsed))
        {
            return parsed.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        }

        return DateOnly.FromDateTime(DateTime.UtcNow).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
    }

    private static bool TryParseDate(string? rawDate, out DateOnly parsed)
    {
        if (DateOnly.TryParse(rawDate, CultureInfo.InvariantCulture, DateTimeStyles.None, out parsed))
        {
            return true;
        }

        if (DateTime.TryParse(rawDate, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dateTime))
        {
            parsed = DateOnly.FromDateTime(dateTime);
            return true;
        }

        parsed = default;
        return false;
    }

    private static string FormatDecimal(decimal value) =>
        value.ToString("0.##", CultureInfo.InvariantCulture);

    private static decimal GetSellingRate(Product? product) =>
        product?.PricingAndRates.SalesRate ??
        product?.PricingAndRates.NormalRate ??
        product?.PricingAndRates.PurchaseRate ??
        0;

    private static decimal GetWholesaleRate(Product? product) =>
        product?.PricingAndRates.WholesaleRate ??
        product?.PricingAndRates.SalesRate ??
        product?.PricingAndRates.PurchaseRate ??
        0;

    private static decimal GetMrp(Product? product) =>
        product?.PricingAndRates.Mrp ??
        product?.PricingAndRates.SalesRate ??
        product?.PricingAndRates.PurchaseRate ??
        0;
}
