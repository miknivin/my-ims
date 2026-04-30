using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Transactions.PurchaseInvoiceAi;

public sealed class PurchaseInvoiceAiMasterMatchService
{
    public async Task<PurchaseInvoiceAiMasterMatchResponse> MatchAsync(
        PurchaseInvoiceAiMasterMatchRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var normalizedVendorName = Normalize(request.VendorName);
        var vendors = await dbContext.Vendors
            .AsNoTracking()
            .Select(current => new { current.Id, current.BasicInfo.Name })
            .ToListAsync(cancellationToken);

        var vendor = vendors.FirstOrDefault(current =>
            Normalize(current.Name) == normalizedVendorName);

        var products = await dbContext.Products
            .AsNoTracking()
            .Select(current => new { current.Id, current.BasicInfo.Name })
            .ToListAsync(cancellationToken);

        var uoms = await dbContext.Uoms
            .AsNoTracking()
            .Select(current => new { current.Id, current.Name })
            .ToListAsync(cancellationToken);

        var itemResults = new List<PurchaseInvoiceAiLineItemMasterMatchResult>();
        var missingSteps = new List<PurchaseInvoiceAiMasterMatchStep>();

        var vendorResult = new PurchaseInvoiceAiVendorMasterMatchResult(
            request.VendorName?.Trim() ?? string.Empty,
            vendor?.Id,
            vendor is not null);

        if (vendor is null)
        {
            missingSteps.Add(new PurchaseInvoiceAiMasterMatchStep(
                "vendor",
                "Create or map vendor",
                $"No exact vendor name match found for '{request.VendorName?.Trim()}'.",
                null,
                request.VendorName?.Trim() ?? string.Empty));
        }

        foreach (var item in request.Items)
        {
            var normalizedProductName = Normalize(item.ProductName);
            var normalizedUomName = Normalize(item.UomName);

            var product = products.FirstOrDefault(current =>
                Normalize(current.Name) == normalizedProductName);
            var uom = uoms.FirstOrDefault(current =>
                Normalize(current.Name) == normalizedUomName);

            itemResults.Add(new PurchaseInvoiceAiLineItemMasterMatchResult(
                item.RowIndex,
                item.ProductName?.Trim() ?? string.Empty,
                item.UomName?.Trim() ?? string.Empty,
                product?.Id,
                uom?.Id,
                product is not null,
                uom is not null));

            if (product is null)
            {
                missingSteps.Add(new PurchaseInvoiceAiMasterMatchStep(
                    "product",
                    $"Resolve product for line {item.RowIndex + 1}",
                    $"No exact product name match found for '{item.ProductName?.Trim()}'.",
                    item.RowIndex,
                    item.ProductName?.Trim() ?? string.Empty));
            }

            if (uom is null)
            {
                missingSteps.Add(new PurchaseInvoiceAiMasterMatchStep(
                    "uom",
                    $"Resolve UOM for line {item.RowIndex + 1}",
                    $"No exact UOM name match found for '{item.UomName?.Trim()}'.",
                    item.RowIndex,
                    item.UomName?.Trim() ?? string.Empty));
            }
        }

        return new PurchaseInvoiceAiMasterMatchResponse(
            vendorResult,
            itemResults,
            missingSteps,
            missingSteps.Count > 0);
    }

    private static string Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value)
            ? string.Empty
            : value.Trim().ToUpperInvariant();
}
