using backend.Features.Accounting.Journals;
using backend.Infrastructure.Persistence;

namespace backend.Features.Inventory.GoodsReceiptNotes;

internal static class GoodsReceiptNoteJournalPosting
{
    public static async Task<string?> PostAsync(
        AppDbContext dbContext,
        GoodsReceiptNote goodsReceiptNote,
        CancellationToken cancellationToken)
    {
        var buildResult = await BuildVoucherDraftAsync(dbContext, goodsReceiptNote, cancellationToken);
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
        Guid goodsReceiptNoteId,
        DateOnly reversalDate,
        CancellationToken cancellationToken) =>
        AutoJournalPostingService.ReverseAsync(
            dbContext,
            new AutoJournalReversalRequest(
                JournalVoucherType.GoodsReceiptNote,
                JournalSourceType.GoodsReceiptNote,
                goodsReceiptNoteId,
                reversalDate),
            cancellationToken);

    private static async Task<GoodsReceiptNoteVoucherDraftResult> BuildVoucherDraftAsync(
        AppDbContext dbContext,
        GoodsReceiptNote goodsReceiptNote,
        CancellationToken cancellationToken)
    {
        var settings = await TransactionJournalPostingSupport.LoadAccountingSettingsAsync(
            dbContext,
            cancellationToken);
        if (settings.Error is not null)
        {
            return GoodsReceiptNoteVoucherDraftResult.Invalid(settings.Error);
        }

        var itemTotal = TransactionJournalPostingSupport.RoundAmount(
            goodsReceiptNote.Items.Sum(current => current.Total));
        var lines = new List<AutoJournalPostingLine>
        {
            new(settings.Settings!.InventoryLedger.Id, itemTotal, 0),
            new(settings.Settings.GrnAdditionLedger.Id, goodsReceiptNote.Footer.Addition, 0),
            new(settings.Settings.GrnDiscountLedger.Id, 0, goodsReceiptNote.Footer.DiscountFooter),
            TransactionJournalPostingSupport.BuildSignedLine(
                settings.Settings.RoundOffLedger.Id,
                goodsReceiptNote.Footer.RoundOff),
            new(settings.Settings.GrnClearingLedger.Id, 0, goodsReceiptNote.Footer.NetTotal)
        };

        return GoodsReceiptNoteVoucherDraftResult.Valid(
            new AutoJournalVoucherDraft(
                JournalVoucherType.GoodsReceiptNote,
                JournalSourceType.GoodsReceiptNote,
                goodsReceiptNote.Id,
                goodsReceiptNote.Document.No,
                goodsReceiptNote.Document.Date,
                goodsReceiptNote.General.Notes,
                lines));
    }

    private sealed record GoodsReceiptNoteVoucherDraftResult(
        string? Error,
        AutoJournalVoucherDraft? VoucherDraft = null)
    {
        public static GoodsReceiptNoteVoucherDraftResult Valid(
            AutoJournalVoucherDraft voucherDraft) =>
            new(null, voucherDraft);

        public static GoodsReceiptNoteVoucherDraftResult Invalid(string error) =>
            new(error);
    }
}
