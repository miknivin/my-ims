using backend.Features.Masters.Ledgers;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Persistence;

public static class AccountingLedgerSeeder
{
    // Ledger group codes
    private const string IndirectExpensesGroupCode = "SYS-IEXP";
    private const string IndirectIncomeGroupCode = "SYS-IINC";
    private const string InventoryGroupCode = "SYS-INVG";
    private const string DutiesAndTaxesGroupCode = "SYS-DTAX";
    private const string ProvisionsAndClearingGroupCode = "SYS-PROV";
    private const string DirectExpensesGroupCode = "DIRECT-EXP"; // already exists

    // Ledger codes — public so journal posting code can reference them
    public const string DiscountAllowedCode = "SYS-DAL";
    public const string DiscountReceivedCode = "SYS-DRL";
    public const string StockInHandCode = "SYS-INV";
    public const string CostOfGoodsSoldCode = "SYS-COGS";
    public const string InputTaxCode = "SYS-ITAX";
    public const string OutputTaxCode = "SYS-OTAX";
    public const string GrnClearingCode = "SYS-GCL";
    public const string PurchaseAdditionsCode = "SYS-PADD";
    public const string PurchaseDiscountCode = "SYS-PDSC";
    public const string RoundOffCode = "SYS-ROFF";

    public static async Task SeedAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Skip if already seeded
        if (await dbContext.Ledgers.AnyAsync(l => l.Code == StockInHandCode, cancellationToken))
            return;

        var now = DateTime.UtcNow;

        // ── Ledger Groups ──────────────────────────────────────────────────────

        var indirectExpenses = await GetOrCreateGroupAsync(dbContext, IndirectExpensesGroupCode,
            "Indirect Expenses", LedgerGroupNatures.Expense, now, cancellationToken);

        var indirectIncome = await GetOrCreateGroupAsync(dbContext, IndirectIncomeGroupCode,
            "Indirect Income", LedgerGroupNatures.Income, now, cancellationToken);

        var inventoryGroup = await GetOrCreateGroupAsync(dbContext, InventoryGroupCode,
            "Stock in Hand", LedgerGroupNatures.Asset, now, cancellationToken);

        var dutiesAndTaxes = await GetOrCreateGroupAsync(dbContext, DutiesAndTaxesGroupCode,
            "Duties & Taxes", LedgerGroupNatures.Liability, now, cancellationToken);

        var provisionsAndClearing = await GetOrCreateGroupAsync(dbContext, ProvisionsAndClearingGroupCode,
            "Provisions & Clearing", LedgerGroupNatures.Liability, now, cancellationToken);

        var directExpenses = await dbContext.LedgerGroups
            .FirstAsync(g => g.Code == DirectExpensesGroupCode, cancellationToken);

        // ── Ledgers ────────────────────────────────────────────────────────────

        var ledgers = new[]
        {
            MakeLedger(DiscountAllowedCode,    "Discount Allowed",       indirectExpenses,      now),
            MakeLedger(DiscountReceivedCode,   "Discount Received",      indirectIncome,        now),
            MakeLedger(StockInHandCode,        "Stock in Hand",          inventoryGroup,        now),
            MakeLedger(CostOfGoodsSoldCode,    "Cost of Goods Sold",     directExpenses,        now),
            MakeLedger(InputTaxCode,           "Input Tax (GST)",        dutiesAndTaxes,        now),
            MakeLedger(OutputTaxCode,          "Output Tax (GST)",       dutiesAndTaxes,        now),
            MakeLedger(GrnClearingCode,        "GRN Clearing Account",   provisionsAndClearing, now),
            MakeLedger(PurchaseAdditionsCode,  "Purchase Additions",     directExpenses,        now),
            MakeLedger(PurchaseDiscountCode,   "Purchase Discount",      indirectIncome,        now),
            MakeLedger(RoundOffCode,           "Round-Off",              indirectExpenses,      now),
        };

        dbContext.Ledgers.AddRange(ledgers);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static async Task<LedgerGroup> GetOrCreateGroupAsync(
        AppDbContext dbContext,
        string code,
        string name,
        string nature,
        DateTime now,
        CancellationToken cancellationToken)
    {
        var existing = await dbContext.LedgerGroups
            .FirstOrDefaultAsync(g => g.Code == code, cancellationToken);

        if (existing is not null)
            return existing;

        var group = new LedgerGroup
        {
            Code = code,
            Name = name,
            Nature = nature,
            Status = LedgerGroupStatuses.Active,
            IsSystem = true,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.LedgerGroups.Add(group);
        return group;
    }

    private static Ledger MakeLedger(string code, string name, LedgerGroup group, DateTime now) =>
        new()
        {
            Code = code,
            Name = name,
            LedgerGroup = group,
            Status = LedgerStatuses.Active,
            IsSystem = true,
            AllowManualPosting = false,
            IsBillWise = false,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };
}
