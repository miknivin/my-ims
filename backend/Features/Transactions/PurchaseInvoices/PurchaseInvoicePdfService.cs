using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using PuppeteerSharp;
using PuppeteerSharp.Media;
using RazorLight;

namespace backend.Features.Transactions.PurchaseInvoices;

public sealed class PurchaseInvoicePdfService : IDisposable
{
    private IBrowser? _browser;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private bool _disposed;

    private static readonly IRazorLightEngine Razor = new RazorLightEngineBuilder()
        .UseEmbeddedResourcesProject(typeof(PurchaseInvoicePdfService).Assembly, "backend")
        .UseMemoryCachingProvider()
        .Build();

    private const string TemplateKey = "Features.Transactions.PurchaseInvoices.PurchaseInvoicePdfTemplate.cshtml";

    public async Task<byte[]> GeneratePdfAsync(PurchaseInvoice pi)
    {
        var items = pi.Items.OrderBy(x => x.Sno).Select((item, i) => new PiPdfLineItem
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

        var additions = pi.Additions.OrderBy(x => x.Id).Select(a => new PiPdfAddition
        {
            Name = string.IsNullOrWhiteSpace(a.Description)
                ? a.LedgerNameSnapshot
                : $"{a.LedgerNameSnapshot} – {a.Description}",
            Amount = Fmt(a.Amount),
            IsDeduction = a.Type == PurchaseInvoiceAdditionType.Deduction
        }).ToList();

        var refType = pi.SourceRef.Type switch
        {
            PurchaseInvoiceReferenceType.PurchaseOrder => "Purchase Order",
            PurchaseInvoiceReferenceType.GoodsReceipt => "Goods Receipt",
            _ => "Direct"
        };

        var model = new PurchaseInvoicePdfModel
        {
            No = pi.Document.No,
            Date = FmtDate(pi.Document.Date),
            DueDate = FmtDate(pi.Document.DueDate),
            Status = pi.Status.ToString(),
            IsPreview = false,
            ReferenceType = refType,
            ReferenceNo = string.IsNullOrWhiteSpace(pi.SourceRef.ReferenceNo) ? null : pi.SourceRef.ReferenceNo,
            VendorName = pi.VendorInformation.VendorNameSnapshot,
            VendorAddress = pi.VendorInformation.Address,
            VendorAttention = pi.VendorInformation.Attention,
            VendorPhone = pi.VendorInformation.Phone,
            PaymentMode = pi.FinancialDetails.PaymentMode.ToString(),
            SupplierInvoiceNo = pi.FinancialDetails.SupplierInvoiceNo,
            Currency = pi.FinancialDetails.CurrencyCodeSnapshot,
            Taxable = pi.General.Taxable,
            Notes = pi.General.Notes,
            FooterNotes = pi.Footer.Notes,
            Total = Fmt(pi.Footer.Total),
            Discount = Fmt(pi.Footer.Discount),
            Tax = Fmt(pi.Items.Sum(i => i.TaxAmount)),
            NetTotal = Fmt(pi.Footer.NetTotal),
            AdditionRaw = pi.Footer.Addition,
            DeductionRaw = pi.Footer.Deduction,
            Items = items,
            Additions = additions
        };

        return await RenderToPdfAsync(model);
    }

    public async Task<byte[]> GeneratePreviewPdfAsync(
        CreatePurchaseInvoiceRequest request,
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
        decimal total = 0, discount = 0, tax = 0;
        var items = new List<PiPdfLineItem>();
        var idx = 0;

        foreach (var item in request.Items)
        {
            idx++;
            var gross = Math.Round(item.Quantity * item.Rate, 2, MidpointRounding.AwayFromZero);
            var disc = Math.Round((gross * item.DiscountPercent) / 100m, 2, MidpointRounding.AwayFromZero);
            var taxBase = afterDiscount ? Math.Max(0, gross - disc) : gross;
            var taxAmt = taxable ? Math.Round((taxBase * item.TaxPercent) / 100m, 2, MidpointRounding.AwayFromZero) : 0m;
            var lineTotal = Math.Round(gross - disc + taxAmt, 2, MidpointRounding.AwayFromZero);
            total += lineTotal;
            discount += disc;
            tax += taxAmt;

            unitNames.TryGetValue(item.UnitId, out var unitName);
            items.Add(new PiPdfLineItem
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
        discount = Math.Round(discount, 2, MidpointRounding.AwayFromZero);
        tax = Math.Round(tax, 2, MidpointRounding.AwayFromZero);

        decimal additionNet = 0, deductionNet = 0;
        var additions = new List<PiPdfAddition>();
        foreach (var a in request.Additions ?? [])
        {
            var isDeduction = string.Equals(a.Type, "Deduction", StringComparison.OrdinalIgnoreCase);
            if (isDeduction) deductionNet += a.Amount;
            else additionNet += a.Amount;
            additions.Add(new PiPdfAddition
            {
                Name = string.IsNullOrWhiteSpace(a.Description)
                    ? (a.LedgerNameSnapshot ?? "")
                    : $"{a.LedgerNameSnapshot ?? ""} – {a.Description}",
                Amount = Fmt(a.Amount),
                IsDeduction = isDeduction
            });
        }

        var netTotal = Math.Round(total + additionNet - deductionNet, 2, MidpointRounding.AwayFromZero);

        var model = new PurchaseInvoicePdfModel
        {
            No = request.Document.No,
            Date = FmtDate(request.Document.Date),
            DueDate = FmtDate(request.Document.DueDate),
            Status = "Preview",
            IsPreview = true,
            ReferenceType = request.SourceRef.Type,
            ReferenceNo = string.IsNullOrWhiteSpace(request.SourceRef.ReferenceNo) ? null : request.SourceRef.ReferenceNo,
            VendorName = request.VendorInformation.VendorNameSnapshot ?? "",
            VendorAddress = request.VendorInformation.Address ?? "",
            VendorAttention = request.VendorInformation.Attention,
            VendorPhone = request.VendorInformation.Phone,
            PaymentMode = request.FinancialDetails.PaymentMode,
            SupplierInvoiceNo = request.FinancialDetails.SupplierInvoiceNo,
            Currency = request.FinancialDetails.CurrencyCodeSnapshot,
            Taxable = taxable,
            Notes = request.General.Notes,
            FooterNotes = request.Footer.Notes,
            Total = Fmt(total),
            Discount = Fmt(discount),
            Tax = Fmt(tax),
            NetTotal = Fmt(netTotal),
            AdditionRaw = Math.Round(additionNet, 2, MidpointRounding.AwayFromZero),
            DeductionRaw = Math.Round(deductionNet, 2, MidpointRounding.AwayFromZero),
            Items = items,
            Additions = additions
        };

        return await RenderToPdfAsync(model);
    }

    private async Task<byte[]> RenderToPdfAsync(PurchaseInvoicePdfModel model)
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
