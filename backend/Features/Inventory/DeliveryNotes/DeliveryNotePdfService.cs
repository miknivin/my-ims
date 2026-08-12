using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using PuppeteerSharp;
using PuppeteerSharp.Media;
using RazorLight;

namespace backend.Features.Inventory.DeliveryNotes;

public sealed class DeliveryNotePdfService : IDisposable
{
    private IBrowser? _browser;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private bool _disposed;

    private static readonly IRazorLightEngine Razor = new RazorLightEngineBuilder()
        .UseEmbeddedResourcesProject(typeof(DeliveryNotePdfService).Assembly, "backend")
        .UseMemoryCachingProvider()
        .Build();

    private const string TemplateKey = "Features.Inventory.DeliveryNotes.DeliveryNotePdfTemplate.cshtml";

    public async Task<byte[]> GeneratePdfAsync(DeliveryNote dn)
    {
        var items = dn.Items.OrderBy(i => i.SerialNo).Select((item, i) => new DnPdfLineItem
        {
            Index = i + 1,
            ProductName = item.ProductNameSnapshot,
            HsnCode = item.HsnCode ?? "",
            Quantity = Fmt(item.Quantity),
            Uom = item.Unit?.Name ?? "",
            Rate = Fmt(item.Rate),
            Total = Fmt(item.Total),
            Warehouse = item.Warehouse?.Name ?? "",
            Remark = item.Remark
        }).ToList();

        var model = new DeliveryNotePdfModel
        {
            No = dn.Document.No,
            Date = FmtDate(dn.Document.Date),
            ExpectedDeliveryDate = dn.Document.ExpectedDeliveryDate.HasValue ? FmtDate(dn.Document.ExpectedDeliveryDate.Value) : null,
            Status = dn.Status,
            IsPreview = false,
            Mode = dn.SourceRef.Mode == DeliveryNoteModes.AgainstSalesOrder ? "Against Sales Order" : "Direct",
            SalesOrderNo = dn.SourceRef.SalesOrderNo,
            DirectRefNo = dn.SourceRef.DirectRefNo,
            CustomerName = dn.CustomerInformation.CustomerNameSnapshot,
            CustomerAddress = dn.CustomerInformation.Address,
            ShippingAddress = dn.CustomerInformation.ShippingAddress,
            TransportMode = dn.Logistics.TransportMode,
            LrNo = dn.Logistics.LrNo,
            VehicleNo = dn.Logistics.VehicleNo,
            EWayBillNo = dn.Logistics.EWayBillNo,
            TransporterName = dn.Logistics.TransporterName,
            Notes = dn.General.Notes,
            TotalQty = Fmt(dn.Footer.TotalQty),
            TotalAmount = Fmt(dn.Footer.TotalAmount),
            NetTotal = Fmt(dn.Footer.NetTotal),
            Items = items
        };

        return await RenderToPdfAsync(model);
    }

    public async Task<byte[]> GeneratePreviewPdfAsync(CreateDeliveryNoteRequest req, AppDbContext db, CancellationToken ct)
    {
        var unitIds = req.Items.Select(i => i.UnitId).Distinct().ToList();
        var unitNames = unitIds.Count > 0
            ? await db.Uoms.Where(u => unitIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id, u => u.Name, ct)
            : new Dictionary<Guid, string>();

        var warehouseIds = req.Items.Select(i => i.WarehouseId).Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToList();
        var warehouseNames = warehouseIds.Count > 0
            ? await db.Warehouses.Where(w => warehouseIds.Contains(w.Id)).ToDictionaryAsync(w => w.Id, w => w.Name, ct)
            : new Dictionary<Guid, string>();

        decimal totalQty = 0, totalAmount = 0;
        var items = new List<DnPdfLineItem>();
        var idx = 0;

        foreach (var item in req.Items)
        {
            idx++;
            var gross = Math.Round(item.Quantity * item.Rate, 2, MidpointRounding.AwayFromZero);
            var disc = Math.Round((gross * item.DiscountPercent) / 100m, 2, MidpointRounding.AwayFromZero);
            var total = Math.Round(gross - disc, 2, MidpointRounding.AwayFromZero);
            totalQty += item.Quantity;
            totalAmount += total;

            unitNames.TryGetValue(item.UnitId, out var unitName);
            var warehouseName = item.WarehouseId.HasValue && warehouseNames.TryGetValue(item.WarehouseId.Value, out var wn) ? wn : "";

            items.Add(new DnPdfLineItem
            {
                Index = idx,
                ProductName = item.ProductNameSnapshot ?? "",
                HsnCode = item.HsnCode ?? "",
                Quantity = Fmt(item.Quantity),
                Uom = unitName ?? "",
                Rate = Fmt(item.Rate),
                Total = Fmt(total),
                Warehouse = warehouseName,
                Remark = item.Remark
            });
        }

        var model = new DeliveryNotePdfModel
        {
            No = req.Document.No,
            Date = FmtDate(req.Document.Date),
            ExpectedDeliveryDate = req.Document.ExpectedDeliveryDate.HasValue ? FmtDate(req.Document.ExpectedDeliveryDate.Value) : null,
            Status = "Preview",
            IsPreview = true,
            Mode = req.SourceRef.Mode == DeliveryNoteModes.AgainstSalesOrder ? "Against Sales Order" : "Direct",
            SalesOrderNo = req.SourceRef.SalesOrderNo,
            DirectRefNo = req.SourceRef.DirectRefNo,
            CustomerName = req.CustomerInformation.CustomerNameSnapshot ?? "",
            CustomerAddress = req.CustomerInformation.Address ?? "",
            ShippingAddress = req.CustomerInformation.ShippingAddress,
            Notes = req.General.Notes,
            TotalQty = Fmt(Math.Round(totalQty, 2, MidpointRounding.AwayFromZero)),
            TotalAmount = Fmt(Math.Round(totalAmount, 2, MidpointRounding.AwayFromZero)),
            NetTotal = Fmt(Math.Round(totalAmount, 2, MidpointRounding.AwayFromZero)),
            Items = items
        };

        return await RenderToPdfAsync(model);
    }

    private async Task<byte[]> RenderToPdfAsync(DeliveryNotePdfModel model)
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
        if (_browser is { IsClosed: false }) return _browser;
        await _lock.WaitAsync();
        try
        {
            if (_browser is { IsClosed: false }) return _browser;
            var bf = new BrowserFetcher();
            await bf.DownloadAsync();
            _browser = await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true,
                Args = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
            });
            return _browser;
        }
        finally { _lock.Release(); }
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        _browser?.CloseAsync().GetAwaiter().GetResult();
        _browser?.Dispose();
        _lock.Dispose();
    }

    private static string Fmt(decimal value) => value.ToString("N2", System.Globalization.CultureInfo.InvariantCulture);
    private static string FmtDate(DateOnly date) => date.ToString("dd MMM yyyy", System.Globalization.CultureInfo.InvariantCulture);
}
