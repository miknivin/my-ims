using backend.Features.Accounting.Journals;
using backend.Features.Inventory.GoodsReceiptNotes;
using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Vendors;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Transactions.PurchaseInvoices;

internal static class PurchaseInvoiceJournalPosting
{
    public static async Task<string?> PostAsync(
        AppDbContext dbContext,
        PurchaseInvoice purchaseInvoice,
        CancellationToken cancellationToken)
    {
        var buildResult = await BuildVoucherDraftAsync(dbContext, purchaseInvoice, cancellationToken);
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
        Guid purchaseInvoiceId,
        DateOnly reversalDate,
        CancellationToken cancellationToken) =>
        AutoJournalPostingService.ReverseAsync(
            dbContext,
            new AutoJournalReversalRequest(
                JournalVoucherType.PurchaseInvoice,
                JournalSourceType.PurchaseInvoice,
                purchaseInvoiceId,
                reversalDate),
            cancellationToken);

    private static async Task<PurchaseInvoiceVoucherDraftResult> BuildVoucherDraftAsync(
        AppDbContext dbContext,
        PurchaseInvoice purchaseInvoice,
        CancellationToken cancellationToken)
    {
        var settings = await TransactionJournalPostingSupport.LoadAccountingSettingsAsync(
            dbContext,
            cancellationToken);
        if (settings.Error is not null)
        {
            return PurchaseInvoiceVoucherDraftResult.Invalid(settings.Error);
        }

        var vendorInfo = await TransactionJournalPostingSupport.LoadVendorPostingInfoAsync(
            dbContext,
            purchaseInvoice.VendorInformation.VendorId,
            cancellationToken);
        if (vendorInfo.Error is not null)
        {
            return PurchaseInvoiceVoucherDraftResult.Invalid(vendorInfo.Error);
        }

        var additionValidationError = ValidateAdditionLedgers(purchaseInvoice.Additions);
        if (additionValidationError is not null)
        {
            return PurchaseInvoiceVoucherDraftResult.Invalid(additionValidationError);
        }

        var lines = purchaseInvoice.SourceRef.Type switch
        {
            PurchaseInvoiceReferenceType.Direct => BuildDirectPostingLines(
                purchaseInvoice,
                settings.Settings!,
                vendorInfo.Vendor!,
                vendorInfo.Ledger!),
            PurchaseInvoiceReferenceType.GoodsReceipt => await BuildGoodsReceiptPostingLinesAsync(
                dbContext,
                purchaseInvoice,
                settings.Settings!,
                vendorInfo.Vendor!,
                vendorInfo.Ledger!,
                cancellationToken),
            PurchaseInvoiceReferenceType.PurchaseOrder => PurchaseInvoicePostingBuildResult.Invalid(
                "Submitted purchase invoices against purchase orders require a submitted goods receipt note. Use the GoodsReceipt source type instead."),
            _ => PurchaseInvoicePostingBuildResult.Invalid("Unsupported purchase invoice source type.")
        };

        if (lines.Error is not null)
        {
            return PurchaseInvoiceVoucherDraftResult.Invalid(lines.Error);
        }

        return PurchaseInvoiceVoucherDraftResult.Valid(
            new AutoJournalVoucherDraft(
                JournalVoucherType.PurchaseInvoice,
                JournalSourceType.PurchaseInvoice,
                purchaseInvoice.Id,
                purchaseInvoice.Document.No,
                purchaseInvoice.Document.Date,
                BuildNarration(purchaseInvoice.General.Notes, purchaseInvoice.Footer.Notes),
                lines.Lines));
    }

    private static PurchaseInvoicePostingBuildResult BuildDirectPostingLines(
        PurchaseInvoice purchaseInvoice,
        TransactionAccountingSettings settings,
        Vendor vendor,
        Ledger vendorLedger)
    {
        var lines = BuildBaseInvoiceLines(purchaseInvoice, settings);
        AppendSettlementLine(lines, purchaseInvoice, settings, vendor, vendorLedger);

        return PurchaseInvoicePostingBuildResult.Valid(lines);
    }

    private static async Task<PurchaseInvoicePostingBuildResult> BuildGoodsReceiptPostingLinesAsync(
        AppDbContext dbContext,
        PurchaseInvoice purchaseInvoice,
        TransactionAccountingSettings settings,
        Vendor vendor,
        Ledger vendorLedger,
        CancellationToken cancellationToken)
    {
        if (purchaseInvoice.SourceRef.ReferenceId is null || purchaseInvoice.SourceRef.ReferenceId == Guid.Empty)
        {
            return PurchaseInvoicePostingBuildResult.Invalid(
                "Purchase invoice against goods receipt must reference a goods receipt note.");
        }

        var goodsReceiptNote = await dbContext.GoodsReceiptNotes
            .Include(current => current.Items)
            .FirstOrDefaultAsync(
                current => current.Id == purchaseInvoice.SourceRef.ReferenceId.Value,
                cancellationToken);
        if (goodsReceiptNote is null)
        {
            return PurchaseInvoicePostingBuildResult.Invalid(
                "Selected goods receipt reference does not exist.");
        }

        var purchaseStockBase = TransactionJournalPostingSupport.RoundAmount(
            purchaseInvoice.Items.Sum(current => current.TaxableAmount));
        var goodsReceiptItemTotal = TransactionJournalPostingSupport.RoundAmount(
            goodsReceiptNote.Items.Sum(current => current.Total));
        var inventoryDelta = TransactionJournalPostingSupport.RoundAmount(
            purchaseStockBase - goodsReceiptItemTotal);

        var lines = new List<AutoJournalPostingLine>
        {
            new(settings.GrnClearingLedger.Id, goodsReceiptNote.Footer.NetTotal, 0),
            new(settings.GrnAdditionLedger.Id, 0, goodsReceiptNote.Footer.Addition),
            new(settings.GrnDiscountLedger.Id, goodsReceiptNote.Footer.DiscountFooter, 0),
            TransactionJournalPostingSupport.BuildSignedLine(
                settings.RoundOffLedger.Id,
                -goodsReceiptNote.Footer.RoundOff),
            TransactionJournalPostingSupport.BuildSignedLine(
                settings.InventoryLedger.Id,
                inventoryDelta),
            new(
                settings.PurchaseTaxLedger.Id,
                TransactionJournalPostingSupport.RoundAmount(
                    purchaseInvoice.Items.Sum(current => current.TaxAmount)),
                0)
        };

        AppendDocumentAdjustmentLines(lines, purchaseInvoice.Additions);
        AppendSettlementLine(lines, purchaseInvoice, settings, vendor, vendorLedger);

        return PurchaseInvoicePostingBuildResult.Valid(lines);
    }

