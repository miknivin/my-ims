using backend.Features.Masters.Ledgers;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Persistence;

public static class SystemLedgerSeeder
{
    public const string OpeningBalanceEquityCode = "SYS-OBE";
    public const string OpeningBalanceEquityName = "Opening Balance Equity";

    private const string OpeningBalancesGroupCode = "SYS-OBG";
    private const string OpeningBalancesGroupName = "Opening Balances";

    public static async Task SeedAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var groupExists = await dbContext.LedgerGroups.AnyAsync(
            g => g.Code == OpeningBalancesGroupCode, cancellationToken);

        if (groupExists)
            return;

        var now = DateTime.UtcNow;

        var group = new LedgerGroup
        {
            Code = OpeningBalancesGroupCode,
            Name = OpeningBalancesGroupName,
            Nature = LedgerGroupNatures.Equity,
            Status = LedgerGroupStatuses.Active,
            IsSystem = true,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        var ledger = new Ledger
        {
            Code = OpeningBalanceEquityCode,
            Name = OpeningBalanceEquityName,
            LedgerGroup = group,
            Status = LedgerStatuses.Active,
            IsSystem = true,
            AllowManualPosting = false,
            IsBillWise = false,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.LedgerGroups.Add(group);
        dbContext.Ledgers.Add(ledger);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
