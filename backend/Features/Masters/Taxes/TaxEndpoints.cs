using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Taxes;

public static class TaxEndpoints
{
    public static IEndpointRouteBuilder MapTaxEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/taxes").WithTags("Tax Masters");

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
        var taxes = await dbContext.Taxes
            .Include(tax => tax.Slabs)
            .OrderBy(tax => tax.Name)
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<TaxDto>>(
            true,
            "Tax list fetched successfully.",
            taxes.Select(TaxDto.FromEntity).ToList()));
    }

    private static async Task<IResult> GetByIdAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var tax = await dbContext.Taxes
            .Include(current => current.Slabs)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return tax is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Tax not found.", null))
            : TypedResults.Ok(new ApiResponse<TaxDto>(
                true,
                "Tax fetched successfully.",
                TaxDto.FromEntity(tax)));
    }

    private static async Task<IResult> CreateAsync(
        CreateTaxRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildTaxRequest(
            request.Name,
            request.Code,
            request.Description,
            request.Type,
            request.Rate,
            request.Slabs,
            request.Status);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        var duplicateExists = await dbContext.Taxes.AnyAsync(
            tax => tax.Code == buildResult.Code || tax.Name == buildResult.Name,
            cancellationToken);

        if (duplicateExists)
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Tax with this code or name already exists.", null));
        }

        var now = DateTime.UtcNow;
        var tax = new Tax
        {
            Name = buildResult.Name,
            Code = buildResult.Code,
            Description = buildResult.Description,
            Type = buildResult.Type,
            Rate = buildResult.Rate,
            Status = buildResult.Status,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
            Slabs = buildResult.Slabs
                .Select(slab => new TaxSlab
                {
                    FromAmount = slab.FromAmount,
                    ToAmount = slab.ToAmount,
                    Rate = slab.Rate
                })
                .ToList()
        };

        dbContext.Taxes.Add(tax);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Created($"/api/masters/taxes/{tax.Id}", new ApiResponse<TaxDto>(
            true,
            "Tax created successfully.",
            TaxDto.FromEntity(tax)));
    }

    private static async Task<IResult> UpdateAsync(
        Guid id,
        UpdateTaxRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var buildResult = BuildTaxRequest(
            request.Name,
            request.Code,
            request.Description,
            request.Type,
            request.Rate,
            request.Slabs,
            request.Status);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        var tax = await dbContext.Taxes
            .Include(current => current.Slabs)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        if (tax is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Tax not found.", null));
        }

        var duplicateExists = await dbContext.Taxes.AnyAsync(
            current => current.Id != id && (current.Code == buildResult.Code || current.Name == buildResult.Name),
            cancellationToken);

        if (duplicateExists)
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Tax with this code or name already exists.", null));
        }

        tax.Name = buildResult.Name;
        tax.Code = buildResult.Code;
        tax.Description = buildResult.Description;
        tax.Type = buildResult.Type;
        tax.Rate = buildResult.Rate;
        tax.Status = buildResult.Status;
        tax.UpdatedAtUtc = DateTime.UtcNow;

        dbContext.TaxSlabs.RemoveRange(tax.Slabs);
        tax.Slabs = buildResult.Slabs
            .Select(slab => new TaxSlab
            {
                TaxId = tax.Id,
                FromAmount = slab.FromAmount,
                ToAmount = slab.ToAmount,
                Rate = slab.Rate
            })
            .ToList();

        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<TaxDto>(
            true,
            "Tax updated successfully.",
            TaxDto.FromEntity(tax)));
    }

    private static async Task<IResult> DeleteAsync(
        Guid id,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var tax = await dbContext.Taxes
            .Include(current => current.Slabs)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        if (tax is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Tax not found.", null));
        }

        dbContext.Taxes.Remove(tax);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Tax deleted successfully.", null));
    }

    private static TaxRequestBuildResult BuildTaxRequest(
        string? name,
        string? code,
        string? description,
        string? type,
        decimal? rate,
        IReadOnlyList<TaxSlabRequest>? slabs,
        string? status)
    {
        var normalizedName = name?.Trim() ?? string.Empty;
        var normalizedCode = code?.Trim().ToUpperInvariant() ?? string.Empty;
        var normalizedDescription = description?.Trim() ?? string.Empty;
        var normalizedType = type?.Trim().ToLowerInvariant() ?? string.Empty;
        var normalizedRate = rate;
        var normalizedSlabs = slabs?.ToList() ?? [];
        var normalizedStatus = string.IsNullOrWhiteSpace(status) ? TaxStatuses.Active : status.Trim();

        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return new TaxRequestBuildResult("Tax name is required.");
        }

        if (normalizedName.Length > 150)
        {
            return new TaxRequestBuildResult("Tax name cannot exceed 150 characters.");
        }

        if (string.IsNullOrWhiteSpace(normalizedCode))
        {
            return new TaxRequestBuildResult("Tax code is required.");
        }

        if (normalizedCode.Length > 50)
        {
            return new TaxRequestBuildResult("Tax code cannot exceed 50 characters.");
        }

        if (normalizedDescription.Length > 500)
        {
            return new TaxRequestBuildResult("Tax description cannot exceed 500 characters.");
        }

        if (!TaxTypes.All.Contains(normalizedType, StringComparer.OrdinalIgnoreCase))
        {
            return new TaxRequestBuildResult("Tax type must be percentage, fixed, or slab.");
        }

        var requestedType = normalizedType;
        normalizedType = TaxTypes.All.First(value => value.Equals(requestedType, StringComparison.OrdinalIgnoreCase));

        if (!TaxStatuses.All.Contains(normalizedStatus, StringComparer.OrdinalIgnoreCase))
        {
            return new TaxRequestBuildResult("Status must be Active, Inactive, or Draft.");
        }

        var requestedStatus = normalizedStatus;
        normalizedStatus = TaxStatuses.All.First(value => value.Equals(requestedStatus, StringComparison.OrdinalIgnoreCase));

        if (normalizedType == TaxTypes.Slab)
        {
            normalizedRate = null;

            if (normalizedSlabs.Count == 0)
            {
                return new TaxRequestBuildResult("At least one slab is required for slab taxes.");
            }

            foreach (var slab in normalizedSlabs)
            {
                if (slab.FromAmount < 0 || slab.ToAmount < 0 || slab.Rate < 0)
                {
                    return new TaxRequestBuildResult("Slab values cannot be negative.");
                }

                if (slab.ToAmount < slab.FromAmount)
                {
                    return new TaxRequestBuildResult("Slab 'to amount' must be greater than or equal to 'from amount'.");
                }
            }
        }
        else
        {
            normalizedSlabs = [];

            if (normalizedRate is null)
            {
                return new TaxRequestBuildResult("Rate is required for percentage or fixed taxes.");
            }

            if (normalizedRate < 0)
            {
                return new TaxRequestBuildResult("Rate cannot be negative.");
            }
        }

        return new TaxRequestBuildResult(
            null,
            normalizedName,
            normalizedCode,
            normalizedDescription,
            normalizedType,
            normalizedRate,
            normalizedSlabs,
            normalizedStatus);
    }

    private sealed record TaxRequestBuildResult(
        string? Error,
        string Name = "",
        string Code = "",
        string Description = "",
        string Type = "",
        decimal? Rate = null,
        IReadOnlyList<TaxSlabRequest>? Slabs = null,
        string Status = "")
    {
        public IReadOnlyList<TaxSlabRequest> Slabs { get; init; } = Slabs ?? [];
    }
}
