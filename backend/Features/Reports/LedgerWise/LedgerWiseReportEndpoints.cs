using backend.Features.Accounting.Journals;
using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Reports.LedgerWise;

public static class LedgerWiseReportEndpoints
{
    public static IEndpointRouteBuilder MapLedgerWiseReportEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reports/ledger-wise").WithTags("Ledger-wise Reports");

        group.MapGet("/", GetAsync);

        return app;
    }

    private static async Task<IResult> GetAsync(
        Guid ledgerId,
        DateOnly? fromDate,
        DateOnly? toDate,
        string? subLedgerType,
        Guid? subLedgerId,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (ledgerId == Guid.Empty)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "Ledger is required.", null));
        }

        if (fromDate is null || toDate is null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "From date and to date are required.", null));
        }

        if (fromDate > toDate)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "From date cannot be greater than to date.", null));
        }

        var parsedSubLedgerType = ParseSubLedgerType(subLedgerType);
        if (subLedgerType is not null && parsedSubLedgerType is null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "Sub-ledger type must be either Customer or Vendor.", null));
        }

        if (subLedgerId is not null && parsedSubLedgerType is null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "Sub-ledger type is required when sub-ledger id is provided.", null));
        }

        var ledger = await dbContext.Ledgers
            .AsNoTracking()
            .FirstOrDefaultAsync(current => current.Id == ledgerId, cancellationToken);
        if (ledger is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Ledger not found.", null));
        }

        var baseQuery = dbContext.JournalEntries
            .AsNoTracking()
            .Where(current => current.LedgerId == ledgerId);

        if (parsedSubLedgerType is not null)
        {
            baseQuery = baseQuery.Where(current => current.SubLedgerType == parsedSubLedgerType);
        }

        if (subLedgerId is not null)
        {
            baseQuery = baseQuery.Where(current => current.SubLedgerId == subLedgerId.Value);
        }

        var openingBalance = await baseQuery
            .Where(current => current.PostingDate < fromDate.Value)
            .Select(current => current.DebitAmount - current.CreditAmount)
            .DefaultIfEmpty(0)
            .SumAsync(cancellationToken);

        var periodRows = await baseQuery
            .Where(current => current.PostingDate >= fromDate.Value && current.PostingDate <= toDate.Value)
            .OrderBy(current => current.PostingDate)
            .ThenBy(current => current.Id)
            .Select(current => new LedgerWiseProjection(
                current.Id,
                current.PostingDate,
                current.VoucherType,
                current.VoucherNo,
                current.Narration,
                current.SubLedgerType,
                current.SubLedgerId,
                current.SubLedgerCodeSnapshot,
                current.SubLedgerNameSnapshot,
                current.DebitAmount,
                current.CreditAmount))
            .ToListAsync(cancellationToken);

        var runningBalance = openingBalance;
        var rows = new List<LedgerWiseReportRowDto>(periodRows.Count);
        foreach (var row in periodRows)
        {
            runningBalance += row.DebitAmount - row.CreditAmount;

            rows.Add(new LedgerWiseReportRowDto(
                row.Id,
                row.PostingDate,
                ToVoucherTypeLabel(row.VoucherType),
                row.VoucherNo,
                row.Narration,
                row.SubLedgerType is null ? null : ToSubLedgerTypeLabel(row.SubLedgerType.Value),
                row.SubLedgerId,
                row.SubLedgerCodeSnapshot,
                row.SubLedgerNameSnapshot,
                row.DebitAmount,
                row.CreditAmount,
                runningBalance));
        }

        var report = new LedgerWiseReportDto(
            ledger.Id,
            ledger.Code,
            ledger.Name,
            fromDate.Value,
            toDate.Value,
            parsedSubLedgerType is null ? null : ToSubLedgerTypeLabel(parsedSubLedgerType.Value),
            subLedgerId,
            openingBalance,
            runningBalance,
            rows);

        return TypedResults.Ok(new ApiResponse<LedgerWiseReportDto>(
            true,
            "Ledger-wise report fetched successfully.",
            report));
    }

    private static SubLedgerType? ParseSubLedgerType(string? value) => value?.Trim() switch
    {
        "Customer" => SubLedgerType.Customer,
        "Vendor" => SubLedgerType.Vendor,
        _ => null
    };

    private static string ToSubLedgerTypeLabel(SubLedgerType value) => value switch
    {
        SubLedgerType.Vendor => "Vendor",
        _ => "Customer"
    };

    private static string ToVoucherTypeLabel(JournalVoucherType value) => value switch
    {
        JournalVoucherType.ManualJournal => "MJ",
        JournalVoucherType.OpeningBalance => "OB",
        JournalVoucherType.SalesInvoice => "SI",
        JournalVoucherType.PurchaseInvoice => "PI",
        JournalVoucherType.SalesCreditNote => "SCN",
        JournalVoucherType.SalesDebitNote => "SDN",
        JournalVoucherType.PurchaseCreditNote => "PCN",
        JournalVoucherType.PurchaseDebitNote => "PDN",
        JournalVoucherType.BillWiseReceipt => "BWR",
        JournalVoucherType.BillWisePayment => "BWP",
        JournalVoucherType.GoodsReceiptNote => "GRN",
        _ => value.ToString()
    };

    private sealed record LedgerWiseProjection(
        Guid Id,
        DateOnly PostingDate,
        JournalVoucherType VoucherType,
        string VoucherNo,
        string? Narration,
        SubLedgerType? SubLedgerType,
        Guid? SubLedgerId,
        string? SubLedgerCodeSnapshot,
        string? SubLedgerNameSnapshot,
        decimal DebitAmount,
        decimal CreditAmount);
}
