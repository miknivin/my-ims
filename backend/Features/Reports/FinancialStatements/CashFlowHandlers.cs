using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using SubLedgerType = backend.Features.Accounting.Journals.SubLedgerType;

namespace backend.Features.Reports.FinancialStatements;

internal static class CashFlowHandlers
{
    internal static async Task<IResult> GetAsync(
        DateOnly? fromDate,
        DateOnly? toDate,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (fromDate is null || toDate is null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(
                false, "From date and to date are required.", null));
        }

        if (fromDate > toDate)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(
                false, "From date cannot be greater than to date.", null));
        }

        // Net Profit: Income/Expense movements in period
        var plList = await dbContext.JournalEntries
            .AsNoTracking()
            .Where(je => je.PostingDate >= fromDate.Value && je.PostingDate <= toDate.Value)
            .GroupBy(je => je.LedgerId)
            .Select(g => new LedgerMovement(g.Key, g.Sum(je => je.DebitAmount), g.Sum(je => je.CreditAmount)))
            .ToListAsync(cancellationToken);

        var plLedgerIds = plList.Select(x => x.LedgerId).ToList();

        var plNatures = await dbContext.Ledgers
            .AsNoTracking()
            .Where(l => plLedgerIds.Contains(l.Id) &&
                        (l.LedgerGroup!.Nature == LedgerGroupNatures.Income ||
                         l.LedgerGroup!.Nature == LedgerGroupNatures.Expense))
            .Select(l => new { l.Id, l.LedgerGroup!.Nature })
            .ToListAsync(cancellationToken);

        var plByLedger = plList.ToDictionary(x => x.LedgerId);
        decimal netProfit = 0;
        foreach (var l in plNatures)
        {
            if (!plByLedger.TryGetValue(l.Id, out var mv)) continue;
            if (l.Nature == LedgerGroupNatures.Income)
                netProfit += mv.Cr - mv.Dr;
            else if (l.Nature == LedgerGroupNatures.Expense)
                netProfit -= mv.Dr - mv.Cr;
        }
        netProfit = Round(netProfit);

        // A/R change via Customer sub-ledger entries in period
        // Cash impact = Cr – Dr: negative means A/R grew (cash tied up); positive means collections exceeded new sales
        var arAgg = await dbContext.JournalEntries
            .AsNoTracking()
            .Where(je => je.PostingDate >= fromDate.Value && je.PostingDate <= toDate.Value
                         && je.SubLedgerType == SubLedgerType.Customer)
            .GroupBy(je => 1)
            .Select(g => new { Dr = g.Sum(je => je.DebitAmount), Cr = g.Sum(je => je.CreditAmount) })
            .FirstOrDefaultAsync(cancellationToken);

        // A/P change via Vendor sub-ledger entries in period
        // Cash impact = Cr – Dr: positive means payables grew (supplier financing); negative means net payments made
        var apAgg = await dbContext.JournalEntries
            .AsNoTracking()
            .Where(je => je.PostingDate >= fromDate.Value && je.PostingDate <= toDate.Value
                         && je.SubLedgerType == SubLedgerType.Vendor)
            .GroupBy(je => 1)
            .Select(g => new { Dr = g.Sum(je => je.DebitAmount), Cr = g.Sum(je => je.CreditAmount) })
            .FirstOrDefaultAsync(cancellationToken);

        var arChange = Round((arAgg?.Cr ?? 0) - (arAgg?.Dr ?? 0));
        var apChange = Round((apAgg?.Cr ?? 0) - (apAgg?.Dr ?? 0));

        var netCash = Round(netProfit + arChange + apChange);

        var report = new CashFlowDto(
            fromDate.Value, toDate.Value,
            netProfit, arChange, apChange, netCash);

        return TypedResults.Ok(new ApiResponse<CashFlowDto>(
            true, "Cash flow fetched successfully.", report));
    }

    private static decimal Round(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private sealed record LedgerMovement(Guid LedgerId, decimal Dr, decimal Cr);
}
