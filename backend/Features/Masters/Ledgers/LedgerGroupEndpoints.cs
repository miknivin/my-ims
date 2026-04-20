using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Ledgers;

public static class LedgerGroupEndpoints
{
    public static IEndpointRouteBuilder MapLedgerGroupEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/ledger-groups").WithTags("Ledger Group Masters");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPut("/{id:guid}", UpdateAsync);
        group.MapDelete("/{id:guid}", DeleteAsync);

        return app;
    }

    private static async Task<IResult> GetAllAsync(
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var groups = await dbContext.LedgerGroups
            .Include(current => current.ParentGroup)
            .OrderBy(current => current.Name)
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<LedgerGroupDto>>(
            true,
            "Ledger groups fetched successfully.",
            groups.Select(LedgerGroupDto.FromEntity).ToList()));
    }

    private static async Task<IResult> GetByIdAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var group = await dbContext.LedgerGroups
            .Include(current => current.ParentGroup)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return group is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Ledger group not found.", null))
            : TypedResults.Ok(new ApiResponse<LedgerGroupDto>(
                true,
                "Ledger group fetched successfully.",
                LedgerGroupDto.FromEntity(group)));
    }

    private static async Task<IResult> CreateAsync(
        CreateLedgerGroupRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildLedgerGroupRequest(
            request.Code,
            request.Name,
            request.Nature,
            request.Status);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.LedgerGroups.AnyAsync(
                current => current.Code == buildResult.Code || current.Name == buildResult.Name,
                cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Ledger group with this code or name already exists.", null));
        }

        var (parentGroup, referenceError) = await ResolveParentGroupAsync(request.ParentGroupId, dbContext, cancellationToken);
        if (referenceError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, referenceError, null));
        }

        var now = DateTime.UtcNow;
        var ledgerGroup = new LedgerGroup
        {
            Code = buildResult.Code,
            Name = buildResult.Name,
            Nature = buildResult.Nature,
            ParentGroupId = request.ParentGroupId,
            ParentGroup = parentGroup,
            Status = buildResult.Status,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.LedgerGroups.Add(ledgerGroup);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Created($"/api/masters/ledger-groups/{ledgerGroup.Id}", new ApiResponse<LedgerGroupDto>(
            true,
            "Ledger group created successfully.",
            LedgerGroupDto.FromEntity(ledgerGroup)));
    }

    private static async Task<IResult> UpdateAsync(
        Guid id,
        UpdateLedgerGroupRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildLedgerGroupRequest(
            request.Code,
            request.Name,
            request.Nature,
            request.Status);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        var ledgerGroup = await dbContext.LedgerGroups
            .Include(current => current.ParentGroup)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        if (ledgerGroup is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Ledger group not found.", null));
        }

        if (ledgerGroup.IsSystem)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "System ledger groups cannot be edited.", null));
        }

        if (await dbContext.LedgerGroups.AnyAsync(
                current => current.Id != id && (current.Code == buildResult.Code || current.Name == buildResult.Name),
                cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Ledger group with this code or name already exists.", null));
        }

        if (request.ParentGroupId == id)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "A ledger group cannot be its own parent.", null));
        }

        var (parentGroup, referenceError) = await ResolveParentGroupAsync(request.ParentGroupId, dbContext, cancellationToken);
        if (referenceError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, referenceError, null));
        }

        ledgerGroup.Code = buildResult.Code;
        ledgerGroup.Name = buildResult.Name;
        ledgerGroup.Nature = buildResult.Nature;
        ledgerGroup.ParentGroupId = request.ParentGroupId;
        ledgerGroup.ParentGroup = parentGroup;
        ledgerGroup.Status = buildResult.Status;
        ledgerGroup.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<LedgerGroupDto>(
            true,
            "Ledger group updated successfully.",
            LedgerGroupDto.FromEntity(ledgerGroup)));
    }

    private static async Task<IResult> DeleteAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var ledgerGroup = await dbContext.LedgerGroups.FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (ledgerGroup is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Ledger group not found.", null));
        }

        if (ledgerGroup.IsSystem)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "System ledger groups cannot be deleted.", null));
        }

        var hasChildren = await dbContext.LedgerGroups.AnyAsync(
            current => current.ParentGroupId == id,
            cancellationToken);

        if (hasChildren)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "Cannot delete a ledger group that has child groups.", null));
        }

        var hasLedgers = await dbContext.Ledgers.AnyAsync(current => current.LedgerGroupId == id, cancellationToken);
        if (hasLedgers)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "Cannot delete a ledger group that is linked to ledgers.", null));
        }

        dbContext.LedgerGroups.Remove(ledgerGroup);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Ledger group deleted successfully.", null));
    }

    private static async Task<(LedgerGroup? ParentGroup, string? Error)> ResolveParentGroupAsync(
        Guid? parentGroupId,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (parentGroupId is null)
        {
            return (null, null);
        }

        var parentGroup = await dbContext.LedgerGroups.FirstOrDefaultAsync(
            current => current.Id == parentGroupId.Value,
            cancellationToken);

        return parentGroup is null
            ? (null, "Selected parent ledger group does not exist.")
            : (parentGroup, null);
    }

    private static LedgerGroupRequestBuildResult BuildLedgerGroupRequest(
        string? code,
        string? name,
        string? nature,
        string? status)
    {
        var normalizedCode = code?.Trim().ToUpperInvariant() ?? string.Empty;
        var normalizedName = name?.Trim() ?? string.Empty;
        var normalizedNature = nature?.Trim() ?? string.Empty;
        var normalizedStatus = string.IsNullOrWhiteSpace(status) ? LedgerGroupStatuses.Active : status.Trim();

        if (string.IsNullOrWhiteSpace(normalizedCode))
        {
            return new LedgerGroupRequestBuildResult("Ledger group code is required.");
        }

        if (normalizedCode.Length < 2)
        {
            return new LedgerGroupRequestBuildResult("Ledger group code must be at least 2 characters.");
        }

        if (normalizedCode.Length > 20)
        {
            return new LedgerGroupRequestBuildResult("Ledger group code cannot exceed 20 characters.");
        }

        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return new LedgerGroupRequestBuildResult("Ledger group name is required.");
        }

        if (normalizedName.Length < 3)
        {
            return new LedgerGroupRequestBuildResult("Ledger group name must be at least 3 characters.");
        }

        if (normalizedName.Length > 100)
        {
            return new LedgerGroupRequestBuildResult("Ledger group name cannot exceed 100 characters.");
        }

        if (!LedgerGroupNatures.All.Contains(normalizedNature, StringComparer.OrdinalIgnoreCase))
        {
            return new LedgerGroupRequestBuildResult("Nature must be one of Asset, Liability, Income, Expense, or Equity.");
        }

        if (!LedgerGroupStatuses.All.Contains(normalizedStatus, StringComparer.OrdinalIgnoreCase))
        {
            return new LedgerGroupRequestBuildResult("Status must be either Active or Inactive.");
        }

        var requestedNature = normalizedNature;
        var requestedStatus = normalizedStatus;
        normalizedNature = LedgerGroupNatures.All.First(value => value.Equals(requestedNature, StringComparison.OrdinalIgnoreCase));
        normalizedStatus = LedgerGroupStatuses.All.First(value => value.Equals(requestedStatus, StringComparison.OrdinalIgnoreCase));
        return new LedgerGroupRequestBuildResult(null, normalizedCode, normalizedName, normalizedNature, normalizedStatus);
    }

    private sealed record LedgerGroupRequestBuildResult(
        string? Error,
        string Code = "",
        string Name = "",
        string Nature = "",
        string Status = "");
}
