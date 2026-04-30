using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Accounting.Journals;

internal static class AutoJournalPostingService
{
    private const int VoucherNoMaxLength = 50;

    public static async Task<string?> PostAsync(
        AppDbContext dbContext,
        AutoJournalVoucherDraft draft,
        CancellationToken cancellationToken)
    {
        if (await HasOriginalVoucherAsync(
                dbContext,
                draft.SourceType,
                draft.SourceId,
                cancellationToken))
        {
            return "Journal voucher is already posted for this source.";
        }

        return await CreateVoucherAsync(dbContext, draft, cancellationToken);
    }

    public static Task<string?> ReverseAsync(
        AppDbContext dbContext,
        AutoJournalReversalRequest reversal,
        CancellationToken cancellationToken) =>
        ReverseVoucherAsync(
            dbContext,
            reversal.VoucherType,
            reversal.SourceType,
            reversal.SourceId,
            reversal.ReversalDate,
            cancellationToken);

    private static async Task<string?> CreateVoucherAsync(
        AppDbContext dbContext,
        AutoJournalVoucherDraft draft,
        CancellationToken cancellationToken)
    {
        var effectiveLines = draft.Lines
            .Where(current => current.DebitAmount > 0 || current.CreditAmount > 0)
            .ToList();
        if (effectiveLines.Count == 0)
        {
            return "Journal voucher must contain at least one non-zero entry.";
        }

        var totalDebit = RoundAmount(effectiveLines.Sum(current => current.DebitAmount));
        var totalCredit = RoundAmount(effectiveLines.Sum(current => current.CreditAmount));
        if (totalDebit != totalCredit)
        {
            return "Journal voucher is not balanced.";
        }

        if (await VoucherNoExistsAsync(
                dbContext,
                draft.VoucherType,
                draft.VoucherNo,
                cancellationToken))
        {
            return $"Journal voucher number {draft.VoucherNo} already exists.";
        }

        var now = DateTime.UtcNow;
        var voucher = new JournalVoucher
        {
            VoucherType = draft.VoucherType,
            VoucherNo = draft.VoucherNo,
            PostingDate = draft.PostingDate,
            Status = JournalVoucherStatus.Posted,
            SourceType = draft.SourceType,
            SourceId = draft.SourceId,
            Narration = draft.Narration,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        voucher.Entries = effectiveLines
            .Select((line, index) => new JournalEntry
            {
                JournalVoucherId = voucher.Id,
                JournalVoucher = voucher,
                LineNo = index + 1,
                PostingDate = draft.PostingDate,
                VoucherType = draft.VoucherType,
                VoucherNo = draft.VoucherNo,
                SourceType = draft.SourceType,
                SourceId = draft.SourceId,
                LedgerId = line.LedgerId,
                SubLedgerType = line.SubLedgerType,
                SubLedgerId = line.SubLedgerId,
                SubLedgerCodeSnapshot = line.SubLedgerCodeSnapshot,
                SubLedgerNameSnapshot = line.SubLedgerNameSnapshot,
                Narration = draft.Narration,
                DebitAmount = RoundAmount(line.DebitAmount),
                CreditAmount = RoundAmount(line.CreditAmount),
                CreatedAtUtc = now
            })
            .ToList();

        dbContext.JournalVouchers.Add(voucher);
        return null;
    }

    private static async Task<string?> ReverseVoucherAsync(
        AppDbContext dbContext,
        JournalVoucherType voucherType,
        JournalSourceType sourceType,
        Guid sourceId,
        DateOnly reversalDate,
        CancellationToken cancellationToken)
    {
        var originalVoucher = await FindOriginalVoucherAsync(dbContext, sourceType, sourceId, cancellationToken);
        if (originalVoucher is null)
        {
            return null;
        }

        if (originalVoucher.Status == JournalVoucherStatus.Reversed)
        {
            return "Journal voucher is already reversed.";
        }

        var reversalVoucherNo = await GenerateReversalVoucherNoAsync(
            dbContext,
            voucherType,
            originalVoucher.VoucherNo,
            cancellationToken);
        var now = DateTime.UtcNow;

        originalVoucher.Status = JournalVoucherStatus.Reversed;
        originalVoucher.UpdatedAtUtc = now;

        var reversalVoucher = new JournalVoucher
        {
            VoucherType = voucherType,
            VoucherNo = reversalVoucherNo,
            PostingDate = reversalDate,
            Status = JournalVoucherStatus.Posted,
            SourceType = sourceType,
            SourceId = sourceId,
            Narration = originalVoucher.Narration,
            ReversesJournalVoucherId = originalVoucher.Id,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        reversalVoucher.Entries = originalVoucher.Entries
            .OrderBy(current => current.LineNo)
            .Select((entry, index) => new JournalEntry
            {
                JournalVoucherId = reversalVoucher.Id,
                JournalVoucher = reversalVoucher,
                LineNo = index + 1,
                PostingDate = reversalDate,
                VoucherType = voucherType,
                VoucherNo = reversalVoucherNo,
                SourceType = sourceType,
                SourceId = sourceId,
                LedgerId = entry.LedgerId,
                SubLedgerType = entry.SubLedgerType,
                SubLedgerId = entry.SubLedgerId,
                SubLedgerCodeSnapshot = entry.SubLedgerCodeSnapshot,
                SubLedgerNameSnapshot = entry.SubLedgerNameSnapshot,
                Narration = entry.Narration,
                DebitAmount = entry.CreditAmount,
                CreditAmount = entry.DebitAmount,
                CreatedAtUtc = now
            })
            .ToList();

        dbContext.JournalVouchers.Add(reversalVoucher);
        return null;
    }

    private static async Task<bool> HasOriginalVoucherAsync(
        AppDbContext dbContext,
        JournalSourceType sourceType,
        Guid sourceId,
        CancellationToken cancellationToken)
    {
        if (dbContext.JournalVouchers.Local.Any(current =>
                current.SourceType == sourceType &&
                current.SourceId == sourceId &&
                current.ReversesJournalVoucherId is null))
        {
            return true;
        }

        return await dbContext.JournalVouchers.AnyAsync(
            current =>
                current.SourceType == sourceType &&
                current.SourceId == sourceId &&
                current.ReversesJournalVoucherId == null,
            cancellationToken);
    }

    private static async Task<JournalVoucher?> FindOriginalVoucherAsync(
        AppDbContext dbContext,
        JournalSourceType sourceType,
        Guid sourceId,
        CancellationToken cancellationToken)
    {
        var localVoucher = dbContext.JournalVouchers.Local.FirstOrDefault(current =>
            current.SourceType == sourceType &&
            current.SourceId == sourceId &&
            current.ReversesJournalVoucherId == null);
        if (localVoucher is not null)
        {
            if (localVoucher.Entries.Count == 0)
            {
                await dbContext.Entry(localVoucher).Collection(current => current.Entries).LoadAsync(cancellationToken);
            }

            return localVoucher;
        }

        return await dbContext.JournalVouchers
            .Include(current => current.Entries)
            .FirstOrDefaultAsync(
                current =>
                    current.SourceType == sourceType &&
                    current.SourceId == sourceId &&
                    current.ReversesJournalVoucherId == null,
                cancellationToken);
    }

    private static async Task<bool> VoucherNoExistsAsync(
        AppDbContext dbContext,
        JournalVoucherType voucherType,
        string voucherNo,
        CancellationToken cancellationToken)
    {
        if (dbContext.JournalVouchers.Local.Any(current =>
                current.VoucherType == voucherType &&
                current.VoucherNo == voucherNo))
        {
            return true;
        }

        return await dbContext.JournalVouchers.AnyAsync(
            current => current.VoucherType == voucherType && current.VoucherNo == voucherNo,
            cancellationToken);
    }

    private static async Task<string> GenerateReversalVoucherNoAsync(
        AppDbContext dbContext,
        JournalVoucherType voucherType,
        string originalVoucherNo,
        CancellationToken cancellationToken)
    {
        var candidate = BuildVoucherNo(originalVoucherNo, "/REV");
        if (!await VoucherNoExistsAsync(dbContext, voucherType, candidate, cancellationToken))
        {
            return candidate;
        }

        for (var sequence = 2; sequence < int.MaxValue; sequence++)
        {
            candidate = BuildVoucherNo(originalVoucherNo, $"/REV{sequence}");
            if (!await VoucherNoExistsAsync(dbContext, voucherType, candidate, cancellationToken))
            {
                return candidate;
            }
        }

        throw new InvalidOperationException("Unable to generate a unique reversal voucher number.");
    }

    private static string BuildVoucherNo(string originalVoucherNo, string suffix)
    {
        var source = originalVoucherNo.Trim();
        var maxSourceLength = Math.Max(1, VoucherNoMaxLength - suffix.Length);
        if (source.Length > maxSourceLength)
        {
            source = source[..maxSourceLength];
        }

        return $"{source}{suffix}";
    }

    private static decimal RoundAmount(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);
}

internal sealed record AutoJournalVoucherDraft(
    JournalVoucherType VoucherType,
    JournalSourceType SourceType,
    Guid SourceId,
    string VoucherNo,
    DateOnly PostingDate,
    string? Narration,
    IReadOnlyList<AutoJournalPostingLine> Lines);

internal sealed record AutoJournalPostingLine(
    Guid LedgerId,
    decimal DebitAmount,
    decimal CreditAmount,
    SubLedgerType? SubLedgerType = null,
    Guid? SubLedgerId = null,
    string? SubLedgerCodeSnapshot = null,
    string? SubLedgerNameSnapshot = null);

internal sealed record AutoJournalReversalRequest(
    JournalVoucherType VoucherType,
    JournalSourceType SourceType,
    Guid SourceId,
    DateOnly ReversalDate);
