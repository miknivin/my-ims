using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using PuppeteerSharp;
using PuppeteerSharp.Media;
using RazorLight;

namespace backend.Features.Inventory.GoodsReceiptNotes;

public sealed class GoodsReceiptNotePdfService : IDisposable
{
    private IBrowser? _browser;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private bool _disposed;

    private static readonly IRazorLightEngine Razor = new RazorLightEngineBuilder()
        .UseEmbeddedResourcesProject(typeof(GoodsReceiptNotePdfService).Assembly, "backend")
        .UseMemoryCachingProvider()
        .Build();

    private const string TemplateKey = "Features.Inventory.GoodsReceiptNotes.GoodsReceiptNotePdfTemplate.cshtml";

    public async Task<byte[]> GeneratePdfAsync(GoodsReceiptNote grn)
    {
        var unitMap = grn.Items
            .Where(i => i.Unit is not null)
            .GroupBy(i => i.UnitId)
            .ToDictionary(g => g.Key, g => g.First().Unit!.Name);

        var items = grn.Items.OrderBy(x => x.SerialNo).Select((item, i) => new GrnPdfLineItem
        {
            Index = i + 1,
            ProductName = item.ProductNameSnapshot,
            HsnCode = item.HsnCode ?? "",
            Quantity = Fmt(item.Quantity),
            FocQuantity = Fmt(item.FocQuantity),
            Uom = unitMap.GetValueOrDefault(item.UnitId) ?? "",
            Rate = Fmt(item.Rate),
            DiscountAmount = Fmt(item.DiscountAmount),
            Total = Fmt(item.Total)
        }).ToList();

        var model = new GoodsReceiptNotePdfModel
        {
            No = grn.Document.No,
            Date = FmtDate(grn.Document.Date),
            DeliveryDate = grn.Document.DeliveryDate is { } dd ? FmtDate(dd) : null,
            Status = grn.Status,
            IsPreview = false,
            Mode = grn.SourceRef.Mode,
            PurchaseOrderNo = grn.SourceRef.PurchaseOrderNo,
            DirectLpoNo = grn.SourceRef.DirectLpoNo,
            DirectVendorInvoiceNo = grn.SourceRef.DirectVendorInvoiceNo,
            VendorName = grn.VendorInformation.VendorNameSnapshot,
            VendorAddress = grn.VendorInformation.Address,
            VendorAttention = grn.VendorInformation.Attention,
            VendorPhone = grn.VendorInformation.Phone,
            Notes = grn.General.Notes,
            TotalAmount = Fmt(grn.Footer.TotalAmount),
            Addition = Fmt(grn.Footer.Addition),
            DiscountFooter = Fmt(grn.Footer.DiscountFooter),
            RoundOff = Fmt(grn.Footer.RoundOff),
            NetTotal = Fmt(grn.Footer.NetTotal),
            TotalQty = Fmt(grn.Footer.TotalQty),
            TotalFoc = Fmt(grn.Footer.TotalFoc),
            Items = items
        };

        return await RenderToPdfAsync(model);
    }

    public async Task<byte[]> GeneratePreviewPdfAsync(
        CreateGoodsReceiptNoteRequest request,
        AppDbContext db,
        CancellationToken ct)
    {
        var unitIds = request.Items.Select(i => i.UnitId).Distinct().ToList();
        var unitNames = unitIds.Count > 0
            ? await db.Uoms.Where(u => unitIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Name, ct)
            : new Dictionary<Guid, string>();

        decimal totalAmount = 0, totalQty = 0, totalFoc = 0;
        var items = new List<GrnPdfLineItem>();
        var idx = 0;

        foreach (var item in request.Items)
        {
            idx++;
            var gross = Math.Round(item.Quantity * item.Rate, 2, MidpointRounding.AwayFromZero);
            var disc = Math.Round((gross * item.DiscountPercent) / 100m, 2, MidpointRounding.AwayFromZero);
            var total = Math.Round(gross - disc, 2, MidpointRounding.AwayFromZero);
            totalAmount += total;
            totalQty += item.Quantity;
            totalFoc += item.FocQuantity;

            unitNames.TryGetValue(item.UnitId, out var unitName);
            items.Add(new GrnPdfLineItem
            {
                Index = idx,
                ProductName = item.ProductNameSnapshot ?? "",
                HsnCode = item.HsnCode ?? "",
                Quantity = Fmt(item.Quantity),
                FocQuantity = Fmt(item.FocQuantity),
                Uom = unitName ?? "",
                Rate = Fmt(item.Rate),
                DiscountAmount = Fmt(disc),
                Total = Fmt(total)
            });
        }

        totalAmount = Math.Round(totalAmount, 2, MidpointRounding.AwayFromZero);
        var netTotal = Math.Round(
            totalAmount + request.Footer.Addition - request.Footer.DiscountFooter + request.Footer.RoundOff,
            2, MidpointRounding.AwayFromZero);

        var model = new GoodsReceiptNotePdfModel
        {
            No = request.Document.No,
            Date = FmtDate(request.Document.Date),
            DeliveryDate = request.Document.DeliveryDate is { } dd ? FmtDate(dd) : null,
            Status = "Preview",
            IsPreview = true,
            Mode = request.SourceRef.Mode,
            PurchaseOrderNo = request.SourceRef.PurchaseOrderNo,
            DirectLpoNo = request.SourceRef.DirectLpoNo,
            DirectVendorInvoiceNo = request.SourceRef.DirectVendorInvoiceNo,
            VendorName = request.VendorInformation.VendorNameSnapshot ?? "",
            VendorAddress = request.VendorInformation.Address ?? "",
            VendorAttention = request.VendorInformation.Attention,
            VendorPhone = request.VendorInformation.Phone,
            Notes = request.General.Notes,
            TotalAmount = Fmt(totalAmount),
            Addition = Fmt(request.Footer.Addition),
            DiscountFooter = Fmt(request.Footer.DiscountFooter),
            RoundOff = Fmt(request.Footer.RoundOff),
            NetTotal = Fmt(netTotal),
            TotalQty = Fmt(Math.Round(totalQty, 2, MidpointRounding.AwayFromZero)),
            TotalFoc = Fmt(Math.Round(totalFoc, 2, MidpointRounding.AwayFromZero)),
            Items = items
        };

        return await RenderToPdfAsync(model);
    }

    private async Task<byte[]> RenderToPdfAsync(GoodsReceiptNotePdfModel model)
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
