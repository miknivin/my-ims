using backend.Features.Masters.Customers;
using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Vendors;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Accounting.Journals;

internal static class TransactionJournalPostingSupport
{
    public static async Task<TransactionAccountingSettingsResult> LoadAccountingSettingsAsync(
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var settings = await dbContext.Settings
            .AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);
        if (settings is null)
        {
            return TransactionAccountingSettingsResult.Invalid(
                "Configure accounting settings before posting journals.");
        }

        var accounting = settings.AccountingSettings;
        var ledgerIds = new[]
        {
            accounting.InventoryLedgerId,
            accounting.SalesLedgerId,
            accounting.CostOfGoodsSoldLedgerId,
            accounting.GrnClearingLedgerId,
            accounting.PurchaseTaxLedgerId,
            accounting.SalesTaxLedgerId,
            accounting.DefaultCashLedgerId,
            accounting.GrnAdditionLedgerId,
            accounting.GrnDiscountLedgerId,
            accounting.RoundOffLedgerId
        }
        .Where(current => current is not null && current != Guid.Empty)
        .Select(current => current!.Value)
        .Distinct()
        .ToList();

        var ledgers = await dbContext.Ledgers
            .Include(current => current.LedgerGroup)
            .Where(current => ledgerIds.Contains(current.Id))
            .ToDictionaryAsync(current => current.Id, cancellationToken);

        var inventoryLedger = GetConfiguredLedger(
            ledgers,
            accounting.InventoryLedgerId,
            "inventory",
            LedgerGroupNatures.Asset);
        if (inventoryLedger.Error is not null)
        {
            return TransactionAccountingSettingsResult.Invalid(inventoryLedger.Error);
        }

        var salesLedger = GetConfiguredLedger(
            ledgers,
            accounting.SalesLedgerId,
            "sales",
            LedgerGroupNatures.Income);
        if (salesLedger.Error is not null)
        {
            return TransactionAccountingSettingsResult.Invalid(salesLedger.Error);
        }

        var costOfGoodsSoldLedger = GetConfiguredLedger(
            ledgers,
            accounting.CostOfGoodsSoldLedgerId,
            "cost of goods sold",
            LedgerGroupNatures.Expense);
        if (costOfGoodsSoldLedger.Error is not null)
        {
            return TransactionAccountingSettingsResult.Invalid(costOfGoodsSoldLedger.Error);
        }

        var grnClearingLedger = GetConfiguredLedger(
            ledgers,
            accounting.GrnClearingLedgerId,
            "GRN clearing",
            LedgerGroupNatures.Liability);
        if (grnClearingLedger.Error is not null)
        {
            return TransactionAccountingSettingsResult.Invalid(grnClearingLedger.Error);
        }

        var purchaseTaxLedger = GetConfiguredLedger(
            ledgers,
            accounting.PurchaseTaxLedgerId,
            "purchase tax",
            LedgerGroupNatures.Asset);
        if (purchaseTaxLedger.Error is not null)
        {
            return TransactionAccountingSettingsResult.Invalid(purchaseTaxLedger.Error);
        }

        var salesTaxLedger = GetConfiguredLedger(
            ledgers,
            accounting.SalesTaxLedgerId,
            "sales tax",
            LedgerGroupNatures.Liability);
        if (salesTaxLedger.Error is not null)
        {
            return TransactionAccountingSettingsResult.Invalid(salesTaxLedger.Error);
        }

        var defaultCashLedger = GetConfiguredLedger(
            ledgers,
            accounting.DefaultCashLedgerId,
            "default cash",
            LedgerGroupNatures.Asset);
        if (defaultCashLedger.Error is not null)
        {
            return TransactionAccountingSettingsResult.Invalid(defaultCashLedger.Error);
        }

        var grnAdditionLedger = GetConfiguredLedger(
            ledgers,
            accounting.GrnAdditionLedgerId,
            "GRN addition");
        if (grnAdditionLedger.Error is not null)
        {
            return TransactionAccountingSettingsResult.Invalid(grnAdditionLedger.Error);
        }

        var grnDiscountLedger = GetConfiguredLedger(
            ledgers,
            accounting.GrnDiscountLedgerId,
            "GRN discount");
        if (grnDiscountLedger.Error is not null)
        {
            return TransactionAccountingSettingsResult.Invalid(grnDiscountLedger.Error);
        }

        var roundOffLedger = GetConfiguredLedger(
            ledgers,
            accounting.RoundOffLedgerId,
            "round-off");
        if (roundOffLedger.Error is not null)
        {
            return TransactionAccountingSettingsResult.Invalid(roundOffLedger.Error);
        }

