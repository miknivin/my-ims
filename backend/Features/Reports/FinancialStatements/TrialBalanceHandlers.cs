using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Reports.FinancialStatements;

internal static class TrialBalanceHandlers
{
    internal static async Task<IResult> GetAsync(
        DateOnly? fromDate,
        DateOnly? toDate,
        bool? showZeroBalances,
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

        // Sum debits and credits per ledger before the period (opening balance)
        var openingList = await dbContext.JournalEntries
            .AsNoTracking()
            .Where(je => je.PostingDate < fromDate.Value)
            .GroupBy(je => je.LedgerId)
            .Select(g => new { LedgerId = g.Key, Dr = g.Sum(je => je.DebitAmount), Cr = g.Sum(je => je.CreditAmount) })
            .ToListAsync(cancellationToken);

        // Sum debits and credits per ledger within the period
        var periodList = await dbContext.JournalEntries
            .AsNoTracking()
            .Where(je => je.PostingDate >= fromDate.Value && je.PostingDate <= toDate.Value)
            .GroupBy(je => je.LedgerId)
            .Select(g => new { LedgerId = g.Key, Dr = g.Sum(je => je.DebitAmount), Cr = g.Sum(je => je.CreditAmount) })
            .ToListAsync(cancellationToken);

        var openingByLedger = openingList.ToDictionary(x => x.LedgerId);
        var periodByLedger = periodList.ToDictionary(x => x.LedgerId);

        var allLedgerIds = openingByLedger.Keys
            .Union(periodByLedger.Keys)
            .ToList();

        if (allLedgerIds.Count == 0)
        {
            var empty = new TrialBalanceDto(
                fromDate.Value, toDate.Value,
                new TrialBalanceTotalsDto(0, 0, 0, 0, 0, 0),
                []);
            return TypedResults.Ok(new ApiResponse<TrialBalanceDto>(
                true, "Trial balance fetched successfully.", empty));
        }

        var ledgers = await dbContext.Ledgers
            .AsNoTracking()
            .Include(l => l.LedgerGroup)
            .Where(l => allLedgerIds.Contains(l.Id))
            .ToListAsync(cancellationToken);

        var includeZero = showZeroBalances == true;
        var rows = new List<TrialBalanceRowDto>();

        foreach (var ledger in ledgers
            .OrderBy(l => l.LedgerGroup?.Nature)
            .ThenBy(l => l.LedgerGroup?.Name)
            .ThenBy(l => l.Name))
        {
            openingByLedger.TryGetValue(ledger.Id, out var opening);
            periodByLedger.TryGetValue(ledger.Id, out var period);

            var openingDr = Round(opening?.Dr ?? 0);
            var openingCr = Round(opening?.Cr ?? 0);
            var periodDr  = Round(period?.Dr ?? 0);
            var periodCr  = Round(period?.Cr ?? 0);

            if (!includeZero && openingDr == 0 && openingCr == 0 && periodDr == 0 && periodCr == 0)
                continue;

            var openingNet = openingDr - openingCr;
            var closingNet = openingNet + periodDr - periodCr;

            var closingDr = closingNet > 0 ? closingNet : 0;
            var closingCr = closingNet < 0 ? Math.Abs(closingNet) : 0;

            rows.Add(new TrialBalanceRowDto(
                ledger.Id,
                ledger.Code,
                ledger.Name,
                ledger.LedgerGroupId,
                ledger.LedgerGroup?.Name ?? string.Empty,
                ledger.LedgerGroup?.Nature ?? string.Empty,
                openingDr,
                openingCr,
                periodDr,
                periodCr,
                closingDr,
                closingCr));
        }

        var totals = new TrialBalanceTotalsDto(
            rows.Sum(r => r.OpeningDebit),
            rows.Sum(r => r.OpeningCredit),
            rows.Sum(r => r.PeriodDebit),
            rows.Sum(r => r.PeriodCredit),
            rows.Sum(r => r.ClosingDebit),
            rows.Sum(r => r.ClosingCredit));

        var report = new TrialBalanceDto(fromDate.Value, toDate.Value, totals, rows);

        return TypedResults.Ok(new ApiResponse<TrialBalanceDto>(
            true, "Trial balance fetched successfully.", report));
    }

    private static decimal Round(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
