using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using PuppeteerSharp;
using PuppeteerSharp.Media;
using RazorLight;

namespace backend.Features.Transactions.SalesInvoices;

public sealed class SalesInvoicePdfService : IDisposable
{
    private IBrowser? _browser;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private bool _disposed;

    private static readonly IRazorLightEngine Razor = new RazorLightEngineBuilder()
        .UseEmbeddedResourcesProject(typeof(SalesInvoicePdfService).Assembly, "backend")
        .UseMemoryCachingProvider()
        .Build();

    private const string TemplateKey = "Features.Transactions.SalesInvoices.SalesInvoicePdfTemplate.cshtml";

    public async Task<byte[]> GeneratePdfAsync(SalesInvoice si)
    {
        var items = si.Items.OrderBy(x => x.Sno).Select((item, i) => new SiPdfLineItem
        {
            Index = i + 1,
            ProductName = item.ProductNameSnapshot,
            HsnCode = item.HsnCode ?? "",
            Quantity = Fmt(item.Quantity),
            Uom = item.Unit?.Name ?? "",
            Rate = Fmt(item.Rate),
            DiscountAmount = Fmt(item.DiscountAmount),
            TaxAmount = Fmt(item.TaxAmount),
            Total = Fmt(item.LineTotal)
        }).ToList();

        var additions = si.Additions.OrderBy(x => x.Id).Select(a => new SiPdfAddition
        {
            Name = string.IsNullOrWhiteSpace(a.Description)
                ? a.LedgerNameSnapshot
                : $"{a.LedgerNameSnapshot} – {a.Description}",
            Amount = Fmt(a.Amount),
            IsDeduction = a.Type == SalesInvoiceAdditionType.Deduction
        }).ToList();

        var refType = si.SourceRef.Type switch
        {
            SalesInvoiceReferenceType.SalesOrder => "Sales Order",
            SalesInvoiceReferenceType.DeliveryNote => "Delivery Note",
            _ => "Direct"
        };

        var model = new SalesInvoicePdfModel
        {
            No = si.Document.No,
            Date = FmtDate(si.Document.Date),
            DueDate = FmtDate(si.Document.DueDate),
            Status = si.Status.ToString(),
            IsPreview = false,
            ReferenceType = refType,
            ReferenceNo = string.IsNullOrWhiteSpace(si.SourceRef.ReferenceNo) ? null : si.SourceRef.ReferenceNo,
            CustomerName = si.CustomerInformation.CustomerNameSnapshot,
            CustomerAddress = si.CustomerInformation.Address,
            CustomerGstin = si.CustomerInformation.CustomerGstinSnapshot,
            ShippingAddress = si.CustomerInformation.ShippingAddress,
            SalespersonName = si.Document.SalespersonName,
            PaymentMode = si.FinancialDetails.PaymentMode.ToString(),
            CustomerInvoiceNo = si.FinancialDetails.InvoiceNo,
            LrNo = si.FinancialDetails.LrNo,
            Currency = si.FinancialDetails.CurrencyCodeSnapshot,
            Taxable = si.General.Taxable,
            InterState = si.General.InterState,
            Notes = si.General.Notes,
            FooterNotes = si.Footer.Notes,
            Total = Fmt(si.Footer.Total),
            Tax = Fmt(si.Items.Sum(i => i.TaxAmount)),
            NetTotal = Fmt(si.Footer.NetTotal),
            AdditionRaw = si.Footer.Addition,
            DeductionRaw = si.Footer.Deduction,
            Items = items,
            Additions = additions
        };

        return await RenderToPdfAsync(model);
    }

