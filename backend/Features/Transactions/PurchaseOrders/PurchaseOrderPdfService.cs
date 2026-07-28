using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using PuppeteerSharp;
using PuppeteerSharp.Media;
using RazorLight;

namespace backend.Features.Transactions.PurchaseOrders;

public sealed class PurchaseOrderPdfService : IDisposable
{
    private IBrowser? _browser;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private bool _disposed;

    private static readonly IRazorLightEngine Razor = new RazorLightEngineBuilder()
        .UseEmbeddedResourcesProject(typeof(PurchaseOrderPdfService).Assembly, "backend")
        .UseMemoryCachingProvider()
        .Build();

    private const string TemplateKey = "Features.Transactions.PurchaseOrders.PurchaseOrderPdfTemplate.cshtml";

    // ── Public API ────────────────────────────────────────────────────────────

    public async Task<byte[]> GeneratePdfAsync(PurchaseOrder po)
    {
        var items = po.Items.OrderBy(x => x.Id).Select((item, i) => new PdfLineItem
        {
            Index = i + 1,
            ProductName = item.ProductNameSnapshot,
            HsnCode = item.HsnCode ?? "",
            Quantity = Fmt(item.Quantity),
            Uom = item.Unit?.Name ?? "",
            Rate = Fmt(item.Rate),
            DiscountAmount = Fmt(item.DiscountAmount),
            TaxAmount = Fmt(item.CgstAmount + item.SgstAmount + item.IgstAmount),
            Total = Fmt(item.LineTotal)
        }).ToList();

        var additions = po.Additions.OrderBy(x => x.Id).Select(a => new PdfAddition
        {
            Name = string.IsNullOrWhiteSpace(a.Description)
                ? a.LedgerNameSnapshot
                : $"{a.LedgerNameSnapshot} – {a.Description}",
            Amount = Fmt(a.Amount),
            IsDeduction = a.Type == PurchaseOrderAdditionTypes.Deduction
        }).ToList();

        var model = new PurchaseOrderPdfModel
        {
            No = po.OrderDetails.No,
            Date = FmtDate(po.OrderDetails.Date),
            DueDate = FmtDate(po.OrderDetails.DueDate),
            DeliveryDate = FmtDate(po.OrderDetails.DeliveryDate),
            Reference = po.ProductInformation.Reference,
            MrNo = po.ProductInformation.MrNo,
            Status = po.Status,
            IsPreview = false,
            VendorName = po.VendorInformation.VendorNameSnapshot,
            VendorAddress = po.VendorInformation.Address,
            VendorAttention = po.VendorInformation.Attention,
            VendorPhone = po.VendorInformation.Phone,
            PaymentMode = po.FinancialDetails.PaymentMode,
            Currency = po.FinancialDetails.CurrencyLabelSnapshot,
            WarehouseName = po.DeliveryInformation.WarehouseNameSnapshot,
            DeliveryAddress = po.DeliveryInformation.Address,
            DeliveryAttention = po.DeliveryInformation.Attention,
            DeliveryPhone = po.DeliveryInformation.Phone,
            Notes = po.Footer.Notes,
            Remarks = po.Footer.Remarks,
            Total = Fmt(po.Footer.Total),
            Discount = Fmt(po.Footer.Discount),
            Tax = Fmt(po.Footer.Tax),
            AdditionRaw = po.Footer.Addition,
            Advance = Fmt(po.Footer.Advance),
            NetTotal = Fmt(po.Footer.NetTotal),
            Items = items,
            Additions = additions
        };

        return await RenderToPdfAsync(model);
    }

