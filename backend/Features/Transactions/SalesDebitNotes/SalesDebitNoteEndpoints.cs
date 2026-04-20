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

namespace backend.Features.Transactions.SalesDebitNotes;

public static class SalesDebitNoteEndpoints
{
    public static IEndpointRouteBuilder MapSalesDebitNoteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/sales-debit-notes").WithTags("Sales Debit Notes");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPut("/{id:guid}", UpdateAsync);
        group.MapDelete("/{id:guid}", DeleteAsync);

        return app;
    }

    private static IQueryable<SalesDebitNote> BuildQuery(AppDbContext dbContext)
    {
        return dbContext.SalesDebitNotes
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
        var notes = await dbContext.SalesDebitNotes
            .AsNoTracking()
            .OrderByDescending(current => current.UpdatedAtUtc)
            .Select(current => new SalesDebitNoteListItemDto(
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

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<SalesDebitNoteListItemDto>>(true, "Sales debit note list fetched successfully.", notes));
    }

    private static async Task<IResult> GetByIdAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var salesDebitNote = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return salesDebitNote is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Sales debit note not found.", null))
            : TypedResults.Ok(new ApiResponse<SalesDebitNoteDto>(true, "Sales debit note fetched successfully.", SalesDebitNoteDto.FromEntity(salesDebitNote)));
    }

    private static async Task<IResult> CreateAsync(CreateSalesDebitNoteRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildSalesDebitNoteRequest(request.NoteNature, request.SourceRef, request.Document, request.CustomerInformation, request.FinancialDetails, request.General, request.Items, request.Additions, request.Footer);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.SalesDebitNotes.AnyAsync(current => current.Document.No == buildResult.Document.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Sales debit note number already exists.", null));
        }

        var resolutionError = await ResolveReferencesAsync(dbContext, buildResult, null, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        var now = DateTime.UtcNow;
        var salesDebitNote = new SalesDebitNote
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
            Status = SalesDebitNoteStatus.Draft,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.SalesDebitNotes.Add(salesDebitNote);
        await dbContext.SaveChangesAsync(cancellationToken);

        var created = await BuildQuery(dbContext).FirstAsync(current => current.Id == salesDebitNote.Id, cancellationToken);
        return TypedResults.Created($"/api/transactions/sales-debit-notes/{salesDebitNote.Id}", new ApiResponse<SalesDebitNoteDto>(true, "Sales debit note created successfully.", SalesDebitNoteDto.FromEntity(created)));
    }

    private static async Task<IResult> UpdateAsync(Guid id, UpdateSalesDebitNoteRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildSalesDebitNoteRequest(request.NoteNature, request.SourceRef, request.Document, request.CustomerInformation, request.FinancialDetails, request.General, request.Items, request.Additions, request.Footer);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        var salesDebitNote = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (salesDebitNote is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Sales debit note not found.", null));
        }

        if (await dbContext.SalesDebitNotes.AnyAsync(current => current.Id != id && current.Document.No == buildResult.Document.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Sales debit note number already exists.", null));
        }

        var resolutionError = await ResolveReferencesAsync(dbContext, buildResult, id, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        salesDebitNote.NoteNature = buildResult.NoteNature;
        salesDebitNote.SourceRef = buildResult.SourceRef;
        salesDebitNote.Document = buildResult.Document;
        salesDebitNote.CustomerInformation = buildResult.CustomerInformation;
        salesDebitNote.FinancialDetails = buildResult.FinancialDetails;
        salesDebitNote.General = buildResult.General;
        salesDebitNote.Footer = buildResult.Footer;
        salesDebitNote.Status = string.IsNullOrWhiteSpace(request.Status) ? salesDebitNote.Status : ParseStatus(request.Status);
        salesDebitNote.UpdatedAtUtc = DateTime.UtcNow;

        dbContext.RemoveRange(salesDebitNote.Items);
        salesDebitNote.Items = buildResult.Items;
        dbContext.RemoveRange(salesDebitNote.Additions);
        salesDebitNote.Additions = buildResult.Additions;

        await dbContext.SaveChangesAsync(cancellationToken);

        var updated = await BuildQuery(dbContext).FirstAsync(current => current.Id == id, cancellationToken);
        return TypedResults.Ok(new ApiResponse<SalesDebitNoteDto>(true, "Sales debit note updated successfully.", SalesDebitNoteDto.FromEntity(updated)));
    }

    private static async Task<IResult> DeleteAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var salesDebitNote = await dbContext.SalesDebitNotes
            .Include(current => current.Items)
            .Include(current => current.Additions)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (salesDebitNote is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Sales debit note not found.", null));
        }

        dbContext.SalesDebitNotes.Remove(salesDebitNote);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Sales debit note deleted successfully.", null));
    }

    private static SalesDebitNoteBuildResult BuildSalesDebitNoteRequest(
        string noteNatureValue,
        SalesDebitNoteSourceReferenceRequest sourceRefRequest,
        SalesDebitNoteDocumentRequest documentRequest,
        SalesDebitNoteCustomerInformationRequest customerInformationRequest,
        SalesDebitNoteFinancialDetailsRequest financialDetailsRequest,
        SalesDebitNoteGeneralRequest generalRequest,
        IReadOnlyList<SalesDebitNoteLineItemRequest> itemsRequest,
        IReadOnlyList<SalesDebitNoteAdditionRequest> additionsRequest,
        SalesDebitNoteFooterRequest footerRequest)
    {
        var noteNature = AdjustmentNoteConventions.ParseNature(noteNatureValue);
        if (noteNature == AdjustmentNoteNature.Return)
        {
            return SalesDebitNoteBuildResult.Invalid("Return is not supported for sales debit notes in v1.");
        }

        var sourceRef = new SalesDebitNoteSourceReference
        {
            ReferenceId = sourceRefRequest.ReferenceId,
            ReferenceNo = sourceRefRequest.ReferenceNo?.Trim() ?? string.Empty
        };

        var document = new SalesDebitNoteDocument
        {
            VoucherType = string.IsNullOrWhiteSpace(documentRequest.VoucherType) ? "SDN" : documentRequest.VoucherType.Trim().ToUpperInvariant(),
            No = documentRequest.No?.Trim().ToUpperInvariant() ?? string.Empty,
            Date = documentRequest.Date,
            DueDate = documentRequest.DueDate
        };

        var customerInformation = new SalesDebitNoteCustomerInformation
        {
            CustomerId = customerInformationRequest.CustomerId,
            CustomerNameSnapshot = customerInformationRequest.CustomerNameSnapshot?.Trim() ?? string.Empty,
            Address = customerInformationRequest.Address?.Trim() ?? string.Empty
        };

        var financialDetails = new SalesDebitNoteFinancialDetails
        {
            PaymentMode = ParsePaymentMode(financialDetailsRequest.PaymentMode),
            InvoiceNo = NormalizeOptional(financialDetailsRequest.InvoiceNo),
            LrNo = NormalizeOptional(financialDetailsRequest.LrNo),
            CurrencyId = financialDetailsRequest.CurrencyId,
            CurrencyCodeSnapshot = NormalizeOptional(financialDetailsRequest.CurrencyCodeSnapshot),
            CurrencySymbolSnapshot = NormalizeOptional(financialDetailsRequest.CurrencySymbolSnapshot),
            Balance = financialDetailsRequest.Balance
        };

        var general = new SalesDebitNoteGeneral
        {
            Notes = NormalizeOptional(generalRequest.Notes),
            Taxable = generalRequest.Taxable,
            TaxApplication = ParseTaxApplication(generalRequest.TaxApplication),
            InterState = generalRequest.InterState
        };

        if (string.IsNullOrWhiteSpace(document.No))
        {
            return SalesDebitNoteBuildResult.Invalid("Sales debit note number is required.");
        }

        if (sourceRef.ReferenceId is null || sourceRef.ReferenceId == Guid.Empty)
        {
            return SalesDebitNoteBuildResult.Invalid("Source sales invoice is required.");
        }

        if (customerInformation.CustomerId == Guid.Empty)
        {
            return SalesDebitNoteBuildResult.Invalid("Customer is required.");
        }

        if (footerRequest.Paid < 0)
        {
            return SalesDebitNoteBuildResult.Invalid("Paid amount cannot be negative.");
        }

        if (itemsRequest is null || itemsRequest.Count == 0)
        {
            return SalesDebitNoteBuildResult.Invalid("At least one line item is required.");
        }

        var items = new List<SalesDebitNoteLineItem>(itemsRequest.Count);
        foreach (var itemRequest in itemsRequest)
        {
            if (itemRequest.SourceLineId == Guid.Empty)
            {
                return SalesDebitNoteBuildResult.Invalid("Each line item must reference a source invoice line.");
            }

            if (itemRequest.ProductId == Guid.Empty)
            {
                return SalesDebitNoteBuildResult.Invalid("Each line item must have a product.");
            }

            if (itemRequest.UnitId == Guid.Empty)
            {
                return SalesDebitNoteBuildResult.Invalid("Each line item must have a unit.");
            }

            if (itemRequest.Quantity <= 0)
            {
                return SalesDebitNoteBuildResult.Invalid("Line item quantity must be greater than zero.");
            }

            if (itemRequest.Rate < 0 || itemRequest.DiscountPercent < 0 || itemRequest.TaxPercent < 0)
            {
                return SalesDebitNoteBuildResult.Invalid("Line item values cannot be negative.");
            }

            var grossAmount = Math.Round(itemRequest.Quantity * itemRequest.Rate, 2, MidpointRounding.AwayFromZero);
            var discountAmount = Math.Round((grossAmount * itemRequest.DiscountPercent) / 100m, 2, MidpointRounding.AwayFromZero);
            var taxableAmount = general.TaxApplication == SalesDebitNoteTaxApplication.BeforeDiscount
                ? grossAmount
                : Math.Max(0, Math.Round(grossAmount - discountAmount, 2, MidpointRounding.AwayFromZero));
            var taxAmount = general.Taxable
                ? Math.Round((taxableAmount * itemRequest.TaxPercent) / 100m, 2, MidpointRounding.AwayFromZero)
                : 0;
            var lineTotal = Math.Round(taxableAmount + taxAmount, 2, MidpointRounding.AwayFromZero);

            items.Add(new SalesDebitNoteLineItem
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

        var additions = new List<SalesDebitNoteAddition>();
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
                return SalesDebitNoteBuildResult.Invalid("Addition amount cannot be negative.");
            }

            additions.Add(new SalesDebitNoteAddition
            {
                Type = ParseAdditionType(additionRequest.Type),
                LedgerId = additionRequest.LedgerId,
                LedgerNameSnapshot = ledgerSnapshot ?? string.Empty,
                Description = description,
                Amount = additionRequest.Amount
            });
        }

        var footer = new SalesDebitNoteFooter
        {
            Notes = NormalizeOptional(footerRequest.Notes),
            Total = Math.Round(items.Sum(item => item.LineTotal), 2, MidpointRounding.AwayFromZero),
            Addition = Math.Round(additions.Where(item => item.Type == SalesDebitNoteAdditionType.Addition).Sum(item => item.Amount), 2, MidpointRounding.AwayFromZero),
            Deduction = Math.Round(additions.Where(item => item.Type == SalesDebitNoteAdditionType.Deduction).Sum(item => item.Amount), 2, MidpointRounding.AwayFromZero),
            Paid = footerRequest.Paid
        };
        footer.NetTotal = Math.Round(footer.Total + footer.Addition - footer.Deduction, 2, MidpointRounding.AwayFromZero);
        financialDetails.Balance = Math.Round(footer.NetTotal - footer.Paid, 2, MidpointRounding.AwayFromZero);

        return SalesDebitNoteBuildResult.Valid(noteNature, sourceRef, document, customerInformation, financialDetails, general, footer, items, additions);
    }

    private static async Task<string?> ResolveReferencesAsync(AppDbContext dbContext, SalesDebitNoteBuildResult buildResult, Guid? noteId, CancellationToken cancellationToken)
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

        var existingQuantities = await dbContext.SalesDebitNoteItems
            .Where(item => item.SalesDebitNoteId != noteId.GetValueOrDefault()
                && item.SalesDebitNote != null
                && item.SalesDebitNote.SourceRef.ReferenceId == buildResult.SourceRef.ReferenceId)
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

    private static SalesDebitNotePaymentMode ParsePaymentMode(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return SalesDebitNotePaymentMode.Cash;
        }

        return value.Trim() switch
        {
            "Credit" => SalesDebitNotePaymentMode.Credit,
            _ => SalesDebitNotePaymentMode.Cash
        };
    }

    private static SalesDebitNoteTaxApplication ParseTaxApplication(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return SalesDebitNoteTaxApplication.AfterDiscount;
        }

        return value.Trim() switch
        {
            "Before Discount" => SalesDebitNoteTaxApplication.BeforeDiscount,
            _ => SalesDebitNoteTaxApplication.AfterDiscount
        };
    }

    private static SalesDebitNoteAdditionType ParseAdditionType(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return SalesDebitNoteAdditionType.Addition;
        }

        return value.Trim() switch
        {
            "Deduction" => SalesDebitNoteAdditionType.Deduction,
            _ => SalesDebitNoteAdditionType.Addition
        };
    }

    private static SalesDebitNoteStatus ParseStatus(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return SalesDebitNoteStatus.Draft;
        }

        return value.Trim() switch
        {
            "Submitted" => SalesDebitNoteStatus.Submitted,
            "Cancelled" => SalesDebitNoteStatus.Cancelled,
            _ => SalesDebitNoteStatus.Draft
        };
    }

    private static string ToStatusLabel(SalesDebitNoteStatus value) => value switch
    {
        SalesDebitNoteStatus.Submitted => "Submitted",
        SalesDebitNoteStatus.Cancelled => "Cancelled",
        _ => "Draft"
    };

    private static string? NormalizeOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed record SalesDebitNoteBuildResult(
        string? Error,
        AdjustmentNoteNature NoteNature = AdjustmentNoteNature.Other,
        SalesDebitNoteSourceReference? SourceRef = null,
        SalesDebitNoteDocument? Document = null,
        SalesDebitNoteCustomerInformation? CustomerInformation = null,
        SalesDebitNoteFinancialDetails? FinancialDetails = null,
        SalesDebitNoteGeneral? General = null,
        SalesDebitNoteFooter? Footer = null,
        List<SalesDebitNoteLineItem>? Items = null,
        List<SalesDebitNoteAddition>? Additions = null)
    {
        public SalesDebitNoteSourceReference SourceRef { get; init; } = SourceRef ?? new SalesDebitNoteSourceReference();
        public SalesDebitNoteDocument Document { get; init; } = Document ?? new SalesDebitNoteDocument();
        public SalesDebitNoteCustomerInformation CustomerInformation { get; init; } = CustomerInformation ?? new SalesDebitNoteCustomerInformation();
        public SalesDebitNoteFinancialDetails FinancialDetails { get; init; } = FinancialDetails ?? new SalesDebitNoteFinancialDetails();
        public SalesDebitNoteGeneral General { get; init; } = General ?? new SalesDebitNoteGeneral();
        public SalesDebitNoteFooter Footer { get; init; } = Footer ?? new SalesDebitNoteFooter();
        public List<SalesDebitNoteLineItem> Items { get; init; } = Items ?? [];
        public List<SalesDebitNoteAddition> Additions { get; init; } = Additions ?? [];

        public static SalesDebitNoteBuildResult Valid(
            AdjustmentNoteNature noteNature,
            SalesDebitNoteSourceReference sourceRef,
            SalesDebitNoteDocument document,
            SalesDebitNoteCustomerInformation customerInformation,
            SalesDebitNoteFinancialDetails financialDetails,
            SalesDebitNoteGeneral general,
            SalesDebitNoteFooter footer,
            List<SalesDebitNoteLineItem> items,
            List<SalesDebitNoteAddition> additions) =>
            new(null, noteNature, sourceRef, document, customerInformation, financialDetails, general, footer, items, additions);

        public static SalesDebitNoteBuildResult Invalid(string error) => new(error);
    }
}