    public async Task<byte[]> GeneratePreviewPdfAsync(
        CreateSalesInvoiceRequest request,
        AppDbContext db,
        CancellationToken ct)
    {
        var unitIds = request.Items.Select(i => i.UnitId).Distinct().ToList();
        var unitNames = unitIds.Count > 0
            ? await db.Uoms.Where(u => unitIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Name, ct)
            : new Dictionary<Guid, string>();

        var taxable = request.General.Taxable;
        var afterDiscount = string.Equals(request.General.TaxApplication, "After Discount", StringComparison.OrdinalIgnoreCase);
        decimal total = 0, tax = 0;
        var items = new List<SiPdfLineItem>();
        var idx = 0;

        foreach (var item in request.Items)
        {
            idx++;
            var gross = Math.Round(item.Quantity * item.Rate, 2, MidpointRounding.AwayFromZero);
            var disc = Math.Round((gross * item.DiscountPercent) / 100m, 2, MidpointRounding.AwayFromZero);
            var taxBase = afterDiscount ? Math.Max(0, gross - disc) : gross;
            var taxAmt = taxable ? Math.Round((taxBase * item.TaxPercent) / 100m, 2, MidpointRounding.AwayFromZero) : 0m;
            var lineTotal = Math.Round(taxBase + taxAmt, 2, MidpointRounding.AwayFromZero);
            total += lineTotal;
            tax += taxAmt;

            unitNames.TryGetValue(item.UnitId, out var unitName);
            items.Add(new SiPdfLineItem
            {
                Index = idx,
                ProductName = item.ProductNameSnapshot ?? "",
                HsnCode = item.HsnCode ?? "",
                Quantity = Fmt(item.Quantity),
                Uom = unitName ?? "",
                Rate = Fmt(item.Rate),
                DiscountAmount = Fmt(disc),
                TaxAmount = Fmt(taxAmt),
                Total = Fmt(lineTotal)
            });
        }

        total = Math.Round(total, 2, MidpointRounding.AwayFromZero);
        tax = Math.Round(tax, 2, MidpointRounding.AwayFromZero);

        decimal additionNet = 0, deductionNet = 0;
        var additions = new List<SiPdfAddition>();
        foreach (var a in request.Additions ?? [])
        {
            var isDeduction = string.Equals(a.Type, "Deduction", StringComparison.OrdinalIgnoreCase);
            if (isDeduction) deductionNet += a.Amount;
            else additionNet += a.Amount;
            additions.Add(new SiPdfAddition
            {
                Name = string.IsNullOrWhiteSpace(a.Description)
                    ? (a.LedgerNameSnapshot ?? "")
                    : $"{a.LedgerNameSnapshot ?? ""} – {a.Description}",
                Amount = Fmt(a.Amount),
                IsDeduction = isDeduction
            });
        }

        var netTotal = Math.Round(total + additionNet - deductionNet, 2, MidpointRounding.AwayFromZero);

        var model = new SalesInvoicePdfModel
        {
            No = request.Document.No,
            Date = FmtDate(request.Document.Date),
            DueDate = FmtDate(request.Document.DueDate),
            Status = "Preview",
            IsPreview = true,
            ReferenceType = request.SourceRef.Type,
            ReferenceNo = string.IsNullOrWhiteSpace(request.SourceRef.ReferenceNo) ? null : request.SourceRef.ReferenceNo,
            CustomerName = request.CustomerInformation.CustomerNameSnapshot ?? "",
            CustomerAddress = request.CustomerInformation.Address ?? "",
            CustomerGstin = request.CustomerInformation.CustomerGstinSnapshot,
            ShippingAddress = request.CustomerInformation.ShippingAddress,
            SalespersonName = request.Document.SalespersonName,
            PaymentMode = request.FinancialDetails.PaymentMode,
            CustomerInvoiceNo = request.FinancialDetails.InvoiceNo,
            LrNo = request.FinancialDetails.LrNo,
            Currency = request.FinancialDetails.CurrencyCodeSnapshot,
            Taxable = taxable,
            InterState = request.General.InterState,
            Notes = request.General.Notes,
            FooterNotes = request.Footer.Notes,
            Total = Fmt(total),
            Tax = Fmt(tax),
            NetTotal = Fmt(netTotal),
            AdditionRaw = Math.Round(additionNet, 2, MidpointRounding.AwayFromZero),
            DeductionRaw = Math.Round(deductionNet, 2, MidpointRounding.AwayFromZero),
            Items = items,
            Additions = additions
        };

        return await RenderToPdfAsync(model);
    }

    private async Task<byte[]> RenderToPdfAsync(SalesInvoicePdfModel model)
    {
        var html = await Razor.CompileRenderAsync(TemplateKey, model);
        var browser = await GetBrowserAsync();
        await using var page = await browser.NewPageAsync();
        await page.SetContentAsync(html, new NavigationOptions { WaitUntil = [WaitUntilNavigation.Networkidle0] });
        return await page.PdfDataAsync(new PdfOptions
        {
            Format = PaperFormat.A4,
            PrintBackground = true,
            MarginOptions = new MarginOptions { Top = "15mm", Bottom = "15mm", Left = "12mm", Right = "12mm" }
        });
    }

    private async Task<IBrowser> GetBrowserAsync()
    {
        if (_browser is { IsClosed: false })
            return _browser;

        await _lock.WaitAsync();
        try
        {
            if (_browser is { IsClosed: false })
                return _browser;

            var bf = new BrowserFetcher();
            await bf.DownloadAsync();
            _browser = await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true,
                Args = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
            });
            return _browser;
        }
        finally
        {
            _lock.Release();
        }
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        _browser?.CloseAsync().GetAwaiter().GetResult();
        _browser?.Dispose();
        _lock.Dispose();
    }

    private static string Fmt(decimal value) =>
        value.ToString("N2", System.Globalization.CultureInfo.InvariantCulture);

    private static string FmtDate(DateOnly date) =>
        date.ToString("dd MMM yyyy", System.Globalization.CultureInfo.InvariantCulture);
}
