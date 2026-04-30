using backend.Features.Accounting.Journals;
using backend.Features.Masters.Customers;
using backend.Infrastructure.Persistence;

namespace backend.Features.Transactions.SalesInvoices;

internal static class SalesInvoiceJournalPosting
{
    public static async Task<string?> PostAsync(
        AppDbContext dbContext,
        SalesInvoice salesInvoice,
        CancellationToken cancellationToken)
    {
        var buildResult = await BuildVoucherDraftAsync(dbContext, salesInvoice, cancellationToken);
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
        Guid salesInvoiceId,
        DateOnly reversalDate,
        CancellationToken cancellationToken) =>
        AutoJournalPostingService.ReverseAsync(
            dbContext,
            new AutoJournalReversalRequest(
                JournalVoucherType.SalesInvoice,
                JournalSourceType.SalesInvoice,
                salesInvoiceId,
                reversalDate),
            cancellationToken);

    private static async Task<SalesInvoiceVoucherDraftResult> BuildVoucherDraftAsync(
        AppDbContext dbContext,
        SalesInvoice salesInvoice,
        CancellationToken cancellationToken)
    {
        var settings = await TransactionJournalPostingSupport.LoadAccountingSettingsAsync(
            dbContext,
            cancellationToken);
        if (settings.Error is not null)
        {
            return SalesInvoiceVoucherDraftResult.Invalid(settings.Error);
        }

        var customerInfo = await TransactionJournalPostingSupport.LoadCustomerPostingInfoAsync(
            dbContext,
            salesInvoice.CustomerInformation.CustomerId,
            cancellationToken);
        if (customerInfo.Error is not null)
        {
            return SalesInvoiceVoucherDraftResult.Invalid(customerInfo.Error);
        }

        var additionValidationError = ValidateAdditionLedgers(salesInvoice.Additions);
        if (additionValidationError is not null)
        {
            return SalesInvoiceVoucherDraftResult.Invalid(additionValidationError);
        }

        var lines = new List<AutoJournalPostingLine>
        {
            new(settings.Settings!.DefaultCashLedger.Id, salesInvoice.Footer.Paid, 0),
            new(
                customerInfo.Ledger!.Id,
                salesInvoice.FinancialDetails.Balance,
                0,
                SubLedgerType.Customer,
                customerInfo.Customer!.Id,
                customerInfo.Customer.BasicDetails.Code,
                customerInfo.Customer.BasicDetails.Name),
            new(
                settings.Settings.SalesLedger.Id,
                0,
                TransactionJournalPostingSupport.RoundAmount(
                    salesInvoice.Items.Sum(current => current.TaxableAmount))),
            new(
                settings.Settings.SalesTaxLedger.Id,
                0,
                TransactionJournalPostingSupport.RoundAmount(
                    salesInvoice.Items.Sum(current => current.TaxAmount))),
            new(
                settings.Settings.CostOfGoodsSoldLedger.Id,
                TransactionJournalPostingSupport.RoundAmount(
                    salesInvoice.Items.Sum(current => current.CogsAmount)),
                0),
            new(
                settings.Settings.InventoryLedger.Id,
                0,
                TransactionJournalPostingSupport.RoundAmount(
                    salesInvoice.Items.Sum(current => current.CogsAmount)))
        };

        AppendDocumentAdjustmentLines(lines, salesInvoice.Additions);

        return SalesInvoiceVoucherDraftResult.Valid(
            new AutoJournalVoucherDraft(
                JournalVoucherType.SalesInvoice,
                JournalSourceType.SalesInvoice,
                salesInvoice.Id,
                salesInvoice.Document.No,
                salesInvoice.Document.Date,
                BuildNarration(salesInvoice.General.Notes, salesInvoice.Footer.Notes),
                lines));
    }

    private static string? ValidateAdditionLedgers(IEnumerable<SalesInvoiceAddition> additions)
    {
        var effectiveAdditions = additions
            .Where(current => TransactionJournalPostingSupport.RoundAmount(current.Amount) > 0)
            .ToList();

        for (var index = 0; index < effectiveAdditions.Count; index++)
        {
            var addition = effectiveAdditions[index];
            var label = addition.Type == SalesInvoiceAdditionType.Deduction
                ? $"sales invoice deduction #{index + 1}"
                : $"sales invoice addition #{index + 1}";
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
        IEnumerable<SalesInvoiceAddition> additions)
    {
        foreach (var addition in additions.Where(current =>
                     TransactionJournalPostingSupport.RoundAmount(current.Amount) > 0))
        {
            lines.Add(addition.Type == SalesInvoiceAdditionType.Deduction
                ? new AutoJournalPostingLine(addition.Ledger!.Id, addition.Amount, 0)
                : new AutoJournalPostingLine(addition.Ledger!.Id, 0, addition.Amount));
        }
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

    private sealed record SalesInvoiceVoucherDraftResult(
        string? Error,
        AutoJournalVoucherDraft? VoucherDraft = null)
    {
        public static SalesInvoiceVoucherDraftResult Valid(
            AutoJournalVoucherDraft voucherDraft) =>
            new(null, voucherDraft);

        public static SalesInvoiceVoucherDraftResult Invalid(string error) =>
            new(error);
    }
}
