using backend.Features.Auth;
using backend.Infrastructure.Persistence;

namespace backend.Features.Transactions.PurchaseInvoiceAi;

internal static class PurchaseInvoiceAiHandlers
{
    private const long MaxPdfSizeBytes = 10 * 1024 * 1024;

    

    internal static async Task<IResult> MapAsync(
        IFormFile? file,
        PurchaseInvoiceAiMappingService mappingService,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "Please upload a PDF file.", null));
        }

        var isPdf =
            string.Equals(file.ContentType, "application/pdf", StringComparison.OrdinalIgnoreCase) ||
            file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase);
        if (!isPdf)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "Only PDF files are supported.", null));
        }

        if (file.Length > MaxPdfSizeBytes)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, "PDF size must be 10 MB or less.", null));
        }

        await using var stream = file.OpenReadStream();
        var (result, error) = await mappingService.MapAsync(stream, file.FileName, dbContext, cancellationToken);

        if (error is not null)
        {
            return Results.Json(
                new ApiResponse<object>(false, error, null),
                statusCode: StatusCodes.Status502BadGateway);
        }

        return TypedResults.Ok(new ApiResponse<PurchaseInvoiceAiMappingResponse>(
            true,
            "Purchase invoice mapped successfully.",
            result));
    }

    internal static async Task<IResult> MasterMatchAsync(
        PurchaseInvoiceAiMasterMatchRequest request,
        PurchaseInvoiceAiMasterMatchService matchService,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var result = await matchService.MatchAsync(request, dbContext, cancellationToken);

        return TypedResults.Ok(new ApiResponse<PurchaseInvoiceAiMasterMatchResponse>(
            true,
            "Purchase invoice master match completed successfully.",
            result));
    }
}