    public async Task<byte[]> GeneratePreviewPdfAsync(
        CreatePurchaseOrderRequest request,
        AppDbContext db,
        CancellationToken ct)
    {
        var unitIds = request.Items.Select(i => i.UnitId).Distinct().ToList();
        var unitNames = unitIds.Count > 0
            ? await db.Uoms.Where(u => unitIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Name, ct)
            : new Dictionary<Guid, string>();

        var taxable = request.Footer.Taxable;
        decimal total = 0, discount = 0, tax = 0;
        var items = new List<PdfLineItem>();
        var idx = 0;

        foreach (var item in request.Items)
        {
            idx++;
            var discType = item.DiscountType?.Trim().ToLowerInvariant() ?? "percentage";
            var gross = Math.Round(item.Quantity * item.Rate, 2, MidpointRounding.AwayFromZero);
            var disc = discType == "percentage"
                ? Math.Round((gross * item.DiscountValue) / 100m, 2, MidpointRounding.AwayFromZero)
                : Math.Round(item.DiscountValue, 2, MidpointRounding.AwayFromZero);
            var taxableAmt = Math.Max(0, Math.Round(gross - disc, 2, MidpointRounding.AwayFromZero));
            var cgst = taxable ? Math.Round((taxableAmt * item.CgstRate) / 100m, 2, MidpointRounding.AwayFromZero) : 0;
            var sgst = taxable ? Math.Round((taxableAmt * item.SgstRate) / 100m, 2, MidpointRounding.AwayFromZero) : 0;
            var igst = taxable ? Math.Round((taxableAmt * item.IgstRate) / 100m, 2, MidpointRounding.AwayFromZero) : 0;
            var taxAmt = cgst + sgst + igst;
            var lineTotal = Math.Round(taxableAmt + taxAmt, 2, MidpointRounding.AwayFromZero);
            total += lineTotal;
            discount += disc;
            tax += taxAmt;

            unitNames.TryGetValue(item.UnitId, out var unitName);
            items.Add(new PdfLineItem
            {
                Index = idx,
                ProductName = item.ItemNameSnapshot ?? "",
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

        decimal additionNet = 0;
        var additions = new List<PdfAddition>();
        foreach (var a in request.Additions ?? [])
        {
            var hasMeaning = a.LedgerId is not null || !string.IsNullOrWhiteSpace(a.Description) || a.Amount != 0;
            if (!hasMeaning) continue;
            var isDeduction = string.Equals(a.Type?.Trim(), "Deduction", StringComparison.OrdinalIgnoreCase);
            additionNet += isDeduction ? -a.Amount : a.Amount;
            var name = string.IsNullOrWhiteSpace(a.Description)
                ? (a.LedgerName ?? "")
                : $"{a.LedgerName ?? ""} – {a.Description}";
            additions.Add(new PdfAddition { Name = name, Amount = Fmt(a.Amount), IsDeduction = isDeduction });
        }

        additionNet = Math.Round(additionNet, 2, MidpointRounding.AwayFromZero);
        var advance = request.Footer.Advance;
        var netTotal = Math.Round(total + additionNet - advance, 2, MidpointRounding.AwayFromZero);

        var model = new PurchaseOrderPdfModel
        {
            No = request.OrderDetails.No,
            Date = FmtDate(request.OrderDetails.Date),
            DueDate = FmtDate(request.OrderDetails.DueDate),
            DeliveryDate = FmtDate(request.OrderDetails.DeliveryDate),
            Reference = request.ProductInformation.Reference,
            MrNo = request.ProductInformation.MrNo,
            Status = "Preview",
            IsPreview = true,
            VendorName = request.VendorInformation.VendorLabel ?? "",
            VendorAddress = request.VendorInformation.Address ?? "",
            VendorAttention = request.VendorInformation.Attention,
            VendorPhone = request.VendorInformation.Phone,
            PaymentMode = request.FinancialDetails.PaymentMode,
            Currency = request.FinancialDetails.CurrencyLabel,
            WarehouseName = request.DeliveryInformation.WarehouseName,
            DeliveryAddress = request.DeliveryInformation.Address ?? "",
            DeliveryAttention = request.DeliveryInformation.Attention,
            DeliveryPhone = request.DeliveryInformation.Phone,
            Notes = request.Footer.Notes,
            Remarks = request.Footer.Remarks,
            Total = Fmt(total),
            Discount = Fmt(discount),
            Tax = Fmt(tax),
            AdditionRaw = additionNet,
            Advance = Fmt(advance),
            NetTotal = Fmt(netTotal),
            Items = items,
            Additions = additions
        };

        return await RenderToPdfAsync(model);
    }

    // ── Rendering ─────────────────────────────────────────────────────────────

    private async Task<byte[]> RenderToPdfAsync(PurchaseOrderPdfModel model)
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

    // ── Browser ───────────────────────────────────────────────────────────────

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

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static string Fmt(decimal value) =>
        value.ToString("N2", System.Globalization.CultureInfo.InvariantCulture);

    private static string FmtDate(DateOnly date) =>
        date.ToString("dd MMM yyyy", System.Globalization.CultureInfo.InvariantCulture);
}
