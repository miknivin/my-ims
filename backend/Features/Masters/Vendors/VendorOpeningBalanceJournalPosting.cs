using backend.Features.Accounting.Journals;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Vendors;

internal static class VendorOpeningBalanceJournalPosting
{
    public static async Task<string?> PreparePostAsync(
        AppDbContext dbContext,
        Vendor vendor,
        CancellationToken cancellationToken)
    {
        var ob = vendor.OpeningBalance;
        if (ob is null) return null;

        var obeLedger = await LoadObeledgerAsync(dbContext, cancellationToken);
        if (obeLedger is null)
            return "Opening Balance Equity ledger not found. Ensure system seeder has run.";

        if (vendor.LedgerId is null)
            return "Vendor must have a linked ledger before posting opening balance.";

        var voucherNo = await BuildVoucherNoAsync(dbContext, vendor.Id, vendor.BasicInfo.Code, cancellationToken);
        return AddVoucher(dbContext, vendor, obeLedger.Id, ob.Amount, ob.BalanceType, ob.AsOfDate, voucherNo);
    }

    public static async Task<string?> PrepareUpdateAsync(
        AppDbContext dbContext,
        Vendor vendor,
        bool hadPreviousOb,
        CancellationToken cancellationToken)
    {
        if (hadPreviousOb)
        {
            var reverseError = await ReverseActiveVoucherAsync(dbContext, vendor.Id, DateOnly.FromDateTime(DateTime.UtcNow), cancellationToken);
            if (reverseError is not null)
                return reverseError;
        }

        var ob = vendor.OpeningBalance;
        if (ob is null) return null;

        var obeLedger = await LoadObeledgerAsync(dbContext, cancellationToken);
        if (obeLedger is null)
            return "Opening Balance Equity ledger not found. Ensure system seeder has run.";

        if (vendor.LedgerId is null)
            return "Vendor must have a linked ledger before posting opening balance.";

        var voucherNo = await BuildVoucherNoAsync(dbContext, vendor.Id, vendor.BasicInfo.Code, cancellationToken);
        return AddVoucher(dbContext, vendor, obeLedger.Id, ob.Amount, ob.BalanceType, ob.AsOfDate, voucherNo);
    }

