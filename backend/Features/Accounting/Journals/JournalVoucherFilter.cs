using backend.Infrastructure.Filtering;

namespace backend.Features.Accounting.Journals;

public sealed class JournalVoucherFilter : PagedFilter
{
    public DateOnly? FromDate { get; set; }

    public DateOnly? ToDate { get; set; }

    public string? Status { get; set; }

    public string? Source { get; set; }
}
