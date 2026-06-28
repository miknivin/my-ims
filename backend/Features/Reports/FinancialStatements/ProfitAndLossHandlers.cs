using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Reports.FinancialStatements;

internal static class ProfitAndLossHandlers
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

        var periodList = await dbContext.JournalEntries
            .AsNoTracking()
            .Where(je => je.PostingDate >= fromDate.Value && je.PostingDate <= toDate.Value)
            .GroupBy(je => je.LedgerId)
            .Select(g => new LedgerMovement(g.Key, g.Sum(je => je.DebitAmount), g.Sum(je => je.CreditAmount)))
            .ToListAsync(cancellationToken);

        var ledgerIds = periodList.Select(x => x.LedgerId).ToList();

        var ledgers = await dbContext.Ledgers
            .AsNoTracking()
            .Include(l => l.LedgerGroup)
            .Where(l => ledgerIds.Contains(l.Id) &&
                        (l.LedgerGroup!.Nature == LedgerGroupNatures.Income ||
                         l.LedgerGroup!.Nature == LedgerGroupNatures.Expense))
            .ToListAsync(cancellationToken);

        var movementByLedger = periodList.ToDictionary(x => x.LedgerId);

        var incomeGroups = BuildGroups(
            ledgers.Where(l => l.LedgerGroup?.Nature == LedgerGroupNatures.Income),
            movementByLedger,
            isIncome: true);

        var expenseGroups = BuildGroups(
            ledgers.Where(l => l.LedgerGroup?.Nature == LedgerGroupNatures.Expense),
            movementByLedger,
            isIncome: false);

        var totalIncome  = Round(incomeGroups.Sum(g => g.Total));
        var totalExpense = Round(expenseGroups.Sum(g => g.Total));
        var netProfit    = Round(totalIncome - totalExpense);

        var report = new ProfitAndLossDto(
            fromDate.Value, toDate.Value,
            totalIncome, totalExpense, netProfit,
            incomeGroups, expenseGroups);

        return TypedResults.Ok(new ApiResponse<ProfitAndLossDto>(
            true, "Profit and loss fetched successfully.", report));
    }

    private static IReadOnlyList<ProfitAndLossGroupDto> BuildGroups(
        IEnumerable<Ledger> ledgers,
        IReadOnlyDictionary<Guid, LedgerMovement> movementByLedger,
        bool isIncome)
    {
        var result = new List<ProfitAndLossGroupDto>();

        foreach (var group in ledgers
            .GroupBy(l => new { l.LedgerGroupId, GroupName = l.LedgerGroup?.Name ?? string.Empty })
            .OrderBy(g => g.Key.GroupName))
        {
            var lines = new List<ProfitAndLossLineDto>();

            foreach (var ledger in group.OrderBy(l => l.Name))
            {
                movementByLedger.TryGetValue(ledger.Id, out var mv);
                var dr = mv?.Dr ?? 0;
                var cr = mv?.Cr ?? 0;

                // Income: net credit is revenue. Expense: net debit is cost.
                var amount = isIncome ? Round(cr - dr) : Round(dr - cr);

                if (amount == 0) continue;

                lines.Add(new ProfitAndLossLineDto(ledger.Id, ledger.Code, ledger.Name, amount));
            }

            if (lines.Count == 0) continue;

            result.Add(new ProfitAndLossGroupDto(
                group.Key.LedgerGroupId,
                group.Key.GroupName,
                Round(lines.Sum(l => l.Amount)),
                lines));
        }

        return result;
    }

    private static decimal Round(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private sealed record LedgerMovement(Guid LedgerId, decimal Dr, decimal Cr);
}
