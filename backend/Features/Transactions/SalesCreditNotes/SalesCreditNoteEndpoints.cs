using backend.Features.Inventory;
using backend.Features.Masters.Currencies;
using backend.Features.Masters.Customers;
using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Products;
using backend.Features.Masters.Uoms;
using backend.Features.Masters.Warehouses;
using backend.Features.Transactions;
using backend.Features.Transactions.SalesInvoices;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Transactions.SalesCreditNotes;

public static class SalesCreditNoteEndpoints
{
    public static IEndpointRouteBuilder MapSalesCreditNoteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/sales-credit-notes").WithTags("Sales Credit Notes");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPut("/{id:guid}", UpdateAsync);
        group.MapDelete("/{id:guid}", DeleteAsync);

        return app;
    }

    private static IQueryable<SalesCreditNote> BuildQuery(AppDbContext dbContext)
    {
        return dbContext.SalesCreditNotes
            .Include(current => current.CustomerInformation.Customer)
            .Include(current => current.FinancialDetails.Currency)
            .Include(current => current.Items)
                .ThenInclude(item => item.Unit)
            .Include(current => current.Items)
                .ThenInclude(item => item.Warehouse)
            .Include(current => current.Additions)
                .ThenInclude(item => item.Ledger);
    }

    private static async Task<IResult> GetAllAsync(AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var notes = await dbContext.SalesCreditNotes
            .AsNoTracking()
            .OrderByDescending(current => current.UpdatedAtUtc)
            .Select(current => new SalesCreditNoteListItemDto(
                current.Id,
                current.Document.No,
                current.Document.Date,
                current.CustomerInformation.CustomerNameSnapshot,
                current.Footer.NetTotal,
                AdjustmentNoteConventions.ToNatureLabel(current.NoteNature),
                AdjustmentNoteConventions.ToInventoryEffectLabel(current.InventoryEffect),
                ToStatusLabel(current.Status),
                current.CreatedAtUtc,
                current.UpdatedAtUtc))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<SalesCreditNoteListItemDto>>(true, "Sales credit note list fetched successfully.", notes));
    }

    private static async Task<IResult> GetByIdAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var salesCreditNote = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return salesCreditNote is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Sales credit note not found.", null))
            : TypedResults.Ok(new ApiResponse<SalesCreditNoteDto>(true, "Sales credit note fetched successfully.", SalesCreditNoteDto.FromEntity(salesCreditNote)));
    }

    private static async Task<IResult> CreateAsync(CreateSalesCreditNoteRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildSalesCreditNoteRequest(request.NoteNature, request.SourceRef, request.Document, request.CustomerInformation, request.FinancialDetails, request.General, request.Items, request.Additions, request.Footer);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.SalesCreditNotes.AnyAsync(current => current.Document.No == buildResult.Document.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Sales credit note number already exists.", null));
        }

        var resolutionError = await ResolveReferencesAsync(dbContext, buildResult, null, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        var now = DateTime.UtcNow;
        var salesCreditNote = new SalesCreditNote
        {
            NoteNature = buildResult.NoteNature,
            SourceRef = buildResult.SourceRef,
            Document = buildResult.Document,
            CustomerInformation = buildResult.CustomerInformation,
            FinancialDetails = buildResult.FinancialDetails,
            General = buildResult.General,
            Items = buildResult.Items,
            Additions = buildResult.Additions,
            Footer = buildResult.Footer,
            Status = SalesCreditNoteStatus.Draft,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.SalesCreditNotes.Add(salesCreditNote);

        var inventoryError = await PostInventoryIfNeededAsync(dbContext, salesCreditNote, cancellationToken);
        if (inventoryError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, inventoryError, null));
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var created = await BuildQuery(dbContext).FirstAsync(current => current.Id == salesCreditNote.Id, cancellationToken);
        return TypedResults.Created($"/api/transactions/sales-credit-notes/{salesCreditNote.Id}", new ApiResponse<SalesCreditNoteDto>(true, "Sales credit note created successfully.", SalesCreditNoteDto.FromEntity(created)));
    }

    private static async Task<IResult> UpdateAsync(Guid id, UpdateSalesCreditNoteRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildSalesCreditNoteRequest(request.NoteNature, request.SourceRef, request.Document, request.CustomerInformation, request.FinancialDetails, request.General, request.Items, request.Additions, request.Footer);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        var salesCreditNote = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (salesCreditNote is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Sales credit note not found.", null));
        }

        if (await dbContext.SalesCreditNotes.AnyAsync(current => current.Id != id && current.Document.No == buildResult.Document.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Sales credit note number already exists.", null));
        }

        var resolutionError = await ResolveReferencesAsync(dbContext, buildResult, id, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        await AdjustmentInventoryPosting.RevertAsync(dbContext, StockSourceTypes.SalesCreditNote, id, cancellationToken);

        salesCreditNote.NoteNature = buildResult.NoteNature;
        salesCreditNote.SourceRef = buildResult.SourceRef;
        salesCreditNote.Document = buildResult.Document;
        salesCreditNote.CustomerInformation = buildResult.CustomerInformation;
        salesCreditNote.FinancialDetails = buildResult.FinancialDetails;
        salesCreditNote.General = buildResult.General;
        salesCreditNote.Footer = buildResult.Footer;
        salesCreditNote.Status = string.IsNullOrWhiteSpace(request.Status) ? salesCreditNote.Status : ParseStatus(request.Status);
        salesCreditNote.UpdatedAtUtc = DateTime.UtcNow;

        dbContext.RemoveRange(salesCreditNote.Items);
        salesCreditNote.Items = buildResult.Items;
        dbContext.RemoveRange(salesCreditNote.Additions);
        salesCreditNote.Additions = buildResult.Additions;

        var inventoryError = await PostInventoryIfNeededAsync(dbContext, salesCreditNote, cancellationToken);
        if (inventoryError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, inventoryError, null));
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var updated = await BuildQuery(dbContext).FirstAsync(current => current.Id == id, cancellationToken);
        return TypedResults.Ok(new ApiResponse<SalesCreditNoteDto>(true, "Sales credit note updated successfully.", SalesCreditNoteDto.FromEntity(updated)));
    }

    private static async Task<IResult> DeleteAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var salesCreditNote = await dbContext.SalesCreditNotes
            .Include(current => current.Items)
            .Include(current => current.Additions)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (salesCreditNote is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Sales credit note not found.", null));
        }

        await AdjustmentInventoryPosting.RevertAsync(dbContext, StockSourceTypes.SalesCreditNote, id, cancellationToken);
        dbContext.SalesCreditNotes.Remove(salesCreditNote);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Sales credit note deleted successfully.", null));
    }

    private static SalesCreditNoteBuildResult BuildSalesCreditNoteRequest(
        string noteNatureValue,
        SalesCreditNoteSourceReferenceRequest sourceRefRequest,
        SalesCreditNoteDocumentRequest documentRequest,
        SalesCreditNoteCustomerInformationRequest customerInformationRequest,
        SalesCreditNoteFinancialDetailsRequest financialDetailsRequest,
        SalesCreditNoteGeneralRequest generalRequest,
        IReadOnlyList<SalesCreditNoteLineItemRequest> itemsRequest,
        IReadOnlyList<SalesCreditNoteAdditionRequest> additionsRequest,
        SalesCreditNoteFooterRequest footerRequest)
    {
        var noteNature = AdjustmentNoteConventions.ParseNature(noteNatureValue);

        var sourceRef = new SalesCreditNoteSourceReference
        {
            ReferenceId = sourceRefRequest.ReferenceId,
            ReferenceNo = sourceRefRequest.ReferenceNo?.Trim() ?? string.Empty
        };

        var document = new SalesCreditNoteDocument
        {
            VoucherType = string.IsNullOrWhiteSpace(documentRequest.VoucherType) ? "SCN" : documentRequest.VoucherType.Trim().ToUpperInvariant(),
            No = documentRequest.No?.Trim().ToUpperInvariant() ?? string.Empty,
            Date = documentRequest.Date,
            DueDate = documentRequest.DueDate
        };

        var customerInformation = new SalesCreditNoteCustomerInformation
        {
            CustomerId = customerInformationRequest.CustomerId,
            CustomerNameSnapshot = customerInformationRequest.CustomerNameSnapshot?.Trim() ?? string.Empty,
            Address = customerInformationRequest.Address?.Trim() ?? string.Empty
        };

        var financialDetails = new SalesCreditNoteFinancialDetails
        {
            PaymentMode = ParsePaymentMode(financialDetailsRequest.PaymentMode),
            InvoiceNo = NormalizeOptional(financialDetailsRequest.InvoiceNo),
            LrNo = NormalizeOptional(financialDetailsRequest.LrNo),
            CurrencyId = financialDetailsRequest.CurrencyId,
            CurrencyCodeSnapshot = NormalizeOptional(financialDetailsRequest.CurrencyCodeSnapshot),
            CurrencySymbolSnapshot = NormalizeOptional(financialDetailsRequest.CurrencySymbolSnapshot),
            Balance = financialDetailsRequest.Balance
        };

        var general = new SalesCreditNoteGeneral
        {
            Notes = NormalizeOptional(generalRequest.Notes),
            Taxable = generalRequest.Taxable,
            TaxApplication = ParseTaxApplication(generalRequest.TaxApplication),
            InterState = generalRequest.InterState
        };

        if (string.IsNullOrWhiteSpace(document.No))
        {
            return SalesCreditNoteBuildResult.Invalid("Sales credit note number is required.");
        }

        if (sourceRef.ReferenceId is null || sourceRef.ReferenceId == Guid.Empty)
        {
            return SalesCreditNoteBuildResult.Invalid("Source sales invoice is required.");
        }

        if (customerInformation.CustomerId == Guid.Empty)
        {
            return SalesCreditNoteBuildResult.Invalid("Customer is required.");
        }

        if (footerRequest.Paid < 0)
        {
            return SalesCreditNoteBuildResult.Invalid("Paid amount cannot be negative.");
        }

        if (itemsRequest is null || itemsRequest.Count == 0)
        {
            return SalesCreditNoteBuildResult.Invalid("At least one line item is required.");
        }

        var items = new List<SalesCreditNoteLineItem>(itemsRequest.Count);
        foreach (var itemRequest in itemsRequest)
        {
            if (itemRequest.SourceLineId == Guid.Empty)
            {
                return SalesCreditNoteBuildResult.Invalid("Each line item must reference a source invoice line.");
            }

            if (itemRequest.ProductId == Guid.Empty)
            {
                return SalesCreditNoteBuildResult.Invalid("Each line item must have a product.");
            }

            if (itemRequest.UnitId == Guid.Empty)
            {
                return SalesCreditNoteBuildResult.Invalid("Each line item must have a unit.");
            }

            if (itemRequest.Quantity <= 0)
            {
                return SalesCreditNoteBuildResult.Invalid("Line item quantity must be greater than zero.");
            }

            if (itemRequest.Rate < 0 || itemRequest.DiscountPercent < 0 || itemRequest.TaxPercent < 0)
            {
                return SalesCreditNoteBuildResult.Invalid("Line item values cannot be negative.");
            }

            if (noteNature == AdjustmentNoteNature.Return && itemRequest.WarehouseId is null)
            {
                return SalesCreditNoteBuildResult.Invalid("Warehouse is required for return notes.");
            }

            var grossAmount = Math.Round(itemRequest.Quantity * itemRequest.Rate, 2, MidpointRounding.AwayFromZero);
            var discountAmount = Math.Round((grossAmount * itemRequest.DiscountPercent) / 100m, 2, MidpointRounding.AwayFromZero);
            var taxableAmount = general.TaxApplication == SalesCreditNoteTaxApplication.BeforeDiscount
                ? grossAmount
                : Math.Max(0, Math.Round(grossAmount - discountAmount, 2, MidpointRounding.AwayFromZero));
            var taxAmount = general.Taxable
                ? Math.Round((taxableAmount * itemRequest.TaxPercent) / 100m, 2, MidpointRounding.AwayFromZero)
                : 0;
            var lineTotal = Math.Round(taxableAmount + taxAmount, 2, MidpointRounding.AwayFromZero);

            items.Add(new SalesCreditNoteLineItem
            {
                SourceLineId = itemRequest.SourceLineId,
                Sno = itemRequest.Sno <= 0 ? items.Count + 1 : itemRequest.Sno,
                ProductId = itemRequest.ProductId,
                ProductCodeSnapshot = NormalizeOptional(itemRequest.ProductCodeSnapshot),
                ProductNameSnapshot = itemRequest.ProductNameSnapshot?.Trim() ?? string.Empty,
                HsnCode = NormalizeOptional(itemRequest.HsnCode),
                UnitId = itemRequest.UnitId,
                Quantity = itemRequest.Quantity,
                Rate = itemRequest.Rate,
                GrossAmount = grossAmount,
                DiscountPercent = itemRequest.DiscountPercent,
                DiscountAmount = discountAmount,
                TaxableAmount = taxableAmount,
                TaxPercent = general.Taxable ? itemRequest.TaxPercent : 0,
                TaxAmount = taxAmount,
                CostRate = 0,
                CogsAmount = 0,
                GrossProfitAmount = 0,
                LineTotal = lineTotal,
                WarehouseId = itemRequest.WarehouseId
            });
        }

        var additions = new List<SalesCreditNoteAddition>();
        foreach (var additionRequest in additionsRequest ?? [])
        {
            var description = NormalizeOptional(additionRequest.Description);
            var ledgerSnapshot = NormalizeOptional(additionRequest.LedgerNameSnapshot);
            var hasMeaningfulData = additionRequest.LedgerId is not null || description is not null || additionRequest.Amount != 0;

            if (!hasMeaningfulData)
            {
                continue;
            }

            if (additionRequest.Amount < 0)
            {
                return SalesCreditNoteBuildResult.Invalid("Addition amount cannot be negative.");
            }

            additions.Add(new SalesCreditNoteAddition
            {
                Type = ParseAdditionType(additionRequest.Type),
                LedgerId = additionRequest.LedgerId,
                LedgerNameSnapshot = ledgerSnapshot ?? string.Empty,
                Description = description,
                Amount = additionRequest.Amount
            });
        }

        var footer = new SalesCreditNoteFooter
        {
            Notes = NormalizeOptional(footerRequest.Notes),
            Total = Math.Round(items.Sum(item => item.LineTotal), 2, MidpointRounding.AwayFromZero),
            Addition = Math.Round(additions.Where(item => item.Type == SalesCreditNoteAdditionType.Addition).Sum(item => item.Amount), 2, MidpointRounding.AwayFromZero),
            Deduction = Math.Round(additions.Where(item => item.Type == SalesCreditNoteAdditionType.Deduction).Sum(item => item.Amount), 2, MidpointRounding.AwayFromZero),
            Paid = footerRequest.Paid
        };
        footer.NetTotal = Math.Round(footer.Total + footer.Addition - footer.Deduction, 2, MidpointRounding.AwayFromZero);
        financialDetails.Balance = Math.Round(footer.NetTotal - footer.Paid, 2, MidpointRounding.AwayFromZero);

        return SalesCreditNoteBuildResult.Valid(noteNature, sourceRef, document, customerInformation, financialDetails, general, footer, items, additions);
    }

    private static async Task<string?> ResolveReferencesAsync(AppDbContext dbContext, SalesCreditNoteBuildResult buildResult, Guid? noteId, CancellationToken cancellationToken)
    {
        var salesInvoice = await dbContext.SalesInvoices
            .Include(current => current.Items)
            .FirstOrDefaultAsync(current => current.Id == buildResult.SourceRef.ReferenceId, cancellationToken);
        if (salesInvoice is null)
        {
            return "Selected sales invoice reference does not exist.";
        }

        if (string.IsNullOrWhiteSpace(buildResult.SourceRef.ReferenceNo))
        {
            buildResult.SourceRef.ReferenceNo = salesInvoice.Document.No;
        }

        var customer = await dbContext.Customers.FirstOrDefaultAsync(current => current.Id == buildResult.CustomerInformation.CustomerId, cancellationToken);
        if (customer is null)
        {
            return "Selected customer does not exist.";
        }

        if (salesInvoice.CustomerInformation.CustomerId != buildResult.CustomerInformation.CustomerId)
        {
            return "Selected customer does not match the referenced sales invoice.";
        }

        buildResult.CustomerInformation.Customer = customer;
        if (string.IsNullOrWhiteSpace(buildResult.CustomerInformation.CustomerNameSnapshot))
        {
            buildResult.CustomerInformation.CustomerNameSnapshot = customer.BasicDetails.Name;
        }

        if (string.IsNullOrWhiteSpace(buildResult.CustomerInformation.Address))
        {
            buildResult.CustomerInformation.Address = salesInvoice.CustomerInformation.Address;
        }

        if (buildResult.FinancialDetails.CurrencyId is not null)
        {
            var currency = await dbContext.Currencies.FirstOrDefaultAsync(current => current.Id == buildResult.FinancialDetails.CurrencyId.Value, cancellationToken);
            if (currency is null)
            {
                return "Selected currency does not exist.";
            }

            buildResult.FinancialDetails.Currency = currency;
            if (string.IsNullOrWhiteSpace(buildResult.FinancialDetails.CurrencyCodeSnapshot))
            {
                buildResult.FinancialDetails.CurrencyCodeSnapshot = currency.Code;
            }

            if (string.IsNullOrWhiteSpace(buildResult.FinancialDetails.CurrencySymbolSnapshot))
            {
                buildResult.FinancialDetails.CurrencySymbolSnapshot = currency.Symbol;
            }
        }

        var existingQuantities = await dbContext.SalesCreditNoteItems
            .Where(item => item.SalesCreditNoteId != noteId.GetValueOrDefault()
                && item.SalesCreditNote != null
                && item.SalesCreditNote.SourceRef.ReferenceId == buildResult.SourceRef.ReferenceId)
            .GroupBy(item => item.SourceLineId)
            .Select(group => new
            {
                SourceLineId = group.Key,
                Quantity = group.Sum(item => item.Quantity)
            })
            .ToDictionaryAsync(item => item.SourceLineId, item => item.Quantity, cancellationToken);

        foreach (var item in buildResult.Items)
        {
            var sourceLine = salesInvoice.Items.FirstOrDefault(current => current.Id == item.SourceLineId);
            if (sourceLine is null)
            {
                return "One or more selected source invoice lines do not exist on the referenced sales invoice.";
            }

            if (sourceLine.ProductId != item.ProductId)
            {
                return "Source invoice line does not match the selected product.";
            }

            if (sourceLine.UnitId != item.UnitId)
            {
                return "Source invoice line does not match the selected unit.";
            }

            var cumulativeQuantity = existingQuantities.GetValueOrDefault(item.SourceLineId, 0) + item.Quantity;
            if (cumulativeQuantity > sourceLine.Quantity)
            {
                return "Adjusted quantity exceeds the available source invoice line quantity.";
            }

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
                item.ProductNameSnapshot = sourceLine.ProductNameSnapshot;
            }

            if (string.IsNullOrWhiteSpace(item.ProductCodeSnapshot))
            {
                item.ProductCodeSnapshot = sourceLine.ProductCodeSnapshot ?? product.BasicInfo.Code;
            }

            if (string.IsNullOrWhiteSpace(item.HsnCode))
            {
                item.HsnCode = sourceLine.HsnCode ?? product.StockAndMeasurement.Hsn;
            }

            item.CostRate = sourceLine.CostRate;
            item.CogsAmount = Math.Round(item.CostRate * item.Quantity, 2, MidpointRounding.AwayFromZero);
            item.GrossProfitAmount = Math.Round(Math.Max(0, item.LineTotal - item.CogsAmount), 2, MidpointRounding.AwayFromZero);

            if (item.WarehouseId is null)
            {
                item.WarehouseId = sourceLine.WarehouseId;
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

            if (buildResult.NoteNature == AdjustmentNoteNature.Return && item.WarehouseId is null)
            {
                return "Warehouse is required for return notes.";
            }
        }

        foreach (var addition in buildResult.Additions)
        {
            if (addition.LedgerId is null)
            {
                continue;
            }

            var ledger = await dbContext.Ledgers.FirstOrDefaultAsync(current => current.Id == addition.LedgerId.Value, cancellationToken);
            if (ledger is null)
            {
                return "One or more selected ledgers do not exist.";
            }

            addition.Ledger = ledger;
            if (string.IsNullOrWhiteSpace(addition.LedgerNameSnapshot))
            {
                addition.LedgerNameSnapshot = ledger.Name;
            }
        }

        return null;
    }

    private static async Task<string?> PostInventoryIfNeededAsync(AppDbContext dbContext, SalesCreditNote salesCreditNote, CancellationToken cancellationToken)
    {
        if (!salesCreditNote.AffectsInventory)
        {
            return null;
        }

        return await AdjustmentInventoryPosting.ApplyAsync(
            dbContext,
            StockSourceTypes.SalesCreditNote,
            salesCreditNote.Id,
            salesCreditNote.Document.Date,
            salesCreditNote.Items
                .Select(item => new InventoryAdjustmentMovement(
                    item.ProductId,
                    item.WarehouseId!.Value,
                    item.Quantity,
                    item.CostRate > 0 ? item.CostRate : item.Rate,
                    StockMovementTypes.AdjustmentIn,
                    $"Sales credit note {salesCreditNote.Document.No}"))
                .ToList(),
            cancellationToken);
    }

    private static SalesCreditNotePaymentMode ParsePaymentMode(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return SalesCreditNotePaymentMode.Cash;
        }

        return value.Trim() switch
        {
            "Credit" => SalesCreditNotePaymentMode.Credit,
            _ => SalesCreditNotePaymentMode.Cash
        };
    }

    private static SalesCreditNoteTaxApplication ParseTaxApplication(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return SalesCreditNoteTaxApplication.AfterDiscount;
        }

        return value.Trim() switch
        {
            "Before Discount" => SalesCreditNoteTaxApplication.BeforeDiscount,
            _ => SalesCreditNoteTaxApplication.AfterDiscount
        };
    }

    private static SalesCreditNoteAdditionType ParseAdditionType(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return SalesCreditNoteAdditionType.Addition;
        }

        return value.Trim() switch
        {
            "Deduction" => SalesCreditNoteAdditionType.Deduction,
            _ => SalesCreditNoteAdditionType.Addition
        };
    }

    private static SalesCreditNoteStatus ParseStatus(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return SalesCreditNoteStatus.Draft;
        }

        return value.Trim() switch
        {
            "Submitted" => SalesCreditNoteStatus.Submitted,
            "Cancelled" => SalesCreditNoteStatus.Cancelled,
            _ => SalesCreditNoteStatus.Draft
        };
    }

    private static string ToStatusLabel(SalesCreditNoteStatus value) => value switch
    {
        SalesCreditNoteStatus.Submitted => "Submitted",
        SalesCreditNoteStatus.Cancelled => "Cancelled",
        _ => "Draft"
    };

    private static string? NormalizeOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed record SalesCreditNoteBuildResult(
        string? Error,
        AdjustmentNoteNature NoteNature = AdjustmentNoteNature.Other,
        SalesCreditNoteSourceReference? SourceRef = null,
        SalesCreditNoteDocument? Document = null,
        SalesCreditNoteCustomerInformation? CustomerInformation = null,
        SalesCreditNoteFinancialDetails? FinancialDetails = null,
        SalesCreditNoteGeneral? General = null,
        SalesCreditNoteFooter? Footer = null,
        List<SalesCreditNoteLineItem>? Items = null,
        List<SalesCreditNoteAddition>? Additions = null)
    {
        public SalesCreditNoteSourceReference SourceRef { get; init; } = SourceRef ?? new SalesCreditNoteSourceReference();
        public SalesCreditNoteDocument Document { get; init; } = Document ?? new SalesCreditNoteDocument();
        public SalesCreditNoteCustomerInformation CustomerInformation { get; init; } = CustomerInformation ?? new SalesCreditNoteCustomerInformation();
        public SalesCreditNoteFinancialDetails FinancialDetails { get; init; } = FinancialDetails ?? new SalesCreditNoteFinancialDetails();
        public SalesCreditNoteGeneral General { get; init; } = General ?? new SalesCreditNoteGeneral();
        public SalesCreditNoteFooter Footer { get; init; } = Footer ?? new SalesCreditNoteFooter();
        public List<SalesCreditNoteLineItem> Items { get; init; } = Items ?? [];
        public List<SalesCreditNoteAddition> Additions { get; init; } = Additions ?? [];

        public static SalesCreditNoteBuildResult Valid(
            AdjustmentNoteNature noteNature,
            SalesCreditNoteSourceReference sourceRef,
            SalesCreditNoteDocument document,
            SalesCreditNoteCustomerInformation customerInformation,
            SalesCreditNoteFinancialDetails financialDetails,
            SalesCreditNoteGeneral general,
            SalesCreditNoteFooter footer,
            List<SalesCreditNoteLineItem> items,
            List<SalesCreditNoteAddition> additions) =>
            new(null, noteNature, sourceRef, document, customerInformation, financialDetails, general, footer, items, additions);

        public static SalesCreditNoteBuildResult Invalid(string error) => new(error);
    }
}
