using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Filtering;
using backend.Infrastructure.Persistence;
using backend.Infrastructure.Sse;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Accounting.Journals;

internal static class JournalVoucherHandlers
{
    internal static async Task<IResult> GetListAsync(
        [AsParameters] JournalVoucherFilter filter,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (filter.FromDate is not null && filter.ToDate is not null && filter.FromDate > filter.ToDate)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "From date cannot be greater than to date.", null));
        }

        var page = filter.GetNormalizedPage();
        var limit = filter.GetNormalizedLimit();
        var status = NormalizeStatus(filter.Status);
        var source = NormalizeSource(filter.Source);
        var keyword = filter.Keyword?.Trim();
        var keywordPattern = $"%{keyword}%";

        var query = dbContext.JournalVouchers
            .AsNoTracking()
            .WhereIf(filter.FromDate is not null, current => current.PostingDate >= filter.FromDate!.Value)
            .WhereIf(filter.ToDate is not null, current => current.PostingDate <= filter.ToDate!.Value)
            .WhereIf(status is not null, current => current.Status == status!.Value)
            .WhereIf(source == "Manual", current => current.VoucherType == JournalVoucherType.ManualJournal)
            .WhereIf(source == "Auto", current => current.VoucherType != JournalVoucherType.ManualJournal)
            .WhereIf(!string.IsNullOrWhiteSpace(keyword), current =>
                EF.Functions.ILike(current.VoucherNo, keywordPattern) ||
                (current.Narration != null && EF.Functions.ILike(current.Narration, keywordPattern)));

        var total = await query.CountAsync(cancellationToken);
        var rows = await ApplySorting(query, filter.SortBy)
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(current => new JournalVoucherListItemDto(
                current.Id,
                current.VoucherNo,
                current.PostingDate,
                current.VoucherType == JournalVoucherType.ManualJournal ? "Manual" : "Auto",
                current.Status == JournalVoucherStatus.Posted
                    ? "Posted"
                    : current.Status == JournalVoucherStatus.Reversed
                        ? "Reversed"
                        : "Draft",
                current.Narration,
                current.Entries.Sum(entry => entry.DebitAmount),
                current.Entries.Sum(entry => entry.CreditAmount)))
            .ToListAsync(cancellationToken);

        var response = JournalVoucherListResponse.FromPaged(
            PagedResponse<JournalVoucherListItemDto>.Create(
                rows,
                page,
                limit,
                total,
                filter.SortBy,
                filter.Keyword));

        return TypedResults.Ok(new ApiResponse<JournalVoucherListResponse>(
            true,
            "Journal voucher list fetched successfully.",
            response));
    }

    internal static async Task<IResult> GetByIdAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var voucher = await dbContext.JournalVouchers
            .AsNoTracking()
            .Include(current => current.Entries.OrderBy(entry => entry.LineNo))
            .ThenInclude(current => current.Ledger)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return voucher is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Journal voucher not found.", null))
            : TypedResults.Ok(new ApiResponse<JournalVoucherDto>(
                true,
                "Journal voucher fetched successfully.",
                JournalVoucherDto.FromEntity(voucher)));
    }

    internal static async Task<IResult> CreateManualAsync(
        CreateManualJournalVoucherRequest request,
        AppDbContext dbContext,
        ReportInvalidationService sseService,
        CancellationToken cancellationToken)
    {
        var validationError = await ValidateCreateManualAsync(request, dbContext, cancellationToken);
        if (validationError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, validationError, null));
        }

        var voucherNo = request.VoucherNo.Trim();
        if (await dbContext.JournalVouchers.AnyAsync(
                current => current.VoucherType == JournalVoucherType.ManualJournal && current.VoucherNo == voucherNo,
                cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Journal voucher number already exists.", null));
        }

        var ledgerIds = request.Entries.Select(current => current.LedgerId).Distinct().ToList();
        var ledgers = await dbContext.Ledgers
            .Where(current => ledgerIds.Contains(current.Id))
            .ToDictionaryAsync(current => current.Id, cancellationToken);
        var missingLedger = ledgerIds.FirstOrDefault(current => !ledgers.ContainsKey(current));
        if (missingLedger != Guid.Empty)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "Selected ledger was not found.", null));
        }

        if (ledgers.Values.Any(current => current.Status != LedgerStatuses.Active || !current.AllowManualPosting))
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "Selected ledger is not available for manual posting.", null));
        }

        var now = DateTime.UtcNow;
        var effectiveLines = request.Entries
            .Where(current => current.DebitAmount > 0 || current.CreditAmount > 0)
            .ToList();
        var voucher = new JournalVoucher
        {
            VoucherType = JournalVoucherType.ManualJournal,
            VoucherNo = voucherNo,
            PostingDate = request.PostingDate,
            Status = JournalVoucherStatus.Posted,
            SourceType = JournalSourceType.ManualJournal,
            Narration = NormalizeText(request.Narration),
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        voucher.Entries = effectiveLines
            .Select((line, index) => new JournalEntry
            {
                JournalVoucherId = voucher.Id,
                JournalVoucher = voucher,
                LineNo = index + 1,
                PostingDate = request.PostingDate,
                VoucherType = JournalVoucherType.ManualJournal,
                VoucherNo = voucherNo,
                SourceType = JournalSourceType.ManualJournal,
                LedgerId = line.LedgerId,
                Narration = NormalizeText(request.Narration),
                DebitAmount = RoundAmount(line.DebitAmount),
                CreditAmount = RoundAmount(line.CreditAmount),
                CreatedAtUtc = now
            })
            .ToList();

        dbContext.JournalVouchers.Add(voucher);
        await dbContext.SaveChangesAsync(cancellationToken);
        sseService.Publish(InvalidationGroups.JournalPosted);

        var created = await dbContext.JournalVouchers
            .AsNoTracking()
            .Include(current => current.Entries.OrderBy(entry => entry.LineNo))
            .ThenInclude(current => current.Ledger)
            .FirstAsync(current => current.Id == voucher.Id, cancellationToken);

        return TypedResults.Created(
            $"/api/operations/accounting/journal-vouchers/{voucher.Id}",
            new ApiResponse<JournalVoucherDto>(
                true,
                "Manual journal voucher posted successfully.",
                JournalVoucherDto.FromEntity(created)));
    }

    private static async Task<string?> ValidateCreateManualAsync(
        CreateManualJournalVoucherRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.VoucherNo))
        {
            return "Voucher number is required.";
        }

        if (request.VoucherNo.Trim().Length > 50)
        {
            return "Voucher number cannot exceed 50 characters.";
        }

        if (request.Entries.Count < 2)
        {
            return "Journal voucher must contain at least two entries.";
        }

        var effectiveLines = request.Entries
            .Where(current => current.DebitAmount > 0 || current.CreditAmount > 0)
            .ToList();
        if (effectiveLines.Count < 2)
        {
            return "Journal voucher must contain at least two non-zero entries.";
        }

        if (effectiveLines.Any(current => current.LedgerId == Guid.Empty))
        {
            return "Ledger is required for every non-zero entry.";
        }

        if (effectiveLines.Any(current => current.DebitAmount < 0 || current.CreditAmount < 0))
        {
            return "Debit and credit amounts cannot be negative.";
        }

        if (effectiveLines.Any(current => current.DebitAmount > 0 && current.CreditAmount > 0))
        {
            return "A journal entry line cannot have both debit and credit amounts.";
        }

        var totalDebit = RoundAmount(effectiveLines.Sum(current => current.DebitAmount));
        var totalCredit = RoundAmount(effectiveLines.Sum(current => current.CreditAmount));
        if (totalDebit <= 0 || totalDebit != totalCredit)
        {
            return "Journal voucher is not balanced.";
        }

        var ledgerIds = effectiveLines.Select(current => current.LedgerId).Distinct().ToList();
        var existingLedgerCount = await dbContext.Ledgers
            .CountAsync(current => ledgerIds.Contains(current.Id), cancellationToken);
        return existingLedgerCount == ledgerIds.Count ? null : "Selected ledger was not found.";
    }

    private static IQueryable<JournalVoucher> ApplySorting(
        IQueryable<JournalVoucher> query,
        string? sortBy) =>
        sortBy?.Trim() switch
        {
            "date" => query.OrderBy(current => current.PostingDate).ThenBy(current => current.VoucherNo),
            "voucherNo" => query.OrderBy(current => current.VoucherNo),
            "voucherNo_desc" => query.OrderByDescending(current => current.VoucherNo),
            _ => query.OrderByDescending(current => current.PostingDate).ThenByDescending(current => current.VoucherNo)
        };

    private static JournalVoucherStatus? NormalizeStatus(string? value) =>
        value?.Trim() switch
        {
            "Draft" => JournalVoucherStatus.Draft,
            "Posted" => JournalVoucherStatus.Posted,
            "Reversed" => JournalVoucherStatus.Reversed,
            _ => null
        };

    private static string? NormalizeSource(string? value) =>
        value?.Trim() switch
        {
            "Manual" => "Manual",
            "Auto" => "Auto",
            _ => null
        };

    private static string? NormalizeText(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }

    private static decimal RoundAmount(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
