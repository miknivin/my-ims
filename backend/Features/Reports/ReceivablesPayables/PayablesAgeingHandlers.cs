using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using PurchaseInvoiceStatus = backend.Features.Transactions.PurchaseInvoices.PurchaseInvoiceStatus;

namespace backend.Features.Reports.ReceivablesPayables;

internal static class PayablesAgeingHandlers
{
    internal static async Task<IResult> GetAsync(
        DateOnly? asOfDate,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var effectiveAsOf = asOfDate ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var bills = await dbContext.PurchaseInvoices
            .AsNoTracking()
            .Where(i => i.Status != PurchaseInvoiceStatus.Cancelled && i.FinancialDetails.Balance > 0)
            .Select(i => new OutstandingBill(
                i.VendorInformation.VendorId,
                i.VendorInformation.VendorNameSnapshot,
                i.Document.DueDate,
                i.FinancialDetails.Balance))
            .ToListAsync(cancellationToken);

        var rows = bills
            .GroupBy(b => new { b.PartyId, b.PartyName })
            .Select(g => new AgeingRowDto(g.Key.PartyId, g.Key.PartyName, BuildBuckets(g, effectiveAsOf)))
            .OrderByDescending(r => r.Buckets.Total)
            .ToList();

        var totals = BuildBuckets(bills, effectiveAsOf);
        var report = new AgeingReportDto(effectiveAsOf, totals, rows);

        return TypedResults.Ok(new ApiResponse<AgeingReportDto>(
            true, "Payables ageing fetched successfully.", report));
    }

    private static AgeingBucketsDto BuildBuckets(IEnumerable<OutstandingBill> bills, DateOnly asOfDate)
    {
        decimal current = 0, d30 = 0, d60 = 0, d90 = 0, over90 = 0;

        foreach (var bill in bills)
        {
            var overdueDays = asOfDate.DayNumber - bill.DueDate.DayNumber;
            if (overdueDays <= 0) current += bill.Balance;
            else if (overdueDays <= 30) d30 += bill.Balance;
            else if (overdueDays <= 60) d60 += bill.Balance;
            else if (overdueDays <= 90) d90 += bill.Balance;
            else over90 += bill.Balance;
        }

        return new AgeingBucketsDto(
            Round(current), Round(d30), Round(d60), Round(d90), Round(over90),
            Round(current + d30 + d60 + d90 + over90));
    }

    private static decimal Round(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private sealed record OutstandingBill(Guid PartyId, string PartyName, DateOnly DueDate, decimal Balance);
}