        return TransactionAccountingSettingsResult.Valid(
            new TransactionAccountingSettings(
                inventoryLedger.Ledger!,
                salesLedger.Ledger!,
                costOfGoodsSoldLedger.Ledger!,
                grnClearingLedger.Ledger!,
                purchaseTaxLedger.Ledger!,
                salesTaxLedger.Ledger!,
                defaultCashLedger.Ledger!,
                grnAdditionLedger.Ledger!,
                grnDiscountLedger.Ledger!,
                roundOffLedger.Ledger!));
    }

    public static async Task<CustomerPostingInfoResult> LoadCustomerPostingInfoAsync(
        AppDbContext dbContext,
        Guid customerId,
        CancellationToken cancellationToken)
    {
        var customer = await dbContext.Customers
            .Include(current => current.Ledger)
            .FirstOrDefaultAsync(current => current.Id == customerId, cancellationToken);
        if (customer is null)
        {
            return CustomerPostingInfoResult.Invalid("Selected customer does not exist.");
        }

        if (customer.LedgerId is null || customer.Ledger is null)
        {
            return CustomerPostingInfoResult.Invalid(
                "Selected customer must have a linked ledger before posting.");
        }

        if (customer.Ledger.Status != LedgerStatuses.Active)
        {
            return CustomerPostingInfoResult.Invalid(
                "Selected customer ledger must be active.");
        }

        return CustomerPostingInfoResult.Valid(customer, customer.Ledger);
    }

    public static async Task<VendorPostingInfoResult> LoadVendorPostingInfoAsync(
        AppDbContext dbContext,
        Guid vendorId,
        CancellationToken cancellationToken)
    {
        var vendor = await dbContext.Vendors
            .Include(current => current.Ledger)
            .FirstOrDefaultAsync(current => current.Id == vendorId, cancellationToken);
        if (vendor is null)
        {
            return VendorPostingInfoResult.Invalid("Selected vendor does not exist.");
        }

        if (vendor.LedgerId is null || vendor.Ledger is null)
        {
            return VendorPostingInfoResult.Invalid(
                "Selected vendor must have a linked ledger before posting.");
        }

        if (vendor.Ledger.Status != LedgerStatuses.Active)
        {
            return VendorPostingInfoResult.Invalid(
                "Selected vendor ledger must be active.");
        }

        return VendorPostingInfoResult.Valid(vendor, vendor.Ledger);
    }

    public static string? ValidateDocumentLedger(Guid? ledgerId, Ledger? ledger, string label)
    {
        if (ledgerId is null || ledgerId == Guid.Empty)
        {
            return $"Selected {label} ledger is required for posting.";
        }

        if (ledger is null)
        {
            return $"Selected {label} ledger does not exist.";
        }

        if (ledger.Status != LedgerStatuses.Active)
        {
            return $"Selected {label} ledger must be active.";
        }

        if (!ledger.AllowManualPosting)
        {
            return $"Selected {label} ledger must allow posting.";
        }

        if (ledger.IsBillWise)
        {
            return $"Selected {label} ledger cannot be a bill-wise ledger.";
        }

        return null;
    }

    public static AutoJournalPostingLine BuildSignedLine(Guid ledgerId, decimal signedAmount)
    {
        var roundedAmount = RoundAmount(signedAmount);
        return roundedAmount >= 0
            ? new AutoJournalPostingLine(ledgerId, roundedAmount, 0)
            : new AutoJournalPostingLine(ledgerId, 0, Math.Abs(roundedAmount));
    }

    public static decimal RoundAmount(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private static ConfiguredLedgerResult GetConfiguredLedger(
        IReadOnlyDictionary<Guid, Ledger> ledgers,
        Guid? ledgerId,
        string label,
        string? requiredNature = null)
    {
        if (ledgerId is null || ledgerId == Guid.Empty)
        {
            return ConfiguredLedgerResult.Invalid(
                $"Configure the {label} ledger in accounting settings.");
        }

        if (!ledgers.TryGetValue(ledgerId.Value, out var ledger))
        {
            return ConfiguredLedgerResult.Invalid(
                $"Configured {label} ledger does not exist.");
        }

        if (ledger.Status != LedgerStatuses.Active)
        {
            return ConfiguredLedgerResult.Invalid(
                $"Configured {label} ledger must be active.");
        }

        if (!ledger.AllowManualPosting)
        {
            return ConfiguredLedgerResult.Invalid(
                $"Configured {label} ledger must allow posting.");
        }

        if (ledger.IsBillWise)
        {
            return ConfiguredLedgerResult.Invalid(
                $"Configured {label} ledger cannot be a bill-wise ledger.");
        }

        if (requiredNature is not null &&
            !string.Equals(
                ledger.LedgerGroup?.Nature,
                requiredNature,
                StringComparison.OrdinalIgnoreCase))
        {
            return ConfiguredLedgerResult.Invalid(
                $"Configured {label} ledger must belong to the {requiredNature} ledger group.");
        }

        return ConfiguredLedgerResult.Valid(ledger);
    }
}

internal sealed record TransactionAccountingSettings(
    Ledger InventoryLedger,
    Ledger SalesLedger,
    Ledger CostOfGoodsSoldLedger,
    Ledger GrnClearingLedger,
    Ledger PurchaseTaxLedger,
    Ledger SalesTaxLedger,
    Ledger DefaultCashLedger,
    Ledger GrnAdditionLedger,
    Ledger GrnDiscountLedger,
    Ledger RoundOffLedger);

internal sealed record TransactionAccountingSettingsResult(
    string? Error,
    TransactionAccountingSettings? Settings = null)
{
    public static TransactionAccountingSettingsResult Valid(
        TransactionAccountingSettings settings) =>
        new(null, settings);

    public static TransactionAccountingSettingsResult Invalid(string error) =>
        new(error);
}

internal sealed record CustomerPostingInfoResult(
    string? Error,
    Customer? Customer = null,
    Ledger? Ledger = null)
{
    public static CustomerPostingInfoResult Valid(Customer customer, Ledger ledger) =>
        new(null, customer, ledger);

    public static CustomerPostingInfoResult Invalid(string error) =>
        new(error);
}

internal sealed record VendorPostingInfoResult(
    string? Error,
    Vendor? Vendor = null,
    Ledger? Ledger = null)
{
    public static VendorPostingInfoResult Valid(Vendor vendor, Ledger ledger) =>
        new(null, vendor, ledger);

    public static VendorPostingInfoResult Invalid(string error) =>
        new(error);
}

internal sealed record ConfiguredLedgerResult(
    string? Error,
    Ledger? Ledger = null)
{
    public static ConfiguredLedgerResult Valid(Ledger ledger) =>
        new(null, ledger);

    public static ConfiguredLedgerResult Invalid(string error) =>
        new(error);
}
