namespace backend.Features.Transactions.PurchaseInvoiceAi;

public sealed record PurchaseInvoiceAiMasterMatchRequest(
    string VendorName,
    IReadOnlyList<PurchaseInvoiceAiMasterMatchItemRequest> Items);

public sealed record PurchaseInvoiceAiMasterMatchItemRequest(
    int RowIndex,
    string ProductName,
    string UomName);

public sealed record PurchaseInvoiceAiMasterMatchResponse(
    PurchaseInvoiceAiVendorMasterMatchResult Vendor,
    IReadOnlyList<PurchaseInvoiceAiLineItemMasterMatchResult> Items,
    IReadOnlyList<PurchaseInvoiceAiMasterMatchStep> MissingSteps,
    bool HasMissingMasters);

public sealed record PurchaseInvoiceAiVendorMasterMatchResult(
    string SourceName,
    Guid? MatchedVendorId,
    bool IsMatched);

public sealed record PurchaseInvoiceAiLineItemMasterMatchResult(
    int RowIndex,
    string SourceProductName,
    string SourceUomName,
    Guid? MatchedProductId,
    Guid? MatchedUomId,
    bool IsProductMatched,
    bool IsUomMatched);

public sealed record PurchaseInvoiceAiMasterMatchStep(
    string Kind,
    string Title,
    string Description,
    int? RowIndex,
    string SourceName);
