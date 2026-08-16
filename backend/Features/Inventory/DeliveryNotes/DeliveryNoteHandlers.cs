using backend.Features.Masters.Customers;
using backend.Features.Transactions.SalesInvoices;
using backend.Infrastructure.Persistence;
using backend.Infrastructure.Sse;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Inventory.DeliveryNotes;

internal static class DeliveryNoteHandlers
{
    private static IQueryable<DeliveryNote> BuildQuery(AppDbContext db) =>
        db.DeliveryNotes
            .Include(dn => dn.CustomerInformation.Customer)
            .Include(dn => dn.Items).ThenInclude(i => i.Unit)
            .Include(dn => dn.Items).ThenInclude(i => i.Warehouse);

    internal static async Task<IResult> GetAllAsync(AppDbContext db, CancellationToken ct)
    {
        var list = await db.DeliveryNotes
            .AsNoTracking()
            .OrderByDescending(dn => dn.UpdatedAtUtc)
            .Select(dn => new DeliveryNoteListItemDto(
                dn.Id, dn.Document.No, dn.Document.Date,
                dn.CustomerInformation.CustomerNameSnapshot,
                dn.Footer.NetTotal, dn.Status, dn.CreatedAtUtc, dn.UpdatedAtUtc))
            .ToListAsync(ct);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<DeliveryNoteListItemDto>>(true, "Delivery notes fetched successfully.", list));
    }

    internal static async Task<IResult> GetByIdAsync(Guid id, AppDbContext db, CancellationToken ct)
    {
        var dn = await BuildQuery(db).FirstOrDefaultAsync(x => x.Id == id, ct);
        return dn is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Delivery note not found.", null))
            : TypedResults.Ok(new ApiResponse<DeliveryNoteDto>(true, "Delivery note fetched successfully.", DeliveryNoteDto.FromEntity(dn)));
    }

    internal static async Task<IResult> CreateAsync(CreateDeliveryNoteRequest request, AppDbContext db, ReportInvalidationService sseService, CancellationToken ct)
    {
        var build = BuildDeliveryNote(request);
        if (build.Error is not null)
            return TypedResults.BadRequest(new ApiResponse<object>(false, build.Error, null));

        if (await db.DeliveryNotes.AnyAsync(x => x.Document.No == build.Document!.No, ct))
            return TypedResults.Conflict(new ApiResponse<object>(false, "Delivery note number already exists.", null));

        var resolveError = await ResolveReferencesAsync(db, build, ct);
        if (resolveError is not null)
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolveError, null));

        var now = DateTime.UtcNow;
        var dn = new DeliveryNote
        {
            SourceRef = build.SourceRef!,
            Document = build.Document!,
            CustomerInformation = build.CustomerInformation!,
            Logistics = build.Logistics!,
            General = build.General!,
            Items = build.Items!,
            Footer = build.Footer!,
            Status = ParseStatus(request.Status),
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        db.DeliveryNotes.Add(dn);
        if (dn.Status == DeliveryNoteStatuses.Submitted)
        {
            var effectsError = await ApplySubmissionEffectsAsync(db, dn, ct);
            if (effectsError is not null)
                return TypedResults.BadRequest(new ApiResponse<object>(false, effectsError, null));
        }
        await db.SaveChangesAsync(ct);
        if (dn.Status == DeliveryNoteStatuses.Submitted) sseService.Publish(InvalidationGroups.DnPosted);

        var created = await BuildQuery(db).FirstAsync(x => x.Id == dn.Id, ct);
        return TypedResults.Created($"/api/inventory/delivery-notes/{dn.Id}",
            new ApiResponse<DeliveryNoteDto>(true, "Delivery note created successfully.", DeliveryNoteDto.FromEntity(created)));
    }

    internal static async Task<IResult> UpdateStatusAsync(Guid id, UpdateDeliveryNoteStatusRequest request, AppDbContext db, ReportInvalidationService sseService, CancellationToken ct)
    {
        var dn = await BuildQuery(db).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (dn is null)
            return TypedResults.NotFound(new ApiResponse<object>(false, "Delivery note not found.", null));

        var nextStatus = ParseStatus(request.Status);
        if (dn.Status == nextStatus)
        {
            var unchanged = await BuildQuery(db).FirstAsync(x => x.Id == id, ct);
            return TypedResults.Ok(new ApiResponse<DeliveryNoteDto>(true, "Delivery note updated successfully.", DeliveryNoteDto.FromEntity(unchanged)));
        }

        var transitionError = ValidateStatusTransition(dn.Status, nextStatus);
        if (transitionError is not null)
            return TypedResults.BadRequest(new ApiResponse<object>(false, transitionError, null));

        if (nextStatus == DeliveryNoteStatuses.Submitted)
        {
            var effectsError = await ApplySubmissionEffectsAsync(db, dn, ct);
            if (effectsError is not null)
                return TypedResults.BadRequest(new ApiResponse<object>(false, effectsError, null));
        }
        else if (dn.Status == DeliveryNoteStatuses.Submitted && nextStatus == DeliveryNoteStatuses.Cancelled)
        {
            if (await HasLinkedSubmittedSalesInvoiceAsync(db, dn.Id, ct))
                return TypedResults.BadRequest(new ApiResponse<object>(false, "Cannot cancel a delivery note that has a submitted sales invoice referencing it.", null));

            await InventoryPostingService.RevertSourceAsync(db, StockSourceTypes.DeliveryNote, dn.Id, ct);

            var journalError = await DeliveryNoteJournalPosting.ReverseAsync(
                db, dn.Id, DateOnly.FromDateTime(DateTime.UtcNow), ct);
            if (journalError is not null)
                return TypedResults.BadRequest(new ApiResponse<object>(false, journalError, null));
        }

        dn.Status = nextStatus;
        dn.UpdatedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        sseService.Publish(InvalidationGroups.DnPosted);

        var updated = await BuildQuery(db).FirstAsync(x => x.Id == id, ct);
        return TypedResults.Ok(new ApiResponse<DeliveryNoteDto>(true, "Delivery note updated successfully.", DeliveryNoteDto.FromEntity(updated)));
    }

    internal static async Task<IResult> UpdateAsync(Guid id, CreateDeliveryNoteRequest request, AppDbContext db, CancellationToken ct)
    {
        var dn = await BuildQuery(db).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (dn is null)
            return TypedResults.NotFound(new ApiResponse<object>(false, "Delivery note not found.", null));

        if (dn.Status != DeliveryNoteStatuses.Draft)
            return TypedResults.BadRequest(new ApiResponse<object>(false, "Only Draft delivery notes can be edited.", null));

        var build = BuildDeliveryNote(request);
        if (build.Error is not null)
            return TypedResults.BadRequest(new ApiResponse<object>(false, build.Error, null));

        build.Document!.No = dn.Document.No;

        var resolveError = await ResolveReferencesAsync(db, build, ct);
        if (resolveError is not null)
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolveError, null));

        dn.SourceRef = build.SourceRef!;
        dn.Document = build.Document!;
        dn.CustomerInformation = build.CustomerInformation!;
        dn.Logistics = build.Logistics!;
        dn.General = build.General!;
        dn.Footer = build.Footer!;
        dn.UpdatedAtUtc = DateTime.UtcNow;

        db.RemoveRange(dn.Items);
        dn.Items = build.Items!;

        await db.SaveChangesAsync(ct);

        var updated = await BuildQuery(db).FirstAsync(x => x.Id == id, ct);
        return TypedResults.Ok(new ApiResponse<DeliveryNoteDto>(true, "Delivery note updated successfully.", DeliveryNoteDto.FromEntity(updated)));
    }

    internal static async Task<IResult> DownloadPdfAsync(Guid id, AppDbContext db, DeliveryNotePdfService pdfService, CancellationToken ct)
    {
        var dn = await BuildQuery(db).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (dn is null)
            return TypedResults.NotFound(new ApiResponse<object>(false, "Delivery note not found.", null));

        var bytes = await pdfService.GeneratePdfAsync(dn);
        return Results.File(bytes, "application/pdf", $"DN-{dn.Document.No}.pdf");
    }

    internal static async Task<IResult> PreviewPdfAsync(CreateDeliveryNoteRequest request, AppDbContext db, DeliveryNotePdfService pdfService, CancellationToken ct)
    {
        var bytes = await pdfService.GeneratePreviewPdfAsync(request, db, ct);
        return Results.File(bytes, "application/pdf", "DN-preview.pdf");
    }

    private static async Task<string?> ApplySubmissionEffectsAsync(AppDbContext db, DeliveryNote dn, CancellationToken ct)
    {
        var inventorySettings = await InventorySettingsResolver.GetEffectiveSettingsAsync(db, ct);
        var issueLines = dn.Items
            .OrderBy(i => i.SerialNo)
            .ThenBy(i => i.Id)
            .Select(i => new InventoryIssuePostingLine(i.Id, i.ProductId, i.WarehouseId ?? Guid.Empty, i.Quantity, i.Remark ?? i.ProductNameSnapshot))
            .ToList();

        var issueResult = await InventoryPostingService.ApplyIssuesAsync(
            db, inventorySettings, StockSourceTypes.DeliveryNote, dn.Id, dn.Document.Date, issueLines, ct);
        if (issueResult.Error is not null)
            return issueResult.Error;

        var totalCogs = issueResult.Costings!.Values.Sum(c => c.TotalCost);
        return await DeliveryNoteJournalPosting.PostAsync(db, dn, totalCogs, ct);
    }

    private static Task<bool> HasLinkedSubmittedSalesInvoiceAsync(AppDbContext db, Guid dnId, CancellationToken ct) =>
        db.SalesInvoices.AnyAsync(
            si => si.SourceRef.Type == SalesInvoiceReferenceType.DeliveryNote
                && si.SourceRef.ReferenceId == dnId
                && si.Status == SalesInvoiceStatus.Submitted,
            ct);

    private static DeliveryNoteBuildResult BuildDeliveryNote(CreateDeliveryNoteRequest req)
    {
        var sourceRef = new DeliveryNoteSourceReference
        {
            Mode = ParseMode(req.SourceRef.Mode),
            SalesOrderId = req.SourceRef.SalesOrderId,
            SalesOrderNo = NormalizeOptional(req.SourceRef.SalesOrderNo),
            DirectRefNo = NormalizeOptional(req.SourceRef.DirectRefNo)
        };

        var document = new DeliveryNoteDocument
        {
            VoucherType = string.IsNullOrWhiteSpace(req.Document.VoucherType) ? "DN" : req.Document.VoucherType.Trim().ToUpperInvariant(),
            No = req.Document.No?.Trim().ToUpperInvariant() ?? string.Empty,
            Date = req.Document.Date,
            ExpectedDeliveryDate = req.Document.ExpectedDeliveryDate
        };

        var customerInfo = new DeliveryNoteCustomerInformation
        {
            CustomerId = req.CustomerInformation.CustomerId,
            CustomerNameSnapshot = req.CustomerInformation.CustomerNameSnapshot?.Trim() ?? string.Empty,
            Address = req.CustomerInformation.Address?.Trim() ?? string.Empty,
            ShippingAddress = NormalizeOptional(req.CustomerInformation.ShippingAddress),
            Attention = NormalizeOptional(req.CustomerInformation.Attention),
            Phone = NormalizeOptional(req.CustomerInformation.Phone)
        };

        var logistics = new DeliveryNoteLogistics
        {
            TransportMode = NormalizeOptional(req.Logistics.TransportMode),
            LrNo = NormalizeOptional(req.Logistics.LrNo),
            LrDate = req.Logistics.LrDate,
            VehicleNo = NormalizeOptional(req.Logistics.VehicleNo),
            EWayBillNo = NormalizeOptional(req.Logistics.EWayBillNo),
            TransporterName = NormalizeOptional(req.Logistics.TransporterName)
        };

        var general = new DeliveryNoteGeneral
        {
            Notes = NormalizeOptional(req.General.Notes)
        };

        if (string.IsNullOrWhiteSpace(document.No))
            return DeliveryNoteBuildResult.Invalid("Delivery note number is required.");

        if (customerInfo.CustomerId == Guid.Empty)
            return DeliveryNoteBuildResult.Invalid("Customer is required.");

        if (sourceRef.Mode == DeliveryNoteModes.AgainstSalesOrder && sourceRef.SalesOrderId is null)
            return DeliveryNoteBuildResult.Invalid("Select a sales order reference for delivery against sales order.");

        if (req.Items is null || req.Items.Count == 0)
            return DeliveryNoteBuildResult.Invalid("At least one line item is required.");

        var items = new List<DeliveryNoteItem>(req.Items.Count);
        foreach (var itemReq in req.Items)
        {
            if (itemReq.ProductId == Guid.Empty)
                return DeliveryNoteBuildResult.Invalid("Each line item must have a product.");
            if (itemReq.UnitId == Guid.Empty)
                return DeliveryNoteBuildResult.Invalid("Each line item must have a unit.");
            if (itemReq.WarehouseId is null)
                return DeliveryNoteBuildResult.Invalid("Each line item must have a warehouse.");
            if (itemReq.Quantity <= 0)
                return DeliveryNoteBuildResult.Invalid("Line item quantity must be greater than zero.");
            if (itemReq.Rate < 0 || itemReq.DiscountPercent < 0)
                return DeliveryNoteBuildResult.Invalid("Line item values cannot be negative.");

            var grossAmount = Math.Round(itemReq.Quantity * itemReq.Rate, 2, MidpointRounding.AwayFromZero);
            var discountAmount = Math.Round((grossAmount * itemReq.DiscountPercent) / 100m, 2, MidpointRounding.AwayFromZero);
            var total = Math.Round(grossAmount - discountAmount, 2, MidpointRounding.AwayFromZero);

            items.Add(new DeliveryNoteItem
            {
                SerialNo = itemReq.SerialNo <= 0 ? items.Count + 1 : itemReq.SerialNo,
                ProductId = itemReq.ProductId,
                ProductNameSnapshot = itemReq.ProductNameSnapshot?.Trim() ?? string.Empty,
                HsnCode = NormalizeOptional(itemReq.HsnCode),
                UnitId = itemReq.UnitId,
                WarehouseId = itemReq.WarehouseId,
                Rate = itemReq.Rate,
                Quantity = itemReq.Quantity,
                GrossAmount = grossAmount,
                DiscountAmount = discountAmount,
                TaxableAmount = total,
                Total = total,
                Remark = NormalizeOptional(itemReq.Remark),
                SalesOrderLineId = itemReq.SalesOrderLineId
            });
        }

        var footer = new DeliveryNoteFooter
        {
            TotalQty = Math.Round(items.Sum(i => i.Quantity), 2, MidpointRounding.AwayFromZero),
            TotalAmount = Math.Round(items.Sum(i => i.Total), 2, MidpointRounding.AwayFromZero)
        };
        footer.NetTotal = footer.TotalAmount;

        return DeliveryNoteBuildResult.Valid(sourceRef, document, customerInfo, logistics, general, footer, items);
    }

    private static async Task<string?> ResolveReferencesAsync(AppDbContext db, DeliveryNoteBuildResult build, CancellationToken ct)
    {
        if (build.SourceRef!.Mode == DeliveryNoteModes.AgainstSalesOrder)
        {
            var so = await db.SalesOrders.FirstOrDefaultAsync(x => x.Id == build.SourceRef.SalesOrderId, ct);
            if (so is null)
                return "Selected sales order does not exist.";
            if (string.IsNullOrWhiteSpace(build.SourceRef.SalesOrderNo))
                build.SourceRef.SalesOrderNo = so.OrderDetails.No;
        }

        var customer = await db.Customers.FirstOrDefaultAsync(x => x.Id == build.CustomerInformation!.CustomerId, ct);
        if (customer is null)
            return "Selected customer does not exist.";

        build.CustomerInformation!.Customer = customer;
        if (string.IsNullOrWhiteSpace(build.CustomerInformation.CustomerNameSnapshot))
            build.CustomerInformation.CustomerNameSnapshot = customer.BasicDetails.Name;

        foreach (var item in build.Items!)
        {
            var product = await db.Products.FirstOrDefaultAsync(x => x.Id == item.ProductId, ct);
            if (product is null)
                return "One or more selected products do not exist.";

            var unit = await db.Uoms.FirstOrDefaultAsync(x => x.Id == item.UnitId, ct);
            if (unit is null)
                return "One or more selected units do not exist.";

            item.Product = product;
            item.Unit = unit;

            if (string.IsNullOrWhiteSpace(item.ProductNameSnapshot))
                item.ProductNameSnapshot = product.BasicInfo.Name;

            if (string.IsNullOrWhiteSpace(item.HsnCode))
                item.HsnCode = product.StockAndMeasurement.Hsn;

            if (item.WarehouseId is not null)
            {
                var warehouse = await db.Warehouses.FirstOrDefaultAsync(x => x.Id == item.WarehouseId.Value, ct);
                if (warehouse is null)
                    return "One or more selected warehouses do not exist.";
                item.Warehouse = warehouse;
            }
        }

        return null;
    }

    private static string? ValidateStatusTransition(string current, string next) => (current, next) switch
    {
        (DeliveryNoteStatuses.Draft, DeliveryNoteStatuses.Submitted) => null,
        (DeliveryNoteStatuses.Draft, DeliveryNoteStatuses.Cancelled) => null,
        (DeliveryNoteStatuses.Submitted, DeliveryNoteStatuses.Cancelled) => null,
        _ => $"Cannot transition delivery note from {current} to {next}."
    };

    private static string ParseMode(string? value) => value?.Trim() switch
    {
        DeliveryNoteModes.AgainstSalesOrder => DeliveryNoteModes.AgainstSalesOrder,
        _ => DeliveryNoteModes.Direct
    };

    private static string ParseStatus(string? value) => value?.Trim() switch
    {
        DeliveryNoteStatuses.Submitted => DeliveryNoteStatuses.Submitted,
        DeliveryNoteStatuses.Cancelled => DeliveryNoteStatuses.Cancelled,
        _ => DeliveryNoteStatuses.Draft
    };

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

internal sealed class DeliveryNoteBuildResult
{
    public string? Error { get; init; }
    public DeliveryNoteSourceReference? SourceRef { get; init; }
    public DeliveryNoteDocument? Document { get; init; }
    public DeliveryNoteCustomerInformation? CustomerInformation { get; init; }
    public DeliveryNoteLogistics? Logistics { get; init; }
    public DeliveryNoteGeneral? General { get; init; }
    public DeliveryNoteFooter? Footer { get; init; }
    public List<DeliveryNoteItem>? Items { get; init; }

    public static DeliveryNoteBuildResult Invalid(string error) => new() { Error = error };

    public static DeliveryNoteBuildResult Valid(
        DeliveryNoteSourceReference sourceRef,
        DeliveryNoteDocument document,
        DeliveryNoteCustomerInformation customerInfo,
        DeliveryNoteLogistics logistics,
        DeliveryNoteGeneral general,
        DeliveryNoteFooter footer,
        List<DeliveryNoteItem> items) => new()
    {
        SourceRef = sourceRef,
        Document = document,
        CustomerInformation = customerInfo,
        Logistics = logistics,
        General = general,
        Footer = footer,
        Items = items
    };
}
