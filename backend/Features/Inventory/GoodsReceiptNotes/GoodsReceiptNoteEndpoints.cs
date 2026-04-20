using backend.Features.Masters.Products;
using backend.Features.Masters.Uoms;
using backend.Features.Masters.Vendors;
using backend.Features.Masters.Warehouses;
using backend.Features.Transactions.PurchaseOrders;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Inventory.GoodsReceiptNotes;

public static class GoodsReceiptNoteEndpoints
{
    public static IEndpointRouteBuilder MapGoodsReceiptNoteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/inventory/goods-receipt-notes").WithTags("Goods Receipt Notes");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPut("/{id:guid}", UpdateAsync);
        group.MapDelete("/{id:guid}", DeleteAsync);

        return app;
    }

    private static IQueryable<GoodsReceiptNote> BuildQuery(AppDbContext dbContext)
    {
        return dbContext.GoodsReceiptNotes
            .Include(current => current.VendorInformation.Vendor)
            .Include(current => current.Items)
                .ThenInclude(item => item.Unit)
            .Include(current => current.Items)
                .ThenInclude(item => item.Warehouse);
    }

    private static async Task<IResult> GetAllAsync(AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var goodsReceiptNotes = await dbContext.GoodsReceiptNotes
            .AsNoTracking()
            .OrderByDescending(current => current.UpdatedAtUtc)
            .Select(current => new GoodsReceiptNoteListItemDto(
                current.Id,
                current.Document.No,
                current.Document.Date,
                current.VendorInformation.VendorNameSnapshot,
                current.Footer.NetTotal,
                current.Status,
                current.CreatedAtUtc,
                current.UpdatedAtUtc))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<GoodsReceiptNoteListItemDto>>(true, "Goods receipt notes fetched successfully.", goodsReceiptNotes));
    }

    private static async Task<IResult> GetByIdAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var goodsReceiptNote = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return goodsReceiptNote is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Goods receipt note not found.", null))
            : TypedResults.Ok(new ApiResponse<GoodsReceiptNoteDto>(true, "Goods receipt note fetched successfully.", GoodsReceiptNoteDto.FromEntity(goodsReceiptNote)));
    }

    private static async Task<IResult> CreateAsync(CreateGoodsReceiptNoteRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildGoodsReceiptNoteRequest(request.SourceRef, request.Document, request.VendorInformation, request.Logistics, request.General, request.Items, request.Footer);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.GoodsReceiptNotes.AnyAsync(current => current.Document.No == buildResult.Document.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Goods receipt number already exists.", null));
        }

        var resolutionError = await ResolveReferencesAsync(dbContext, buildResult, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        var now = DateTime.UtcNow;
        var goodsReceiptNote = new GoodsReceiptNote
        {
            SourceRef = buildResult.SourceRef,
            Document = buildResult.Document,
            VendorInformation = buildResult.VendorInformation,
            Logistics = buildResult.Logistics,
            General = buildResult.General,
            Items = buildResult.Items,
            Footer = buildResult.Footer,
            Status = GoodsReceiptStatuses.Draft,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.GoodsReceiptNotes.Add(goodsReceiptNote);
        await dbContext.SaveChangesAsync(cancellationToken);
        await SyncPurchaseOrderReceivedQuantitiesAsync(dbContext, goodsReceiptNote.SourceRef.PurchaseOrderId, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var created = await BuildQuery(dbContext).FirstAsync(current => current.Id == goodsReceiptNote.Id, cancellationToken);
        return TypedResults.Created($"/api/inventory/goods-receipt-notes/{goodsReceiptNote.Id}", new ApiResponse<GoodsReceiptNoteDto>(true, "Goods receipt note created successfully.", GoodsReceiptNoteDto.FromEntity(created)));
    }

    private static async Task<IResult> UpdateAsync(Guid id, UpdateGoodsReceiptNoteRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildGoodsReceiptNoteRequest(request.SourceRef, request.Document, request.VendorInformation, request.Logistics, request.General, request.Items, request.Footer);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        var goodsReceiptNote = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (goodsReceiptNote is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Goods receipt note not found.", null));
        }

        if (await dbContext.GoodsReceiptNotes.AnyAsync(current => current.Id != id && current.Document.No == buildResult.Document.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Goods receipt number already exists.", null));
        }

        var resolutionError = await ResolveReferencesAsync(dbContext, buildResult, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        var previousPurchaseOrderId = goodsReceiptNote.SourceRef.PurchaseOrderId;

        goodsReceiptNote.SourceRef = buildResult.SourceRef;
        goodsReceiptNote.Document = buildResult.Document;
        goodsReceiptNote.VendorInformation = buildResult.VendorInformation;
        goodsReceiptNote.Logistics = buildResult.Logistics;
        goodsReceiptNote.General = buildResult.General;
        goodsReceiptNote.Footer = buildResult.Footer;
        goodsReceiptNote.Status = string.IsNullOrWhiteSpace(request.Status) ? goodsReceiptNote.Status : ParseStatus(request.Status);
        goodsReceiptNote.UpdatedAtUtc = DateTime.UtcNow;

        dbContext.RemoveRange(goodsReceiptNote.Items);
        goodsReceiptNote.Items = buildResult.Items;

        await dbContext.SaveChangesAsync(cancellationToken);
        await SyncPurchaseOrderReceivedQuantitiesAsync(dbContext, previousPurchaseOrderId, cancellationToken);
        await SyncPurchaseOrderReceivedQuantitiesAsync(dbContext, goodsReceiptNote.SourceRef.PurchaseOrderId, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var updated = await BuildQuery(dbContext).FirstAsync(current => current.Id == id, cancellationToken);
        return TypedResults.Ok(new ApiResponse<GoodsReceiptNoteDto>(true, "Goods receipt note updated successfully.", GoodsReceiptNoteDto.FromEntity(updated)));
    }

    private static async Task<IResult> DeleteAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var goodsReceiptNote = await dbContext.GoodsReceiptNotes
            .Include(current => current.Items)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (goodsReceiptNote is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Goods receipt note not found.", null));
        }

        var purchaseOrderId = goodsReceiptNote.SourceRef.PurchaseOrderId;

        dbContext.GoodsReceiptNotes.Remove(goodsReceiptNote);
        await dbContext.SaveChangesAsync(cancellationToken);
        await SyncPurchaseOrderReceivedQuantitiesAsync(dbContext, purchaseOrderId, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Goods receipt note deleted successfully.", null));
    }

    private static GoodsReceiptNoteBuildResult BuildGoodsReceiptNoteRequest(
        GoodsReceiptNoteSourceReferenceRequest sourceRefRequest,
        GoodsReceiptNoteDocumentRequest documentRequest,
        GoodsReceiptNoteVendorInformationRequest vendorInformationRequest,
        GoodsReceiptNoteLogisticsRequest logisticsRequest,
        GoodsReceiptNoteGeneralRequest generalRequest,
        IReadOnlyList<GoodsReceiptNoteLineItemRequest> itemsRequest,
        GoodsReceiptNoteFooterRequest footerRequest)
    {
        var sourceRef = new GoodsReceiptNoteSourceReference
        {
            Mode = ParseReceiptMode(sourceRefRequest.Mode),
            PurchaseOrderId = sourceRefRequest.PurchaseOrderId,
            PurchaseOrderNo = NormalizeOptional(sourceRefRequest.PurchaseOrderNo),
            DirectLpoNo = NormalizeOptional(sourceRefRequest.DirectLpoNo),
            DirectVendorInvoiceNo = NormalizeOptional(sourceRefRequest.DirectVendorInvoiceNo)
        };

        var document = new GoodsReceiptNoteDocument
        {
            VoucherType = string.IsNullOrWhiteSpace(documentRequest.VoucherType) ? "GRN" : documentRequest.VoucherType.Trim().ToUpperInvariant(),
            No = documentRequest.No?.Trim().ToUpperInvariant() ?? string.Empty,
            Date = documentRequest.Date,
            DeliveryDate = documentRequest.DeliveryDate
        };

        var vendorInformation = new GoodsReceiptNoteVendorInformation
        {
            VendorId = vendorInformationRequest.VendorId,
            VendorNameSnapshot = vendorInformationRequest.VendorNameSnapshot?.Trim() ?? string.Empty,
            Address = vendorInformationRequest.Address?.Trim() ?? string.Empty,
            Attention = NormalizeOptional(vendorInformationRequest.Attention),
            Phone = NormalizeOptional(vendorInformationRequest.Phone)
        };

        var logistics = new GoodsReceiptNoteLogistics
        {
            LrService = NormalizeOptional(logisticsRequest.LrService),
            LrNo = NormalizeOptional(logisticsRequest.LrNo),
            LrDate = logisticsRequest.LrDate
        };

        var general = new GoodsReceiptNoteGeneral
        {
            OwnProductsOnly = generalRequest.OwnProductsOnly,
            TaxableMode = ParseTaxableMode(generalRequest.TaxableMode),
            Notes = NormalizeOptional(generalRequest.Notes)
        };

        if (string.IsNullOrWhiteSpace(document.No))
        {
            return GoodsReceiptNoteBuildResult.Invalid("Goods receipt number is required.");
        }

        if (vendorInformation.VendorId == Guid.Empty)
        {
            return GoodsReceiptNoteBuildResult.Invalid("Vendor is required.");
        }

        if (string.IsNullOrWhiteSpace(vendorInformation.Address))
        {
            return GoodsReceiptNoteBuildResult.Invalid("Vendor address is required.");
        }

        if (sourceRef.Mode == GoodsReceiptModes.AgainstPurchaseOrder && sourceRef.PurchaseOrderId is null)
        {
            return GoodsReceiptNoteBuildResult.Invalid("Select a purchase order reference for goods receipt against PO.");
        }

        if (itemsRequest is null || itemsRequest.Count == 0)
        {
            return GoodsReceiptNoteBuildResult.Invalid("At least one line item is required.");
        }

        var items = new List<GoodsReceiptNoteItem>(itemsRequest.Count);
        foreach (var itemRequest in itemsRequest)
        {
            if (itemRequest.ProductId == Guid.Empty)
            {
                return GoodsReceiptNoteBuildResult.Invalid("Each line item must have a product.");
            }

            if (itemRequest.UnitId == Guid.Empty)
            {
                return GoodsReceiptNoteBuildResult.Invalid("Each line item must have a unit.");
            }

            if (itemRequest.WarehouseId is null)
            {
                return GoodsReceiptNoteBuildResult.Invalid("Each line item must have a warehouse.");
            }

            if (itemRequest.Quantity <= 0)
            {
                return GoodsReceiptNoteBuildResult.Invalid("Line item quantity must be greater than zero.");
            }

            if (itemRequest.FocQuantity < 0 || itemRequest.FRate < 0 || itemRequest.Rate < 0 || itemRequest.DiscountPercent < 0 || itemRequest.SellingRate < 0)
            {
                return GoodsReceiptNoteBuildResult.Invalid("Line item values cannot be negative.");
            }

            var grossAmount = Math.Round(itemRequest.Quantity * itemRequest.Rate, 2, MidpointRounding.AwayFromZero);
            var discountAmount = Math.Round((grossAmount * itemRequest.DiscountPercent) / 100m, 2, MidpointRounding.AwayFromZero);
            var total = Math.Round(grossAmount - discountAmount, 2, MidpointRounding.AwayFromZero);

            items.Add(new GoodsReceiptNoteItem
            {
                SerialNo = itemRequest.SerialNo <= 0 ? items.Count + 1 : itemRequest.SerialNo,
                ProductId = itemRequest.ProductId,
                ProductNameSnapshot = itemRequest.ProductNameSnapshot?.Trim() ?? string.Empty,
                HsnCode = NormalizeOptional(itemRequest.HsnCode),
                Code = NormalizeOptional(itemRequest.Code),
                Ubc = NormalizeOptional(itemRequest.Ubc),
                UnitId = itemRequest.UnitId,
                WarehouseId = itemRequest.WarehouseId,
                FRate = itemRequest.FRate,
                Rate = itemRequest.Rate,
                Quantity = itemRequest.Quantity,
                FocQuantity = itemRequest.FocQuantity,
                GrossAmount = grossAmount,
                DiscountPercent = itemRequest.DiscountPercent,
                DiscountAmount = discountAmount,
                TaxableAmount = total,
                Total = total,
                ManufacturingDateUtc = itemRequest.ManufacturingDateUtc,
                ExpiryDateUtc = itemRequest.ExpiryDateUtc,
                Remark = NormalizeOptional(itemRequest.Remark),
                SellingRate = itemRequest.SellingRate,
                PurchaseOrderLineId = itemRequest.PurchaseOrderLineId
            });
        }

        if (footerRequest.Addition < 0 || footerRequest.DiscountFooter < 0)
        {
            return GoodsReceiptNoteBuildResult.Invalid("Footer addition and discount cannot be negative.");
        }

        var footer = new GoodsReceiptNoteFooter
        {
            Addition = Math.Round(footerRequest.Addition, 2, MidpointRounding.AwayFromZero),
            DiscountFooter = Math.Round(footerRequest.DiscountFooter, 2, MidpointRounding.AwayFromZero),
            RoundOff = Math.Round(footerRequest.RoundOff, 2, MidpointRounding.AwayFromZero),
            TotalQty = Math.Round(items.Sum(item => item.Quantity), 2, MidpointRounding.AwayFromZero),
            TotalFoc = Math.Round(items.Sum(item => item.FocQuantity), 2, MidpointRounding.AwayFromZero),
            TotalAmount = Math.Round(items.Sum(item => item.Total), 2, MidpointRounding.AwayFromZero)
        };
        footer.NetTotal = Math.Round(footer.TotalAmount + footer.Addition - footer.DiscountFooter + footer.RoundOff, 2, MidpointRounding.AwayFromZero);

        return GoodsReceiptNoteBuildResult.Valid(sourceRef, document, vendorInformation, logistics, general, footer, items);
    }

    private static async Task<string?> ResolveReferencesAsync(AppDbContext dbContext, GoodsReceiptNoteBuildResult buildResult, CancellationToken cancellationToken)
    {
        PurchaseOrder? purchaseOrder = null;
        if (buildResult.SourceRef.Mode == GoodsReceiptModes.AgainstPurchaseOrder)
        {
            purchaseOrder = await dbContext.PurchaseOrders
                .Include(current => current.Items)
                .FirstOrDefaultAsync(current => current.Id == buildResult.SourceRef.PurchaseOrderId, cancellationToken);
            if (purchaseOrder is null)
            {
                return "Selected purchase order reference does not exist.";
            }

            if (string.IsNullOrWhiteSpace(buildResult.SourceRef.PurchaseOrderNo))
            {
                buildResult.SourceRef.PurchaseOrderNo = purchaseOrder.OrderDetails.No;
            }
        }

        var vendor = await dbContext.Vendors.FirstOrDefaultAsync(current => current.Id == buildResult.VendorInformation.VendorId, cancellationToken);
        if (vendor is null)
        {
            return "Selected vendor does not exist.";
        }

        buildResult.VendorInformation.Vendor = vendor;
        if (string.IsNullOrWhiteSpace(buildResult.VendorInformation.VendorNameSnapshot))
        {
            buildResult.VendorInformation.VendorNameSnapshot = vendor.BasicInfo.Name;
        }

        if (purchaseOrder is not null && purchaseOrder.VendorInformation.VendorId != buildResult.VendorInformation.VendorId)
        {
            return "Selected vendor does not match the referenced purchase order.";
        }

        foreach (var item in buildResult.Items)
        {
            var product = await dbContext.Products.FirstOrDefaultAsync(current => current.Id == item.ProductId, cancellationToken);
            if (product is null)
            {
                return "One or more selected products do not exist.";
            }

            var unit = await dbContext.Uoms.FirstOrDefaultAsync(current => current.Id == item.UnitId, cancellationToken);
            if (unit is null)
            {
                return "One or more selected units do not exist.";
            }

            item.Product = product;
            item.Unit = unit;

            if (string.IsNullOrWhiteSpace(item.ProductNameSnapshot))
            {
                item.ProductNameSnapshot = product.BasicInfo.Name;
            }

            if (string.IsNullOrWhiteSpace(item.Code))
            {
                item.Code = product.BasicInfo.Code;
            }

            if (string.IsNullOrWhiteSpace(item.Ubc))
            {
                item.Ubc = product.AdditionalDetails.Barcode;
            }

            if (string.IsNullOrWhiteSpace(item.HsnCode))
            {
                item.HsnCode = product.StockAndMeasurement.Hsn;
            }

            if (item.WarehouseId is not null)
            {
                var warehouse = await dbContext.Warehouses.FirstOrDefaultAsync(current => current.Id == item.WarehouseId.Value, cancellationToken);
                if (warehouse is null)
                {
                    return "One or more selected line warehouses do not exist.";
                }

                item.Warehouse = warehouse;
            }

            if (purchaseOrder is not null && item.PurchaseOrderLineId is not null)
            {
                var poLine = purchaseOrder.Items.FirstOrDefault(current => current.Id == item.PurchaseOrderLineId.Value);
                if (poLine is null)
                {
                    return "One or more selected purchase order lines do not exist on the referenced purchase order.";
                }

                if (poLine.ProductId != item.ProductId)
                {
                    return "Purchase order line does not match the selected product.";
                }
            }
        }

        return null;
    }

    private static async Task SyncPurchaseOrderReceivedQuantitiesAsync(AppDbContext dbContext, Guid? purchaseOrderId, CancellationToken cancellationToken)
    {
        if (purchaseOrderId is null || purchaseOrderId == Guid.Empty)
        {
            return;
        }

        var purchaseOrder = await dbContext.PurchaseOrders
            .Include(current => current.Items)
            .FirstOrDefaultAsync(current => current.Id == purchaseOrderId.Value, cancellationToken);
        if (purchaseOrder is null)
        {
            return;
        }

        var receivedByLineId = await dbContext.GoodsReceiptNoteItems
            .Where(item => item.PurchaseOrderLineId != null
                && item.GoodsReceiptNote != null
                && item.GoodsReceiptNote.SourceRef.Mode == GoodsReceiptModes.AgainstPurchaseOrder
                && item.GoodsReceiptNote.SourceRef.PurchaseOrderId == purchaseOrderId.Value)
            .GroupBy(item => item.PurchaseOrderLineId!.Value)
            .Select(group => new
            {
                PurchaseOrderLineId = group.Key,
                ReceivedQty = group.Sum(item => item.Quantity)
            })
            .ToDictionaryAsync(item => item.PurchaseOrderLineId, item => Math.Round(item.ReceivedQty, 2, MidpointRounding.AwayFromZero), cancellationToken);

        foreach (var lineItem in purchaseOrder.Items)
        {
            lineItem.ReceivedQty = receivedByLineId.GetValueOrDefault(lineItem.Id, 0);
        }
    }

    private static string ParseReceiptMode(string? value)
    {
        if (string.Equals(value, GoodsReceiptModes.AgainstPurchaseOrder, StringComparison.OrdinalIgnoreCase))
        {
            return GoodsReceiptModes.AgainstPurchaseOrder;
        }

        return GoodsReceiptModes.Direct;
    }

    private static string ParseTaxableMode(string? value)
    {
        if (string.Equals(value, TaxableModes.NonTaxable, StringComparison.OrdinalIgnoreCase))
        {
            return TaxableModes.NonTaxable;
        }

        return TaxableModes.Taxable;
    }

    private static string ParseStatus(string? value)
    {
        if (string.Equals(value, GoodsReceiptStatuses.Submitted, StringComparison.OrdinalIgnoreCase))
        {
            return GoodsReceiptStatuses.Submitted;
        }

        if (string.Equals(value, GoodsReceiptStatuses.Cancelled, StringComparison.OrdinalIgnoreCase))
        {
            return GoodsReceiptStatuses.Cancelled;
        }

        return GoodsReceiptStatuses.Draft;
    }

    private static string? NormalizeOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed record GoodsReceiptNoteBuildResult(
        string? Error,
        GoodsReceiptNoteSourceReference? SourceRef = null,
        GoodsReceiptNoteDocument? Document = null,
        GoodsReceiptNoteVendorInformation? VendorInformation = null,
        GoodsReceiptNoteLogistics? Logistics = null,
        GoodsReceiptNoteGeneral? General = null,
        GoodsReceiptNoteFooter? Footer = null,
        List<GoodsReceiptNoteItem>? Items = null)
    {
        public GoodsReceiptNoteSourceReference SourceRef { get; init; } = SourceRef ?? new GoodsReceiptNoteSourceReference();
        public GoodsReceiptNoteDocument Document { get; init; } = Document ?? new GoodsReceiptNoteDocument();
        public GoodsReceiptNoteVendorInformation VendorInformation { get; init; } = VendorInformation ?? new GoodsReceiptNoteVendorInformation();
        public GoodsReceiptNoteLogistics Logistics { get; init; } = Logistics ?? new GoodsReceiptNoteLogistics();
        public GoodsReceiptNoteGeneral General { get; init; } = General ?? new GoodsReceiptNoteGeneral();
        public GoodsReceiptNoteFooter Footer { get; init; } = Footer ?? new GoodsReceiptNoteFooter();
        public List<GoodsReceiptNoteItem> Items { get; init; } = Items ?? [];

        public static GoodsReceiptNoteBuildResult Valid(
            GoodsReceiptNoteSourceReference sourceRef,
            GoodsReceiptNoteDocument document,
            GoodsReceiptNoteVendorInformation vendorInformation,
            GoodsReceiptNoteLogistics logistics,
            GoodsReceiptNoteGeneral general,
            GoodsReceiptNoteFooter footer,
            List<GoodsReceiptNoteItem> items) =>
            new(null, sourceRef, document, vendorInformation, logistics, general, footer, items);

        public static GoodsReceiptNoteBuildResult Invalid(string error) => new(error);
    }
}