    private static List<AutoJournalPostingLine> BuildBaseInvoiceLines(
        PurchaseInvoice purchaseInvoice,
        TransactionAccountingSettings settings)
    {
        var lines = new List<AutoJournalPostingLine>
        {
            new(
                settings.InventoryLedger.Id,
                TransactionJournalPostingSupport.RoundAmount(
                    purchaseInvoice.Items.Sum(current => current.TaxableAmount)),
                0),
            new(
                settings.PurchaseTaxLedger.Id,
                TransactionJournalPostingSupport.RoundAmount(
                    purchaseInvoice.Items.Sum(current => current.TaxAmount)),
                0)
        };

        AppendDocumentAdjustmentLines(lines, purchaseInvoice.Additions);
        return lines;
    }

    private static string? ValidateAdditionLedgers(IEnumerable<PurchaseInvoiceAddition> additions)
    {
        var effectiveAdditions = additions
            .Where(current => TransactionJournalPostingSupport.RoundAmount(current.Amount) > 0)
            .ToList();

        for (var index = 0; index < effectiveAdditions.Count; index++)
        {
            var addition = effectiveAdditions[index];
            var label = addition.Type == PurchaseInvoiceAdditionType.Deduction
                ? $"purchase invoice deduction #{index + 1}"
                : $"purchase invoice addition #{index + 1}";
            var error = TransactionJournalPostingSupport.ValidateDocumentLedger(
                addition.LedgerId,
                addition.Ledger,
                label);
            if (error is not null)
            {
                return error;
            }
        }

        return null;
    }

    private static void AppendDocumentAdjustmentLines(
        ICollection<AutoJournalPostingLine> lines,
        IEnumerable<PurchaseInvoiceAddition> additions)
    {
        foreach (var addition in additions.Where(current =>
                     TransactionJournalPostingSupport.RoundAmount(current.Amount) > 0))
        {
            lines.Add(addition.Type == PurchaseInvoiceAdditionType.Deduction
                ? new AutoJournalPostingLine(addition.Ledger!.Id, 0, addition.Amount)
                : new AutoJournalPostingLine(addition.Ledger!.Id, addition.Amount, 0));
        }
    }

    private static void AppendSettlementLine(
        ICollection<AutoJournalPostingLine> lines,
        PurchaseInvoice purchaseInvoice,
        TransactionAccountingSettings settings,
        Vendor vendor,
        Ledger vendorLedger)
    {
        if (purchaseInvoice.FinancialDetails.PaymentMode == PurchaseInvoicePaymentMode.Cash)
        {
            lines.Add(new AutoJournalPostingLine(
                settings.DefaultCashLedger.Id,
                0,
                purchaseInvoice.Footer.NetTotal));
            return;
        }

        lines.Add(new AutoJournalPostingLine(
            vendorLedger.Id,
            0,
            purchaseInvoice.FinancialDetails.Balance,
            SubLedgerType.Vendor,
            vendor.Id,
            vendor.BasicInfo.Code,
            vendor.BasicInfo.Name));
    }

    private static string? BuildNarration(string? primary, string? secondary)
    {
        var parts = new[] { primary, secondary }
            .Where(current => !string.IsNullOrWhiteSpace(current))
            .Select(current => current!.Trim())
            .Distinct()
            .ToList();

        return parts.Count == 0 ? null : string.Join(" | ", parts);
    }

    private sealed record PurchaseInvoiceVoucherDraftResult(
        string? Error,
        AutoJournalVoucherDraft? VoucherDraft = null)
    {
        public static PurchaseInvoiceVoucherDraftResult Valid(
            AutoJournalVoucherDraft voucherDraft) =>
            new(null, voucherDraft);

        public static PurchaseInvoiceVoucherDraftResult Invalid(string error) =>
            new(error);
    }

    private sealed record PurchaseInvoicePostingBuildResult(
        string? Error,
        IReadOnlyList<AutoJournalPostingLine>? Lines = null)
    {
        public IReadOnlyList<AutoJournalPostingLine> Lines { get; init; } = Lines ?? [];

        public static PurchaseInvoicePostingBuildResult Valid(
            IReadOnlyList<AutoJournalPostingLine> lines) =>
            new(null, lines);

        public static PurchaseInvoicePostingBuildResult Invalid(string error) =>
            new(error);
    }
}
