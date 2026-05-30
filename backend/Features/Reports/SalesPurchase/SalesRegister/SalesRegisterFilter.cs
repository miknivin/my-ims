using backend.Infrastructure.Filtering;

namespace backend.Features.Reports.SalesPurchase.SalesRegister;

public sealed class SalesRegisterFilter : PagedFilter
{
    public DateOnly? FromDate { get; set; }

    public DateOnly? ToDate { get; set; }

    public Guid? CustomerId { get; set; }

    public string? Status { get; set; }
}
