using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using PurchaseInvoiceStatus = backend.Features.Transactions.PurchaseInvoices.PurchaseInvoiceStatus;

namespace backend.Features.Reports.ReceivablesPayables;

internal static class BillWisePayablesHandlers
{
    internal static async Task<IResult> GetAsync(
        DateOnly? asOfDate,
        Guid? vendorId,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var effectiveAsOf = asOfDate ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var query = dbContext.PurchaseInvoices
            .AsNoTracking()
            .Where(i => i.Status != PurchaseInvoiceStatus.Cancelled && i.FinancialDetails.Balance > 0);

        if (vendorId is not null)
        {
            query = query.Where(i => i.VendorInformation.VendorId == vendorId.Value);
        }

        var invoices = await query
            .OrderBy(i => i.Document.DueDate)
            .Select(i => new InvoiceProjection(
                i.Id,
                i.Document.Date,
                i.Document.DueDate,
                i.Document.No,
                i.SourceRef.ReferenceNo,
                i.VendorInformation.VendorId,
                i.VendorInformation.VendorNameSnapshot,
                i.Footer.NetTotal,
                i.FinancialDetails.Balance,
                i.Status))
            .ToListAsync(cancellationToken);

        var rows = invoices
            .Select(inv => new BillWiseRowDto(
                inv.Id,
                inv.Date,
                inv.DueDate,
                inv.No,
                inv.ReferenceNo,
                inv.PartyId,
                inv.PartyName,
                Round(inv.NetTotal),
                Round(inv.NetTotal - inv.Balance),
                Round(inv.Balance),
                Math.Max(0, effectiveAsOf.DayNumber - inv.DueDate.DayNumber),
                ToStatusLabel(inv.Status)))
            .ToList();

        var totals = new BillWiseTotalsDto(
            rows.Sum(r => r.InvoiceAmount),
            rows.Sum(r => r.PaidAmount),
            rows.Sum(r => r.BalanceAmount));

        var report = new BillWiseReportDto(effectiveAsOf, totals, rows);

        return TypedResults.Ok(new ApiResponse<BillWiseReportDto>(
            true, "Bill-wise payables fetched successfully.", report));
    }

    private static decimal Round(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private static string ToStatusLabel(PurchaseInvoiceStatus value) => value switch
    {
        PurchaseInvoiceStatus.Submitted => "Submitted",
        PurchaseInvoiceStatus.Cancelled => "Cancelled",
        _ => "Draft"
    };

    private sealed record InvoiceProjection(
        Guid Id,
        DateOnly Date,
        DateOnly DueDate,
        string No,
        string? ReferenceNo,
        Guid PartyId,
        string PartyName,
        decimal NetTotal,
        decimal Balance,
        PurchaseInvoiceStatus Status);
}
