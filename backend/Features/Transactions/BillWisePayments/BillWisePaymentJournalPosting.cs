using backend.Features.Accounting.Journals;
using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Vendors;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Transactions.BillWisePayments;

internal static class BillWisePaymentJournalPosting
{
    public static async Task<string?> PostAsync(
        AppDbContext dbContext,
        BillWisePayment payment,
        CancellationToken cancellationToken)
    {
        var buildResult = await BuildVoucherDraftAsync(dbContext, payment, cancellationToken);
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
        Guid paymentId,
        DateOnly reversalDate,
        CancellationToken cancellationToken) =>
        AutoJournalPostingService.ReverseAsync(
            dbContext,
            new AutoJournalReversalRequest(
                JournalVoucherType.BillWisePayment,
                JournalSourceType.BillWisePayment,
                paymentId,
                reversalDate),
            cancellationToken);

    private static async Task<BillWisePaymentVoucherDraftResult> BuildVoucherDraftAsync(
        AppDbContext dbContext,
        BillWisePayment payment,
        CancellationToken cancellationToken)
    {
        var settings = await LoadAccountingSettingsAsync(dbContext, cancellationToken);
        if (settings.Error is not null)
        {
            return BillWisePaymentVoucherDraftResult.Invalid(settings.Error);
        }

        var vendorInfo = await LoadVendorPostingInfoAsync(
            dbContext,
            payment.VendorInformation.VendorId,
            cancellationToken);
        if (vendorInfo.Error is not null)
        {
            return BillWisePaymentVoucherDraftResult.Invalid(vendorInfo.Error);
        }

        var accountLedger = await LoadAccountLedgerAsync(
            dbContext,
            payment.AccountInformation.LedgerId,
            cancellationToken);
        if (accountLedger.Error is not null)
        {
            return BillWisePaymentVoucherDraftResult.Invalid(accountLedger.Error);
        }

        return BillWisePaymentVoucherDraftResult.Valid(
            new AutoJournalVoucherDraft(
                JournalVoucherType.BillWisePayment,
                JournalSourceType.BillWisePayment,
                payment.Id,
                payment.No,
                payment.Date,
                payment.Notes,
                [
                    new AutoJournalPostingLine(
                        vendorInfo.Ledger!.Id,
                        payment.Amount + payment.TotalDiscount,
                        0,
                        SubLedgerType.Vendor,
                        vendorInfo.Vendor!.Id,
                        vendorInfo.Vendor.BasicInfo.Code,
                        vendorInfo.Vendor.BasicInfo.Name),
                    new AutoJournalPostingLine(accountLedger.Ledger!.Id, 0, payment.Amount),
                    new AutoJournalPostingLine(settings.DiscountReceivedLedger!.Id, 0, payment.TotalDiscount)
                ]));
    }

    private static async Task<BillWisePaymentAccountingSettingsResult> LoadAccountingSettingsAsync(
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var settings = await dbContext.Settings
            .Include(current => current.AccountingSettings.DiscountReceivedLedger)
            .FirstOrDefaultAsync(cancellationToken);
        if (settings is null)
        {
            return BillWisePaymentAccountingSettingsResult.Invalid(
                "Configure accounting settings before posting bill-wise journals.");
        }

        var accounting = settings.AccountingSettings;
        var discountReceivedError = ValidateConfiguredLedger(
            accounting.DiscountReceivedLedgerId,
            accounting.DiscountReceivedLedger,
            "discount received");
        if (discountReceivedError is not null)
        {
            return BillWisePaymentAccountingSettingsResult.Invalid(discountReceivedError);
        }

        return BillWisePaymentAccountingSettingsResult.Valid(
            accounting.DiscountReceivedLedger!);
    }

    private static async Task<BillWisePaymentVendorPostingInfoResult> LoadVendorPostingInfoAsync(
        AppDbContext dbContext,
        Guid vendorId,
        CancellationToken cancellationToken)
    {
        var vendor = await dbContext.Vendors
            .Include(current => current.Ledger)
            .FirstOrDefaultAsync(current => current.Id == vendorId, cancellationToken);
        if (vendor is null)
        {
            return BillWisePaymentVendorPostingInfoResult.Invalid(
                "Selected vendor does not exist.");
        }

        if (vendor.LedgerId is null || vendor.Ledger is null)
        {
            return BillWisePaymentVendorPostingInfoResult.Invalid(
                "Selected vendor must have a linked ledger before posting.");
        }

        if (vendor.Ledger.Status != LedgerStatuses.Active)
        {
            return BillWisePaymentVendorPostingInfoResult.Invalid(
                "Selected vendor ledger must be active.");
        }

        return BillWisePaymentVendorPostingInfoResult.Valid(vendor, vendor.Ledger);
    }

    private static async Task<BillWisePaymentAccountLedgerResult> LoadAccountLedgerAsync(
        AppDbContext dbContext,
        Guid ledgerId,
        CancellationToken cancellationToken)
    {
        var ledger = await dbContext.Ledgers
            .Include(current => current.LedgerGroup)
            .FirstOrDefaultAsync(current => current.Id == ledgerId, cancellationToken);
        if (ledger is null)
        {
            return BillWisePaymentAccountLedgerResult.Invalid(
                "Selected account ledger does not exist.");
        }

        var ledgerError = ValidateAccountLedger(ledger);
        return ledgerError is null
            ? BillWisePaymentAccountLedgerResult.Valid(ledger)
            : BillWisePaymentAccountLedgerResult.Invalid(ledgerError);
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

    private sealed record BillWisePaymentVoucherDraftResult(
        string? Error,
        AutoJournalVoucherDraft? VoucherDraft = null)
    {
        public static BillWisePaymentVoucherDraftResult Valid(
            AutoJournalVoucherDraft voucherDraft) =>
            new(null, voucherDraft);

        public static BillWisePaymentVoucherDraftResult Invalid(string error) =>
            new(error);
    }

    private sealed record BillWisePaymentAccountingSettingsResult(
        string? Error,
        Ledger? DiscountReceivedLedger = null)
    {
        public static BillWisePaymentAccountingSettingsResult Valid(
            Ledger discountReceivedLedger) =>
            new(null, discountReceivedLedger);

        public static BillWisePaymentAccountingSettingsResult Invalid(string error) =>
            new(error);
    }

    private sealed record BillWisePaymentVendorPostingInfoResult(
        string? Error,
        Vendor? Vendor = null,
        Ledger? Ledger = null)
    {
        public static BillWisePaymentVendorPostingInfoResult Valid(
            Vendor vendor,
            Ledger ledger) =>
            new(null, vendor, ledger);

        public static BillWisePaymentVendorPostingInfoResult Invalid(string error) =>
            new(error);
    }

    private sealed record BillWisePaymentAccountLedgerResult(
        string? Error,
        Ledger? Ledger = null)
    {
        public static BillWisePaymentAccountLedgerResult Valid(Ledger ledger) =>
            new(null, ledger);

        public static BillWisePaymentAccountLedgerResult Invalid(string error) =>
            new(error);
    }
}