    private static string? AddVoucher(
        AppDbContext dbContext,
        Vendor vendor,
        Guid obeLedgerId,
        decimal amount,
        string balanceType,
        DateOnly postingDate,
        string voucherNo)
    {
        if (vendor.LedgerId is null)
            return "Vendor must have a linked ledger before posting opening balance.";

        var isDebit = balanceType.Equals("Dr", StringComparison.OrdinalIgnoreCase);
        var vendorLedgerId = vendor.LedgerId.Value;
        var now = DateTime.UtcNow;
        var rounded = Round(amount);

        var voucher = new JournalVoucher
        {
            VoucherType = JournalVoucherType.OpeningBalance,
            VoucherNo = voucherNo,
            PostingDate = postingDate,
            Status = JournalVoucherStatus.Posted,
            SourceType = JournalSourceType.OpeningBalance,
            SourceId = vendor.Id,
            Narration = $"Opening balance — {vendor.BasicInfo.Name}",
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        voucher.Entries =
        [
            new JournalEntry
            {
                JournalVoucher = voucher,
                LineNo = 1,
                PostingDate = postingDate,
                VoucherType = JournalVoucherType.OpeningBalance,
                VoucherNo = voucherNo,
                SourceType = JournalSourceType.OpeningBalance,
                SourceId = vendor.Id,
                LedgerId = isDebit ? vendorLedgerId : obeLedgerId,
                SubLedgerType = isDebit ? SubLedgerType.Vendor : null,
                SubLedgerId = isDebit ? vendor.Id : null,
                SubLedgerCodeSnapshot = isDebit ? vendor.BasicInfo.Code : null,
                SubLedgerNameSnapshot = isDebit ? vendor.BasicInfo.Name : null,
                DebitAmount = rounded,
                CreditAmount = 0,
                CreatedAtUtc = now
            },
            new JournalEntry
            {
                JournalVoucher = voucher,
                LineNo = 2,
                PostingDate = postingDate,
                VoucherType = JournalVoucherType.OpeningBalance,
                VoucherNo = voucherNo,
                SourceType = JournalSourceType.OpeningBalance,
                SourceId = vendor.Id,
                LedgerId = isDebit ? obeLedgerId : vendorLedgerId,
                SubLedgerType = isDebit ? null : SubLedgerType.Vendor,
                SubLedgerId = isDebit ? null : vendor.Id,
                SubLedgerCodeSnapshot = isDebit ? null : vendor.BasicInfo.Code,
                SubLedgerNameSnapshot = isDebit ? null : vendor.BasicInfo.Name,
                DebitAmount = 0,
                CreditAmount = rounded,
                CreatedAtUtc = now
            }
        ];

        dbContext.JournalVouchers.Add(voucher);
        return null;
    }

    private static async Task<string?> ReverseActiveVoucherAsync(
        AppDbContext dbContext,
        Guid vendorId,
        DateOnly reversalDate,
        CancellationToken cancellationToken)
    {
        var original = await dbContext.JournalVouchers
            .Include(v => v.Entries)
            .Where(v =>
                v.SourceType == JournalSourceType.OpeningBalance &&
                v.SourceId == vendorId &&
                v.Status == JournalVoucherStatus.Posted &&
                v.ReversesJournalVoucherId == null)
            .OrderByDescending(v => v.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (original is null) return null;

        var baseRevNo = $"{original.VoucherNo}/REV";
        var revNo = await EnsureUniqueVoucherNoAsync(dbContext, baseRevNo, cancellationToken);
        var now = DateTime.UtcNow;

        original.Status = JournalVoucherStatus.Reversed;
        original.UpdatedAtUtc = now;

        var reversal = new JournalVoucher
        {
            VoucherType = JournalVoucherType.OpeningBalance,
            VoucherNo = revNo,
            PostingDate = reversalDate,
            Status = JournalVoucherStatus.Posted,
            SourceType = JournalSourceType.OpeningBalance,
            SourceId = vendorId,
            Narration = original.Narration,
            ReversesJournalVoucherId = original.Id,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        reversal.Entries = original.Entries
            .OrderBy(e => e.LineNo)
            .Select((entry, idx) => new JournalEntry
            {
                JournalVoucher = reversal,
                LineNo = idx + 1,
                PostingDate = reversalDate,
                VoucherType = JournalVoucherType.OpeningBalance,
                VoucherNo = revNo,
                SourceType = JournalSourceType.OpeningBalance,
                SourceId = vendorId,
                LedgerId = entry.LedgerId,
                SubLedgerType = entry.SubLedgerType,
                SubLedgerId = entry.SubLedgerId,
                SubLedgerCodeSnapshot = entry.SubLedgerCodeSnapshot,
                SubLedgerNameSnapshot = entry.SubLedgerNameSnapshot,
                DebitAmount = entry.CreditAmount,
                CreditAmount = entry.DebitAmount,
                CreatedAtUtc = now
            })
            .ToList();

        dbContext.JournalVouchers.Add(reversal);
        return null;
    }

    private static async Task<string> BuildVoucherNoAsync(
        AppDbContext dbContext,
        Guid vendorId,
        string code,
        CancellationToken cancellationToken)
    {
        var baseNo = $"OB/VEND/{code}";
        var existingCount = await dbContext.JournalVouchers.CountAsync(
            v => v.SourceType == JournalSourceType.OpeningBalance &&
                 v.SourceId == vendorId &&
                 v.ReversesJournalVoucherId == null,
            cancellationToken);
        return existingCount == 0 ? baseNo : $"{baseNo}/V{existingCount + 1}";
    }

    private static async Task<string> EnsureUniqueVoucherNoAsync(
        AppDbContext dbContext,
        string candidate,
        CancellationToken cancellationToken)
    {
        if (!await dbContext.JournalVouchers.AnyAsync(v => v.VoucherNo == candidate, cancellationToken))
            return candidate;

        for (var i = 2; i < int.MaxValue; i++)
        {
            var versioned = $"{candidate}{i}";
            if (!await dbContext.JournalVouchers.AnyAsync(v => v.VoucherNo == versioned, cancellationToken))
                return versioned;
        }

        throw new InvalidOperationException("Unable to generate a unique reversal voucher number.");
    }

    private static async Task<backend.Features.Masters.Ledgers.Ledger?> LoadObeledgerAsync(
        AppDbContext dbContext,
        CancellationToken cancellationToken) =>
        await dbContext.Ledgers.FirstOrDefaultAsync(
            l => l.Code == SystemLedgerSeeder.OpeningBalanceEquityCode,
            cancellationToken);

    private static decimal Round(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
