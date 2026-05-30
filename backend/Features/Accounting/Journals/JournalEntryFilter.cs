using backend.Infrastructure.Filtering;

namespace backend.Features.Accounting.Journals;

public sealed class JournalEntryFilter : PagedFilter
{
    public DateOnly? FromDate { get; set; }

    public DateOnly? ToDate { get; set; }

    public Guid? LedgerId { get; set; }

    public string? Source { get; set; }

    public string? Status { get; set; }
}
