using backend.Features.Auth;

namespace backend.Features.Transactions.PurchaseInvoiceAi;

public sealed record PurchaseInvoiceAiMappingResponse(
    PurchaseInvoiceAiDraftDto Draft,
    PurchaseInvoiceAiDeclaredTotalsDto DeclaredTotals,
    IReadOnlyList<string> Warnings,
    IReadOnlyList<string> UnresolvedFields);

public sealed record PurchaseInvoiceAiDraftDto(
    PurchaseInvoiceAiSourceReferenceDto SourceRef,
    PurchaseInvoiceAiDocumentDto Document,
    PurchaseInvoiceAiVendorInformationDto VendorInformation,
    PurchaseInvoiceAiFinancialDetailsDto FinancialDetails,
    PurchaseInvoiceAiProductInformationDto ProductInformation,
    PurchaseInvoiceAiGeneralDto General,
    IReadOnlyList<PurchaseInvoiceAiLineItemDto> Items,
    IReadOnlyList<PurchaseInvoiceAiAdditionDto> Additions,
    PurchaseInvoiceAiFooterDto Footer);

public sealed record PurchaseInvoiceAiSourceReferenceDto(string Type, Guid? ReferenceId, string No);

public sealed record PurchaseInvoiceAiDocumentDto(string No, string Date, string DueDate);

public sealed record PurchaseInvoiceAiVendorInformationDto(
    Guid? VendorId,
    string VendorLabel,
    string Address,
    string Attention,
    string Phone);

public sealed record PurchaseInvoiceAiFinancialDetailsDto(
    string PaymentMode,
    string SupplierInvoiceNo,
    string LrNo,
    Guid? CurrencyId,
    string CurrencyCode,
    string CurrencySymbol);

public sealed record PurchaseInvoiceAiProductInformationDto(string VendorProducts, bool OwnProductsOnly);

public sealed record PurchaseInvoiceAiGeneralDto(
    string Notes,
    string SearchBarcode,
    bool Taxable,
    string TaxApplication,
    bool InterState,
    bool TaxOnFoc);

public sealed record PurchaseInvoiceAiLineItemDto(
    int Sno,
    Guid? ProductId,
    string ProductCodeSnapshot,
    string ProductNameSnapshot,
    string HsnCode,
    Guid? UnitId,
    string UnitName,
    string Quantity,
    string Foc,
    string Rate,
    string DiscountPercent,
    string TaxPercent,
    string SellingRate,
    string WholesaleRate,
    string Mrp,
    Guid? WarehouseId,
    string WarehouseName);

public sealed record PurchaseInvoiceAiAdditionDto(
    string Type,
    Guid? LedgerId,
    string LedgerName,
    string Description,
    string Amount);

public sealed record PurchaseInvoiceAiFooterDto(string Notes);

public sealed record PurchaseInvoiceAiDeclaredTotalsDto(
    decimal? Subtotal,
    decimal? Tax,
    decimal? Addition,
    decimal? Deduction,
    decimal? NetTotal,
    decimal? ComputedNetTotal);

internal sealed record PurchaseInvoiceAiExtraction(
    string? DocumentNo,
    string? DocumentDate,
    string? DueDate,
    string? VendorName,
    string? VendorAddress,
    string? VendorAttention,
    string? VendorPhone,
    string? PaymentMode,
    string? SupplierInvoiceNo,
    string? LrNo,
    string? CurrencyCode,
    string? CurrencySymbol,
    string? Notes,
    bool? Taxable,
    string? TaxApplication,
    bool? InterState,
    bool? TaxOnFoc,
    IReadOnlyList<PurchaseInvoiceAiExtractedLine> Items,
    IReadOnlyList<PurchaseInvoiceAiExtractedAddition> Additions,
    PurchaseInvoiceAiExtractedTotals DeclaredTotals);

internal sealed record PurchaseInvoiceAiExtractedLine(
    string? ProductCode,
    string? ProductName,
    string? HsnCode,
    string? Unit,
    decimal? Quantity,
    decimal? Foc,
    decimal? Rate,
    decimal? DiscountPercent,
    decimal? TaxPercent,
    string? Warehouse,
    decimal? SellingRate,
    decimal? WholesaleRate,
    decimal? Mrp);

internal sealed record PurchaseInvoiceAiExtractedAddition(
    string? Type,
    string? Ledger,
    string? Description,
    decimal? Amount);

internal sealed record PurchaseInvoiceAiExtractedTotals(
    decimal? Subtotal,
    decimal? Tax,
    decimal? Addition,
    decimal? Deduction,
    decimal? NetTotal);

internal sealed record PurchaseInvoiceAiGatewayResponse(IReadOnlyList<PurchaseInvoiceAiGatewayChoice>? Choices);

internal sealed record PurchaseInvoiceAiGatewayChoice(PurchaseInvoiceAiGatewayMessage? Message);

internal sealed record PurchaseInvoiceAiGatewayMessage(string? Content);
