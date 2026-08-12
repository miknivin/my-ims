using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using PuppeteerSharp;
using PuppeteerSharp.Media;
using RazorLight;

namespace backend.Features.Transactions.SalesOrders;

public sealed class SalesOrderPdfService : IDisposable
{
    private IBrowser? _browser;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private bool _disposed;

    private static readonly IRazorLightEngine Razor = new RazorLightEngineBuilder()
        .UseEmbeddedResourcesProject(typeof(SalesOrderPdfService).Assembly, "backend")
        .UseMemoryCachingProvider()
        .Build();

    private const string TemplateKey = "Features.Transactions.SalesOrders.SalesOrderPdfTemplate.cshtml";

    public async Task<byte[]> GeneratePdfAsync(SalesOrder so)
    {
        var items = so.Items.OrderBy(x => x.Sno).ThenBy(x => x.Id).Select((item, i) => new SoPdfLineItem
        {
            Index = i + 1,
            ProductName = item.ProductNameSnapshot,
            HsnCode = item.HsnCode ?? "",
            Quantity = Fmt(item.Quantity),
            Uom = item.Unit?.Name ?? "",
            Rate = Fmt(item.Rate),
            DiscountAmount = Fmt(item.DiscountAmount),
            TaxAmount = Fmt(item.TaxAmount),
            Total = Fmt(item.NetAmount)
        }).ToList();

        var additions = so.Additions.OrderBy(x => x.Id).Select(a => new SoPdfAddition
        {
            Name = string.IsNullOrWhiteSpace(a.Description)
                ? a.LedgerNameSnapshot
                : $"{a.LedgerNameSnapshot} – {a.Description}",
            Amount = Fmt(a.Amount),
            IsDeduction = a.Type == SalesOrderAdditionTypes.Deduction
        }).ToList();

        var tax = so.Items.Sum(i => i.TaxAmount);
        var additionNet = so.Additions.Sum(a =>
            a.Type == SalesOrderAdditionTypes.Deduction ? -a.Amount : a.Amount);

        var model = new SalesOrderPdfModel
        {
            No = so.OrderDetails.No,
            VoucherType = so.OrderDetails.VoucherType == SalesOrderVoucherTypes.Proforma ? "Proforma" : "Sales Order",
            Date = FmtDate(so.OrderDetails.Date),
            DeliveryDate = so.OrderDetails.DeliveryDate.HasValue ? FmtDate(so.OrderDetails.DeliveryDate.Value) : "",
            Status = so.Status,
            IsPreview = false,
            CustomerName = so.PartyInformation.CustomerNameSnapshot,
            CustomerAddress = so.PartyInformation.Address ?? "",
            CustomerAttention = so.PartyInformation.Attention,
            SalesMan = so.SalesDetails.SalesManNameSnapshot,
            VehicleNo = so.Footer.VehicleNo,
            Total = Fmt(so.Footer.Total),
            Discount = Fmt(so.Footer.Discount),
            Tax = Fmt(Math.Round(tax, 2, MidpointRounding.AwayFromZero)),
            Freight = Fmt(so.Footer.Freight),
            HasFreight = so.Footer.Freight != 0,
            AdditionRaw = additionNet,
            SoAdvance = Fmt(so.Footer.SoAdvance),
            HasSoAdvance = so.Footer.SoAdvance != 0,
            RoundOff = Fmt(so.Footer.RoundOff),
            HasRoundOff = so.Footer.RoundOff != 0,
            NetTotal = Fmt(so.Footer.NetTotal),
            Remarks = so.Footer.Remarks,
            Items = items,
            Additions = additions
        };

        return await RenderToPdfAsync(model);
    }

    private async Task<byte[]> RenderToPdfAsync(SalesOrderPdfModel model)
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

public sealed class SalesOrderPdfModel
{
    public string No { get; set; } = "";
    public string VoucherType { get; set; } = "Sales Order";
    public string Date { get; set; } = "";
    public string DeliveryDate { get; set; } = "";
    public string Status { get; set; } = "";
    public bool IsPreview { get; set; }

    public string CustomerName { get; set; } = "";
    public string CustomerAddress { get; set; } = "";
    public string? CustomerAttention { get; set; }
    public string? SalesMan { get; set; }
    public string? VehicleNo { get; set; }

    public string Total { get; set; } = "";
    public string Discount { get; set; } = "";
    public string Tax { get; set; } = "";
    public string Freight { get; set; } = "";
    public bool HasFreight { get; set; }
    public decimal AdditionRaw { get; set; }
    public string SoAdvance { get; set; } = "";
    public bool HasSoAdvance { get; set; }
    public string RoundOff { get; set; } = "";
    public bool HasRoundOff { get; set; }
    public string NetTotal { get; set; } = "";
    public string? Remarks { get; set; }

    public List<SoPdfLineItem> Items { get; set; } = [];
    public List<SoPdfAddition> Additions { get; set; } = [];

    public bool HasAddition => AdditionRaw != 0;
    public string AdditionSign => AdditionRaw >= 0 ? "+" : "−";
    public string AdditionAbs => Math.Abs(AdditionRaw).ToString("N2", System.Globalization.CultureInfo.InvariantCulture);

    public string BadgeClass => Status switch
    {
        "Confirmed" or "Delivered" or "Invoiced" => "b-submitted",
        "Cancelled" => "b-cancelled",
        "Preview" => "b-preview",
        _ => "b-draft"
    };

    public string BadgeText => Status;
}

public sealed class SoPdfLineItem
{
    public int Index { get; set; }
    public string ProductName { get; set; } = "";
    public string HsnCode { get; set; } = "";
    public string Quantity { get; set; } = "";
    public string Uom { get; set; } = "";
    public string Rate { get; set; } = "";
    public string DiscountAmount { get; set; } = "";
    public string TaxAmount { get; set; } = "";
    public string Total { get; set; } = "";
}

public sealed class SoPdfAddition
{
    public string Name { get; set; } = "";
    public string Amount { get; set; } = "";
    public bool IsDeduction { get; set; }
}
