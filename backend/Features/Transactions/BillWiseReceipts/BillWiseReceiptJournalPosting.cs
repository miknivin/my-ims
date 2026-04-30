using backend.Features.Accounting.Journals;
using backend.Features.Masters.Customers;
using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Transactions.BillWiseReceipts;

internal static class BillWiseReceiptJournalPosting
{
    public static async Task<string?> PostAsync(
        AppDbContext dbContext,
        BillWiseReceipt receipt,
        CancellationToken cancellationToken)
    {
        var buildResult = await BuildVoucherDraftAsync(dbContext, receipt, cancellationToken);
        if (buildResult.Error is not null)
        {
            return buildResult.Error;
        }

        return await AutoJournalPostingService.PostAsync(
            dbContext,
            buildResult.VoucherDraft!,
            cancellationToken);
    }

    public static Task<string?> ReverseAsync(
        AppDbContext dbContext,
        Guid receiptId,
        DateOnly reversalDate,
        CancellationToken cancellationToken) =>
        AutoJournalPostingService.ReverseAsync(
            dbContext,
            new AutoJournalReversalRequest(
                JournalVoucherType.BillWiseReceipt,
                JournalSourceType.BillWiseReceipt,
                receiptId,
                reversalDate),
            cancellationToken);

    private static async Task<BillWiseReceiptVoucherDraftResult> BuildVoucherDraftAsync(
        AppDbContext dbContext,
        BillWiseReceipt receipt,
        CancellationToken cancellationToken)
    {
        var settings = await LoadAccountingSettingsAsync(dbContext, cancellationToken);
        if (settings.Error is not null)
        {
            return BillWiseReceiptVoucherDraftResult.Invalid(settings.Error);
        }

        var customerInfo = await LoadCustomerPostingInfoAsync(
            dbContext,
            receipt.CustomerInformation.CustomerId,
            cancellationToken);
        if (customerInfo.Error is not null)
        {
            return BillWiseReceiptVoucherDraftResult.Invalid(customerInfo.Error);
        }

        var accountLedger = await LoadAccountLedgerAsync(
            dbContext,
            receipt.AccountInformation.LedgerId,
            cancellationToken);
        if (accountLedger.Error is not null)
        {
            return BillWiseReceiptVoucherDraftResult.Invalid(accountLedger.Error);
        }

        return BillWiseReceiptVoucherDraftResult.Valid(
            new AutoJournalVoucherDraft(
                JournalVoucherType.BillWiseReceipt,
                JournalSourceType.BillWiseReceipt,
                receipt.Id,
                receipt.No,
                receipt.Date,
                receipt.Notes,
                [
                    new AutoJournalPostingLine(accountLedger.Ledger!.Id, receipt.Amount, 0),
                    new AutoJournalPostingLine(settings.DiscountAllowedLedger!.Id, receipt.TotalDiscount, 0),
                    new AutoJournalPostingLine(
                        customerInfo.Ledger!.Id,
                        0,
                        receipt.Amount + receipt.TotalDiscount,
                        SubLedgerType.Customer,
                        customerInfo.Customer!.Id,
                        customerInfo.Customer.BasicDetails.Code,
                        customerInfo.Customer.BasicDetails.Name)
                ]));
    }

    private static async Task<BillWiseReceiptAccountingSettingsResult> LoadAccountingSettingsAsync(
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var settings = await dbContext.Settings
            .Include(current => current.AccountingSettings.DiscountAllowedLedger)
            .FirstOrDefaultAsync(cancellationToken);
        if (settings is null)
        {
            return BillWiseReceiptAccountingSettingsResult.Invalid(
                "Configure accounting settings before posting bill-wise journals.");
        }

        var accounting = settings.AccountingSettings;
        var discountAllowedError = ValidateConfiguredLedger(
            accounting.DiscountAllowedLedgerId,
            accounting.DiscountAllowedLedger,
            "discount allowed");
        if (discountAllowedError is not null)
        {
            return BillWiseReceiptAccountingSettingsResult.Invalid(discountAllowedError);
        }

        return BillWiseReceiptAccountingSettingsResult.Valid(
            accounting.DiscountAllowedLedger!);
    }

