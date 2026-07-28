using backend.Infrastructure.Filtering;

namespace backend.Features.Transactions.PurchaseOrders;

public sealed class PurchaseOrderFilter : PagedFilter
{
    public DateOnly? FromDate { get; set; }

    public DateOnly? ToDate { get; set; }

    public Guid? VendorId { get; set; }

    public string? Status { get; set; }

    public string? Statuses { get; set; }
}
