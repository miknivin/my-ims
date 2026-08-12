using backend.Features.Accounting.Journals;
using backend.Infrastructure.Persistence;

namespace backend.Features.Inventory.DeliveryNotes;

internal static class DeliveryNoteJournalPosting
{
    public static async Task<string?> PostAsync(
        AppDbContext dbContext,
        DeliveryNote deliveryNote,
        decimal totalCogsAmount,
        CancellationToken cancellationToken)
    {
        var settings = await TransactionJournalPostingSupport.LoadAccountingSettingsAsync(
            dbContext, cancellationToken);
        if (settings.Error is not null)
            return settings.Error;

        var roundedCogs = TransactionJournalPostingSupport.RoundAmount(totalCogsAmount);

        var lines = new List<AutoJournalPostingLine>
        {
            new(settings.Settings!.CostOfGoodsSoldLedger.Id, roundedCogs, 0),
            new(settings.Settings.InventoryLedger.Id, 0, roundedCogs)
        };

        return await AutoJournalPostingService.PostAsync(
            dbContext,
            new AutoJournalVoucherDraft(
                JournalVoucherType.DeliveryNote,
                JournalSourceType.DeliveryNote,
                deliveryNote.Id,
                deliveryNote.Document.No,
                deliveryNote.Document.Date,
                deliveryNote.General.Notes,
                lines),
            cancellationToken);
    }

    public static Task<string?> ReverseAsync(
        AppDbContext dbContext,
        Guid deliveryNoteId,
        DateOnly reversalDate,
        CancellationToken cancellationToken) =>
        AutoJournalPostingService.ReverseAsync(
            dbContext,
            new AutoJournalReversalRequest(
                JournalVoucherType.DeliveryNote,
                JournalSourceType.DeliveryNote,
                deliveryNoteId,
                reversalDate),
            cancellationToken);
}