    private static async Task<BillWiseReceiptCustomerPostingInfoResult> LoadCustomerPostingInfoAsync(
        AppDbContext dbContext,
        Guid customerId,
        CancellationToken cancellationToken)
    {
        var customer = await dbContext.Customers
            .Include(current => current.Ledger)
            .FirstOrDefaultAsync(current => current.Id == customerId, cancellationToken);
        if (customer is null)
        {
            return BillWiseReceiptCustomerPostingInfoResult.Invalid(
                "Selected customer does not exist.");
        }

        if (customer.LedgerId is null || customer.Ledger is null)
        {
            return BillWiseReceiptCustomerPostingInfoResult.Invalid(
                "Selected customer must have a linked ledger before posting.");
        }

        if (customer.Ledger.Status != LedgerStatuses.Active)
        {
            return BillWiseReceiptCustomerPostingInfoResult.Invalid(
                "Selected customer ledger must be active.");
        }

        return BillWiseReceiptCustomerPostingInfoResult.Valid(customer, customer.Ledger);
    }

    private static async Task<BillWiseReceiptAccountLedgerResult> LoadAccountLedgerAsync(
        AppDbContext dbContext,
        Guid ledgerId,
        CancellationToken cancellationToken)
    {
        var ledger = await dbContext.Ledgers
            .Include(current => current.LedgerGroup)
            .FirstOrDefaultAsync(current => current.Id == ledgerId, cancellationToken);
        if (ledger is null)
        {
            return BillWiseReceiptAccountLedgerResult.Invalid(
                "Selected account ledger does not exist.");
        }

        var ledgerError = ValidateAccountLedger(ledger);
        return ledgerError is null
            ? BillWiseReceiptAccountLedgerResult.Valid(ledger)
            : BillWiseReceiptAccountLedgerResult.Invalid(ledgerError);
    }

    private static string? ValidateConfiguredLedger(Guid? ledgerId, Ledger? ledger, string label)
    {
        if (ledgerId is null || ledgerId == Guid.Empty)
        {
            return $"Configure the {label} ledger in accounting settings.";
        }

        if (ledger is null)
        {
            return $"Configured {label} ledger does not exist.";
        }

        if (ledger.Status != LedgerStatuses.Active)
        {
            return $"Configured {label} ledger must be active.";
        }

        if (!ledger.AllowManualPosting)
        {
            return $"Configured {label} ledger must allow posting.";
        }

        return null;
    }

    private static string? ValidateAccountLedger(Ledger ledger)
    {
        if (ledger.Status != LedgerStatuses.Active)
        {
            return "Selected account ledger must be active.";
        }

        if (!ledger.AllowManualPosting)
        {
            return "Selected account ledger must allow manual posting.";
        }

        if (ledger.IsBillWise)
        {
            return "Selected account ledger cannot be a bill-wise ledger.";
        }

        if (!string.Equals(
                ledger.LedgerGroup?.Nature,
                LedgerGroupNatures.Asset,
                StringComparison.OrdinalIgnoreCase))
        {
            return "Selected account ledger must belong to an asset ledger group.";
        }

        return null;
    }

    private sealed record BillWiseReceiptVoucherDraftResult(
        string? Error,
        AutoJournalVoucherDraft? VoucherDraft = null)
    {
        public static BillWiseReceiptVoucherDraftResult Valid(
            AutoJournalVoucherDraft voucherDraft) =>
            new(null, voucherDraft);

        public static BillWiseReceiptVoucherDraftResult Invalid(string error) =>
            new(error);
    }

    private sealed record BillWiseReceiptAccountingSettingsResult(
        string? Error,
        Ledger? DiscountAllowedLedger = null)
    {
        public static BillWiseReceiptAccountingSettingsResult Valid(
            Ledger discountAllowedLedger) =>
            new(null, discountAllowedLedger);

        public static BillWiseReceiptAccountingSettingsResult Invalid(string error) =>
            new(error);
    }

    private sealed record BillWiseReceiptCustomerPostingInfoResult(
        string? Error,
        Customer? Customer = null,
        Ledger? Ledger = null)
    {
        public static BillWiseReceiptCustomerPostingInfoResult Valid(
            Customer customer,
            Ledger ledger) =>
            new(null, customer, ledger);

        public static BillWiseReceiptCustomerPostingInfoResult Invalid(string error) =>
            new(error);
    }

    private sealed record BillWiseReceiptAccountLedgerResult(
        string? Error,
        Ledger? Ledger = null)
    {
        public static BillWiseReceiptAccountLedgerResult Valid(Ledger ledger) =>
            new(null, ledger);

        public static BillWiseReceiptAccountLedgerResult Invalid(string error) =>
            new(error);
    }
}
