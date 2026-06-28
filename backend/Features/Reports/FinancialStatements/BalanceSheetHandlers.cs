using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Reports.FinancialStatements;

internal static class BalanceSheetHandlers
{
    internal static async Task<IResult> GetAsync(
        DateOnly? fromDate,
        DateOnly? asOfDate,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var effectiveAsOf  = asOfDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var effectiveFrom  = fromDate ?? new DateOnly(effectiveAsOf.Year, 1, 1);

        // Cumulative B/S balances up to (and including) asOfDate
        var cumulativeList = await dbContext.JournalEntries
            .AsNoTracking()
            .Where(je => je.PostingDate <= effectiveAsOf)
            .GroupBy(je => je.LedgerId)
            .Select(g => new LedgerBalance(
                g.Key,
                g.Sum(je => je.DebitAmount),
                g.Sum(je => je.CreditAmount)))
            .ToListAsync(cancellationToken);

        // P&L movements for the period — used to derive NetProfit
        var plList = await dbContext.JournalEntries
            .AsNoTracking()
            .Where(je => je.PostingDate >= effectiveFrom && je.PostingDate <= effectiveAsOf)
            .GroupBy(je => je.LedgerId)
            .Select(g => new LedgerBalance(
                g.Key,
                g.Sum(je => je.DebitAmount),
                g.Sum(je => je.CreditAmount)))
            .ToListAsync(cancellationToken);

        var allIds = cumulativeList.Select(x => x.LedgerId)
            .Union(plList.Select(x => x.LedgerId))
            .ToList();

        var ledgers = await dbContext.Ledgers
            .AsNoTracking()
            .Include(l => l.LedgerGroup)
            .Where(l => allIds.Contains(l.Id))
            .ToListAsync(cancellationToken);

        var balanceByLedger = cumulativeList.ToDictionary(x => x.LedgerId);
        var plByLedger      = plList.ToDictionary(x => x.LedgerId);

        var assetGroups     = BuildGroups(
            ledgers.Where(l => l.LedgerGroup?.Nature == LedgerGroupNatures.Asset),
            balanceByLedger, isDebitNature: true);

        var liabilityGroups = BuildGroups(
            ledgers.Where(l => l.LedgerGroup?.Nature == LedgerGroupNatures.Liability),
            balanceByLedger, isDebitNature: false);

        var equityGroups    = BuildGroups(
            ledgers.Where(l => l.LedgerGroup?.Nature == LedgerGroupNatures.Equity),
            balanceByLedger, isDebitNature: false);

        // NetProfit = Income(Cr-Dr) – Expense(Dr-Cr) for the stated period
        decimal netProfit = 0;
        foreach (var ledger in ledgers)
        {
            if (!plByLedger.TryGetValue(ledger.Id, out var pl)) continue;
            if (ledger.LedgerGroup?.Nature == LedgerGroupNatures.Income)
                netProfit += pl.Cr - pl.Dr;
            else if (ledger.LedgerGroup?.Nature == LedgerGroupNatures.Expense)
                netProfit -= pl.Dr - pl.Cr;
        }
        netProfit = Round(netProfit);

        var totalAssets      = Round(assetGroups.Sum(g => g.Total));
        var totalLiabilities = Round(liabilityGroups.Sum(g => g.Total));
        var totalEquity      = Round(equityGroups.Sum(g => g.Total));

        var report = new BalanceSheetDto(
            effectiveFrom, effectiveAsOf,
            totalAssets, totalLiabilities, totalEquity, netProfit,
            assetGroups, liabilityGroups, equityGroups);

        return TypedResults.Ok(new ApiResponse<BalanceSheetDto>(
            true, "Balance sheet fetched successfully.", report));
    }

    private static IReadOnlyList<BalanceSheetGroupDto> BuildGroups(
        IEnumerable<Ledger> ledgers,
        IReadOnlyDictionary<Guid, LedgerBalance> balanceByLedger,
        bool isDebitNature)
    {
        var result = new List<BalanceSheetGroupDto>();

        foreach (var group in ledgers
            .GroupBy(l => new { l.LedgerGroupId, GroupName = l.LedgerGroup?.Name ?? string.Empty })
            .OrderBy(g => g.Key.GroupName))
        {
            var lines = new List<BalanceSheetLineDto>();

            foreach (var ledger in group.OrderBy(l => l.Name))
            {
                balanceByLedger.TryGetValue(ledger.Id, out var bal);
                var dr = bal?.Dr ?? 0;
                var cr = bal?.Cr ?? 0;

                // Debit-nature (Asset): balance = Dr – Cr
                // Credit-nature (Liability/Equity): balance = Cr – Dr
                var balance = isDebitNature ? Round(dr - cr) : Round(cr - dr);

                if (balance == 0) continue;

                lines.Add(new BalanceSheetLineDto(ledger.Id, ledger.Code, ledger.Name, balance));
            }

            if (lines.Count == 0) continue;

            result.Add(new BalanceSheetGroupDto(
                group.Key.LedgerGroupId,
                group.Key.GroupName,
                Round(lines.Sum(l => l.Balance)),
                lines));
        }

        return result;
    }

    private static decimal Round(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private sealed record LedgerBalance(Guid LedgerId, decimal Dr, decimal Cr);
}
