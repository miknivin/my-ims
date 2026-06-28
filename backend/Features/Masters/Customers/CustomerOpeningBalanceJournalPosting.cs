using backend.Features.Accounting.Journals;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Customers;

internal static class CustomerOpeningBalanceJournalPosting
{
    public static async Task<string?> PreparePostAsync(
        AppDbContext dbContext,
        Customer customer,
        CancellationToken cancellationToken)
    {
        var ob = customer.OpeningBalance;
        if (ob is null) return null;

        var obeLedger = await LoadObeledgerAsync(dbContext, cancellationToken);
        if (obeLedger is null)
            return "Opening Balance Equity ledger not found. Ensure system seeder has run.";

        if (customer.LedgerId is null)
            return "Customer must have a linked ledger before posting opening balance.";

        var voucherNo = await BuildVoucherNoAsync(dbContext, customer.Id, customer.BasicDetails.Code, cancellationToken);
        return AddVoucher(dbContext, customer, obeLedger.Id, ob.Amount, ob.BalanceType, ob.AsOfDate, voucherNo);
    }

    public static async Task<string?> PrepareUpdateAsync(
        AppDbContext dbContext,
        Customer customer,
        bool hadPreviousOb,
        CancellationToken cancellationToken)
    {
        if (hadPreviousOb)
        {
            var reverseError = await ReverseActiveVoucherAsync(dbContext, customer.Id, DateOnly.FromDateTime(DateTime.UtcNow), cancellationToken);
            if (reverseError is not null)
                return reverseError;
        }

        var ob = customer.OpeningBalance;
        if (ob is null) return null;

        var obeLedger = await LoadObeledgerAsync(dbContext, cancellationToken);
        if (obeLedger is null)
            return "Opening Balance Equity ledger not found. Ensure system seeder has run.";

        if (customer.LedgerId is null)
            return "Customer must have a linked ledger before posting opening balance.";

        var voucherNo = await BuildVoucherNoAsync(dbContext, customer.Id, customer.BasicDetails.Code, cancellationToken);
        return AddVoucher(dbContext, customer, obeLedger.Id, ob.Amount, ob.BalanceType, ob.AsOfDate, voucherNo);
    }

    private static string? AddVoucher(
        AppDbContext dbContext,
        Customer customer,
        Guid obeLedgerId,
        decimal amount,
        string balanceType,
        DateOnly postingDate,
        string voucherNo)
    {
        if (customer.LedgerId is null)
            return "Customer must have a linked ledger before posting opening balance.";

        var isDebit = balanceType.Equals("Dr", StringComparison.OrdinalIgnoreCase);
        var customerLedgerId = customer.LedgerId.Value;
        var now = DateTime.UtcNow;
        var rounded = Round(amount);

        var voucher = new JournalVoucher
        {
            VoucherType = JournalVoucherType.OpeningBalance,
            VoucherNo = voucherNo,
            PostingDate = postingDate,
            Status = JournalVoucherStatus.Posted,
            SourceType = JournalSourceType.OpeningBalance,
            SourceId = customer.Id,
            Narration = $"Opening balance — {customer.BasicDetails.Name}",
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
                SourceId = customer.Id,
                LedgerId = isDebit ? customerLedgerId : obeLedgerId,
                SubLedgerType = isDebit ? SubLedgerType.Customer : null,
                SubLedgerId = isDebit ? customer.Id : null,
                SubLedgerCodeSnapshot = isDebit ? customer.BasicDetails.Code : null,
                SubLedgerNameSnapshot = isDebit ? customer.BasicDetails.Name : null,
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
                SourceId = customer.Id,
                LedgerId = isDebit ? obeLedgerId : customerLedgerId,
                SubLedgerType = isDebit ? null : SubLedgerType.Customer,
                SubLedgerId = isDebit ? null : customer.Id,
                SubLedgerCodeSnapshot = isDebit ? null : customer.BasicDetails.Code,
                SubLedgerNameSnapshot = isDebit ? null : customer.BasicDetails.Name,
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
        Guid customerId,
        DateOnly reversalDate,
        CancellationToken cancellationToken)
    {
        var original = await dbContext.JournalVouchers
            .Include(v => v.Entries)
            .Where(v =>
                v.SourceType == JournalSourceType.OpeningBalance &&
                v.SourceId == customerId &&
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
            SourceId = customerId,
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
                SourceId = customerId,
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
        Guid customerId,
        string code,
        CancellationToken cancellationToken)
    {
        var baseNo = $"OB/CUST/{code}";
        var existingCount = await dbContext.JournalVouchers.CountAsync(
            v => v.SourceType == JournalSourceType.OpeningBalance &&
                 v.SourceId == customerId &&
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
