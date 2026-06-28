using backend.Infrastructure.Filtering;

namespace backend.Features.Reports.SalesPurchase.PurchaseRegister;

public sealed class PurchaseRegisterFilter : PagedFilter
{
    public DateOnly? FromDate { get; set; }

    public DateOnly? ToDate { get; set; }

    public Guid? VendorId { get; set; }

    public string? Status { get; set; }
}
