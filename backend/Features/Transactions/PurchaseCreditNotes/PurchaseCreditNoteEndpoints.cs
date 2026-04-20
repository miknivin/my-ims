using backend.Features.Masters.Currencies;
using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Products;
using backend.Features.Masters.Uoms;
using backend.Features.Masters.Vendors;
using backend.Features.Masters.Warehouses;
using backend.Features.Transactions;
using backend.Features.Transactions.PurchaseInvoices;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Transactions.PurchaseCreditNotes;

public static class PurchaseCreditNoteEndpoints
{
    public static IEndpointRouteBuilder MapPurchaseCreditNoteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/purchase-credit-notes").WithTags("Purchase Credit Notes");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPut("/{id:guid}", UpdateAsync);
        group.MapDelete("/{id:guid}", DeleteAsync);

        return app;
    }

    private static IQueryable<PurchaseCreditNote> BuildQuery(AppDbContext dbContext)
    {
        return dbContext.PurchaseCreditNotes
            .Include(current => current.VendorInformation.Vendor)
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
        var notes = await dbContext.PurchaseCreditNotes
            .AsNoTracking()
            .OrderByDescending(current => current.UpdatedAtUtc)
            .Select(current => new PurchaseCreditNoteListItemDto(
                current.Id,
                current.Document.No,
                current.Document.Date,
                current.VendorInformation.VendorNameSnapshot,
                current.Footer.NetTotal,
                AdjustmentNoteConventions.ToNatureLabel(current.NoteNature),
                AdjustmentNoteConventions.ToInventoryEffectLabel(current.InventoryEffect),
                ToStatusLabel(current.Status),
                current.CreatedAtUtc,
                current.UpdatedAtUtc))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<PurchaseCreditNoteListItemDto>>(true, "Purchase credit note list fetched successfully.", notes));
    }

    private static async Task<IResult> GetByIdAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var purchaseCreditNote = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return purchaseCreditNote is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Purchase credit note not found.", null))
            : TypedResults.Ok(new ApiResponse<PurchaseCreditNoteDto>(true, "Purchase credit note fetched successfully.", PurchaseCreditNoteDto.FromEntity(purchaseCreditNote)));
    }

    private static async Task<IResult> CreateAsync(CreatePurchaseCreditNoteRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildPurchaseCreditNoteRequest(request.NoteNature, request.SourceRef, request.Document, request.VendorInformation, request.FinancialDetails, request.ProductInformation, request.General, request.Items, request.Additions, request.Footer);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.PurchaseCreditNotes.AnyAsync(current => current.Document.No == buildResult.Document.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Purchase credit note number already exists.", null));
        }

        var resolutionError = await ResolveReferencesAsync(dbContext, buildResult, null, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        var now = DateTime.UtcNow;
        var purchaseCreditNote = new PurchaseCreditNote
        {
            NoteNature = buildResult.NoteNature,
            SourceRef = buildResult.SourceRef,
            Document = buildResult.Document,
            VendorInformation = buildResult.VendorInformation,
            FinancialDetails = buildResult.FinancialDetails,
            ProductInformation = buildResult.ProductInformation,
            General = buildResult.General,
            Items = buildResult.Items,
            Additions = buildResult.Additions,
            Footer = buildResult.Footer,
            Status = PurchaseCreditNoteStatus.Draft,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.PurchaseCreditNotes.Add(purchaseCreditNote);
        await dbContext.SaveChangesAsync(cancellationToken);

        var created = await BuildQuery(dbContext).FirstAsync(current => current.Id == purchaseCreditNote.Id, cancellationToken);
        return TypedResults.Created($"/api/transactions/purchase-credit-notes/{purchaseCreditNote.Id}", new ApiResponse<PurchaseCreditNoteDto>(true, "Purchase credit note created successfully.", PurchaseCreditNoteDto.FromEntity(created)));
    }

    private static async Task<IResult> UpdateAsync(Guid id, UpdatePurchaseCreditNoteRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildPurchaseCreditNoteRequest(request.NoteNature, request.SourceRef, request.Document, request.VendorInformation, request.FinancialDetails, request.ProductInformation, request.General, request.Items, request.Additions, request.Footer);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        var purchaseCreditNote = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (purchaseCreditNote is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Purchase credit note not found.", null));
        }

        if (await dbContext.PurchaseCreditNotes.AnyAsync(current => current.Id != id && current.Document.No == buildResult.Document.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Purchase credit note number already exists.", null));
        }

        var resolutionError = await ResolveReferencesAsync(dbContext, buildResult, id, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        purchaseCreditNote.NoteNature = buildResult.NoteNature;
        purchaseCreditNote.SourceRef = buildResult.SourceRef;
        purchaseCreditNote.Document = buildResult.Document;
        purchaseCreditNote.VendorInformation = buildResult.VendorInformation;
        purchaseCreditNote.FinancialDetails = buildResult.FinancialDetails;
        purchaseCreditNote.ProductInformation = buildResult.ProductInformation;
        purchaseCreditNote.General = buildResult.General;
        purchaseCreditNote.Footer = buildResult.Footer;
        purchaseCreditNote.Status = string.IsNullOrWhiteSpace(request.Status) ? purchaseCreditNote.Status : ParseStatus(request.Status);
        purchaseCreditNote.UpdatedAtUtc = DateTime.UtcNow;

        dbContext.RemoveRange(purchaseCreditNote.Items);
        purchaseCreditNote.Items = buildResult.Items;
        dbContext.RemoveRange(purchaseCreditNote.Additions);
        purchaseCreditNote.Additions = buildResult.Additions;

        await dbContext.SaveChangesAsync(cancellationToken);

        var updated = await BuildQuery(dbContext).FirstAsync(current => current.Id == id, cancellationToken);
        return TypedResults.Ok(new ApiResponse<PurchaseCreditNoteDto>(true, "Purchase credit note updated successfully.", PurchaseCreditNoteDto.FromEntity(updated)));
    }

    private static async Task<IResult> DeleteAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var purchaseCreditNote = await dbContext.PurchaseCreditNotes
            .Include(current => current.Items)
            .Include(current => current.Additions)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (purchaseCreditNote is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Purchase credit note not found.", null));
        }

        dbContext.PurchaseCreditNotes.Remove(purchaseCreditNote);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Purchase credit note deleted successfully.", null));
    }

    private static PurchaseCreditNoteBuildResult BuildPurchaseCreditNoteRequest(
        string noteNatureValue,
        PurchaseCreditNoteSourceReferenceRequest sourceRefRequest,
        PurchaseCreditNoteDocumentRequest documentRequest,
        PurchaseCreditNoteVendorInformationRequest vendorInformationRequest,
        PurchaseCreditNoteFinancialDetailsRequest financialDetailsRequest,
        PurchaseCreditNoteProductInformationRequest productInformationRequest,
        PurchaseCreditNoteGeneralRequest generalRequest,
        IReadOnlyList<PurchaseCreditNoteLineItemRequest> itemsRequest,
        IReadOnlyList<PurchaseCreditNoteAdditionRequest> additionsRequest,
        PurchaseCreditNoteFooterRequest footerRequest)
    {
        var noteNature = AdjustmentNoteConventions.ParseNature(noteNatureValue);
        if (noteNature == AdjustmentNoteNature.Return)
        {
            return PurchaseCreditNoteBuildResult.Invalid("Return is not supported for purchase credit notes in v1.");
        }

        var sourceRef = new PurchaseCreditNoteSourceReference
        {
            ReferenceId = sourceRefRequest.ReferenceId,
            ReferenceNo = sourceRefRequest.ReferenceNo?.Trim() ?? string.Empty
        };

        var document = new PurchaseCreditNoteDocument
        {
            VoucherType = string.IsNullOrWhiteSpace(documentRequest.VoucherType) ? "PCN" : documentRequest.VoucherType.Trim().ToUpperInvariant(),
            No = documentRequest.No?.Trim().ToUpperInvariant() ?? string.Empty,
            Date = documentRequest.Date,
            DueDate = documentRequest.DueDate
        };

        var vendorInformation = new PurchaseCreditNoteVendorInformation
        {
            VendorId = vendorInformationRequest.VendorId,
            VendorNameSnapshot = vendorInformationRequest.VendorNameSnapshot?.Trim() ?? string.Empty,
            Address = vendorInformationRequest.Address?.Trim() ?? string.Empty,
            Attention = NormalizeOptional(vendorInformationRequest.Attention),
            Phone = NormalizeOptional(vendorInformationRequest.Phone)
        };

        var financialDetails = new PurchaseCreditNoteFinancialDetails
        {
            PaymentMode = ParsePaymentMode(financialDetailsRequest.PaymentMode),
            SupplierInvoiceNo = NormalizeOptional(financialDetailsRequest.SupplierInvoiceNo),
            LrNo = NormalizeOptional(financialDetailsRequest.LrNo),
            CurrencyId = financialDetailsRequest.CurrencyId,
            CurrencyCodeSnapshot = NormalizeOptional(financialDetailsRequest.CurrencyCodeSnapshot),
            CurrencySymbolSnapshot = NormalizeOptional(financialDetailsRequest.CurrencySymbolSnapshot)
        };

        var productInformation = new PurchaseCreditNoteProductInformation
        {
            VendorProducts = string.IsNullOrWhiteSpace(productInformationRequest.VendorProducts) ? "Vendor Products" : productInformationRequest.VendorProducts.Trim(),
            OwnProductsOnly = productInformationRequest.OwnProductsOnly
        };

        var general = new PurchaseCreditNoteGeneral
        {
            Notes = NormalizeOptional(generalRequest.Notes),
            SearchBarcode = NormalizeOptional(generalRequest.SearchBarcode),
            Taxable = generalRequest.Taxable,
            TaxApplication = ParseTaxApplication(generalRequest.TaxApplication),
            InterState = generalRequest.InterState,
            TaxOnFoc = generalRequest.TaxOnFoc
        };

        if (string.IsNullOrWhiteSpace(document.No))
        {
            return PurchaseCreditNoteBuildResult.Invalid("Purchase credit note number is required.");
        }

        if (sourceRef.ReferenceId is null || sourceRef.ReferenceId == Guid.Empty)
        {
            return PurchaseCreditNoteBuildResult.Invalid("Source purchase invoice is required.");
        }

        if (vendorInformation.VendorId == Guid.Empty)
        {
            return PurchaseCreditNoteBuildResult.Invalid("Vendor is required.");
        }

        if (itemsRequest is null || itemsRequest.Count == 0)
        {
            return PurchaseCreditNoteBuildResult.Invalid("At least one line item is required.");
        }

        var items = new List<PurchaseCreditNoteLineItem>(itemsRequest.Count);
        foreach (var itemRequest in itemsRequest)
        {
            if (itemRequest.SourceLineId == Guid.Empty)
            {
                return PurchaseCreditNoteBuildResult.Invalid("Each line item must reference a source invoice line.");
            }

            if (itemRequest.ProductId == Guid.Empty)
            {
                return PurchaseCreditNoteBuildResult.Invalid("Each line item must have a product.");
            }

            if (itemRequest.UnitId == Guid.Empty)
            {
                return PurchaseCreditNoteBuildResult.Invalid("Each line item must have a unit.");
            }

            if (itemRequest.Quantity <= 0)
            {
                return PurchaseCreditNoteBuildResult.Invalid("Line item quantity must be greater than zero.");
            }

            if (itemRequest.Foc < 0 || itemRequest.Rate < 0 || itemRequest.DiscountPercent < 0 || itemRequest.TaxPercent < 0 || itemRequest.SellingRate < 0 || itemRequest.WholesaleRate < 0 || itemRequest.Mrp < 0)
            {
                return PurchaseCreditNoteBuildResult.Invalid("Line item values cannot be negative.");
            }

            var totalQuantity = itemRequest.Quantity + itemRequest.Foc;
            var grossAmount = Math.Round(totalQuantity * itemRequest.Rate, 2, MidpointRounding.AwayFromZero);
            var discountAmount = Math.Round((grossAmount * itemRequest.DiscountPercent) / 100m, 2, MidpointRounding.AwayFromZero);
            var taxBaseQuantity = general.TaxOnFoc ? totalQuantity : itemRequest.Quantity;
            var taxBaseGross = Math.Round(taxBaseQuantity * itemRequest.Rate, 2, MidpointRounding.AwayFromZero);
            var discountRatio = grossAmount > 0 ? discountAmount / grossAmount : 0;
            var discountedTaxBase = general.TaxApplication == PurchaseCreditNoteTaxApplication.AfterDiscount
                ? Math.Round(taxBaseGross * (1 - discountRatio), 2, MidpointRounding.AwayFromZero)
                : taxBaseGross;
            var taxableAmount = Math.Max(0, general.Taxable
                ? discountedTaxBase
                : Math.Round(grossAmount - discountAmount, 2, MidpointRounding.AwayFromZero));
            var taxAmount = general.Taxable
                ? Math.Round((taxableAmount * itemRequest.TaxPercent) / 100m, 2, MidpointRounding.AwayFromZero)
                : 0;
            var lineTotal = Math.Round(taxableAmount + taxAmount, 2, MidpointRounding.AwayFromZero);
            var cost = totalQuantity > 0
                ? Math.Round(lineTotal / totalQuantity, 2, MidpointRounding.AwayFromZero)
                : 0;
            var profitPercent = cost > 0
                ? Math.Round(((itemRequest.SellingRate - cost) / cost) * 100m, 2, MidpointRounding.AwayFromZero)
                : 0;
            var profitAmount = Math.Round((itemRequest.SellingRate - cost) * totalQuantity, 2, MidpointRounding.AwayFromZero);

            items.Add(new PurchaseCreditNoteLineItem
            {
                SourceLineId = itemRequest.SourceLineId,
                Sno = itemRequest.Sno <= 0 ? items.Count + 1 : itemRequest.Sno,
                ProductId = itemRequest.ProductId,
                ProductCodeSnapshot = NormalizeOptional(itemRequest.ProductCodeSnapshot),
                ProductNameSnapshot = itemRequest.ProductNameSnapshot?.Trim() ?? string.Empty,
                HsnCode = NormalizeOptional(itemRequest.HsnCode),
                Quantity = itemRequest.Quantity,
                Foc = itemRequest.Foc,
                UnitId = itemRequest.UnitId,
                Rate = itemRequest.Rate,
                GrossAmount = grossAmount,
                DiscountPercent = itemRequest.DiscountPercent,
                DiscountAmount = discountAmount,
                TaxableAmount = taxableAmount,
                TaxPercent = general.Taxable ? itemRequest.TaxPercent : 0,
                TaxAmount = taxAmount,
                Cost = cost,
                ProfitPercent = profitPercent,
                ProfitAmount = profitAmount,
                SellingRate = itemRequest.SellingRate,
                WholesaleRate = itemRequest.WholesaleRate,
                Mrp = itemRequest.Mrp,
                LineTotal = lineTotal,
                WarehouseId = itemRequest.WarehouseId
            });
        }

        var additions = new List<PurchaseCreditNoteAddition>();
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
                return PurchaseCreditNoteBuildResult.Invalid("Addition amount cannot be negative.");
            }

            additions.Add(new PurchaseCreditNoteAddition
            {
                Type = ParseAdditionType(additionRequest.Type),
                LedgerId = additionRequest.LedgerId,
                LedgerNameSnapshot = ledgerSnapshot ?? string.Empty,
                Description = description,
                Amount = additionRequest.Amount
            });
        }

        var footer = new PurchaseCreditNoteFooter
        {
            Notes = NormalizeOptional(footerRequest.Notes),
            Total = Math.Round(items.Sum(item => item.LineTotal), 2, MidpointRounding.AwayFromZero),
            Discount = Math.Round(items.Sum(item => item.DiscountAmount), 2, MidpointRounding.AwayFromZero),
            Addition = Math.Round(additions.Where(item => item.Type == PurchaseCreditNoteAdditionType.Addition).Sum(item => item.Amount), 2, MidpointRounding.AwayFromZero),
            Deduction = Math.Round(additions.Where(item => item.Type == PurchaseCreditNoteAdditionType.Deduction).Sum(item => item.Amount), 2, MidpointRounding.AwayFromZero)
        };
        footer.NetTotal = Math.Round(footer.Total + footer.Addition - footer.Deduction, 2, MidpointRounding.AwayFromZero);

        return PurchaseCreditNoteBuildResult.Valid(noteNature, sourceRef, document, vendorInformation, financialDetails, productInformation, general, footer, items, additions);
    }

    private static async Task<string?> ResolveReferencesAsync(AppDbContext dbContext, PurchaseCreditNoteBuildResult buildResult, Guid? noteId, CancellationToken cancellationToken)
    {
        var purchaseInvoice = await dbContext.PurchaseInvoices
            .Include(current => current.Items)
            .FirstOrDefaultAsync(current => current.Id == buildResult.SourceRef.ReferenceId, cancellationToken);
        if (purchaseInvoice is null)
        {
            return "Selected purchase invoice reference does not exist.";
        }

        if (string.IsNullOrWhiteSpace(buildResult.SourceRef.ReferenceNo))
        {
            buildResult.SourceRef.ReferenceNo = purchaseInvoice.Document.No;
        }

        var vendor = await dbContext.Vendors.FirstOrDefaultAsync(current => current.Id == buildResult.VendorInformation.VendorId, cancellationToken);
        if (vendor is null)
        {
            return "Selected vendor does not exist.";
        }

        if (purchaseInvoice.VendorInformation.VendorId != buildResult.VendorInformation.VendorId)
        {
            return "Selected vendor does not match the referenced purchase invoice.";
        }

        buildResult.VendorInformation.Vendor = vendor;
        if (string.IsNullOrWhiteSpace(buildResult.VendorInformation.VendorNameSnapshot))
        {
            buildResult.VendorInformation.VendorNameSnapshot = vendor.BasicInfo.Name;
        }

        if (string.IsNullOrWhiteSpace(buildResult.VendorInformation.Address))
        {
            buildResult.VendorInformation.Address = purchaseInvoice.VendorInformation.Address;
        }

        if (string.IsNullOrWhiteSpace(buildResult.VendorInformation.Attention))
        {
            buildResult.VendorInformation.Attention = purchaseInvoice.VendorInformation.Attention;
        }

        if (string.IsNullOrWhiteSpace(buildResult.VendorInformation.Phone))
        {
            buildResult.VendorInformation.Phone = purchaseInvoice.VendorInformation.Phone;
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

        var existingQuantities = await dbContext.PurchaseCreditNoteItems
            .Where(item => item.PurchaseCreditNoteId != noteId.GetValueOrDefault()
                && item.PurchaseCreditNote != null
                && item.PurchaseCreditNote.SourceRef.ReferenceId == buildResult.SourceRef.ReferenceId)
            .GroupBy(item => item.SourceLineId)
            .Select(group => new
            {
                SourceLineId = group.Key,
                Quantity = group.Sum(item => item.Quantity + item.Foc)
            })
            .ToDictionaryAsync(item => item.SourceLineId, item => item.Quantity, cancellationToken);

        foreach (var item in buildResult.Items)
        {
            var sourceLine = purchaseInvoice.Items.FirstOrDefault(current => current.Id == item.SourceLineId);
            if (sourceLine is null)
            {
                return "One or more selected source invoice lines do not exist on the referenced purchase invoice.";
            }

            if (sourceLine.ProductId != item.ProductId)
            {
                return "Source invoice line does not match the selected product.";
            }

            if (sourceLine.UnitId != item.UnitId)
            {
                return "Source invoice line does not match the selected unit.";
            }

            var cumulativeQuantity = existingQuantities.GetValueOrDefault(item.SourceLineId, 0) + item.Quantity + item.Foc;
            if (cumulativeQuantity > sourceLine.Quantity + sourceLine.Foc)
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

            item.Cost = sourceLine.Cost;
            if (item.SellingRate <= 0 && sourceLine.SellingRate > 0)
            {
                item.SellingRate = sourceLine.SellingRate;
            }

            if (item.WholesaleRate <= 0 && sourceLine.WholesaleRate > 0)
            {
                item.WholesaleRate = sourceLine.WholesaleRate;
            }

            if (item.Mrp <= 0 && sourceLine.Mrp > 0)
            {
                item.Mrp = sourceLine.Mrp;
            }

            var totalQuantity = item.Quantity + item.Foc;
            item.ProfitPercent = item.Cost > 0
                ? Math.Round(((item.SellingRate - item.Cost) / item.Cost) * 100m, 2, MidpointRounding.AwayFromZero)
                : 0;
            item.ProfitAmount = Math.Round((item.SellingRate - item.Cost) * totalQuantity, 2, MidpointRounding.AwayFromZero);

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

    private static PurchaseCreditNotePaymentMode ParsePaymentMode(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return PurchaseCreditNotePaymentMode.Credit;
        }

        return value.Trim() switch
        {
            "Cash" => PurchaseCreditNotePaymentMode.Cash,
            _ => PurchaseCreditNotePaymentMode.Credit
        };
    }

    private static PurchaseCreditNoteTaxApplication ParseTaxApplication(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return PurchaseCreditNoteTaxApplication.AfterDiscount;
        }

        return value.Trim() switch
        {
            "Before Discount" => PurchaseCreditNoteTaxApplication.BeforeDiscount,
            _ => PurchaseCreditNoteTaxApplication.AfterDiscount
        };
    }

    private static PurchaseCreditNoteAdditionType ParseAdditionType(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return PurchaseCreditNoteAdditionType.Addition;
        }

        return value.Trim() switch
        {
            "Deduction" => PurchaseCreditNoteAdditionType.Deduction,
            _ => PurchaseCreditNoteAdditionType.Addition
        };
    }

    private static PurchaseCreditNoteStatus ParseStatus(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return PurchaseCreditNoteStatus.Draft;
        }

        return value.Trim() switch
        {
            "Submitted" => PurchaseCreditNoteStatus.Submitted,
            "Cancelled" => PurchaseCreditNoteStatus.Cancelled,
            _ => PurchaseCreditNoteStatus.Draft
        };
    }

    private static string ToStatusLabel(PurchaseCreditNoteStatus value) => value switch
    {
        PurchaseCreditNoteStatus.Submitted => "Submitted",
        PurchaseCreditNoteStatus.Cancelled => "Cancelled",
        _ => "Draft"
    };

    private static string? NormalizeOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed record PurchaseCreditNoteBuildResult(
        string? Error,
        AdjustmentNoteNature NoteNature = AdjustmentNoteNature.Other,
        PurchaseCreditNoteSourceReference? SourceRef = null,
        PurchaseCreditNoteDocument? Document = null,
        PurchaseCreditNoteVendorInformation? VendorInformation = null,
        PurchaseCreditNoteFinancialDetails? FinancialDetails = null,
        PurchaseCreditNoteProductInformation? ProductInformation = null,
        PurchaseCreditNoteGeneral? General = null,
        PurchaseCreditNoteFooter? Footer = null,
        List<PurchaseCreditNoteLineItem>? Items = null,
        List<PurchaseCreditNoteAddition>? Additions = null)
    {
        public PurchaseCreditNoteSourceReference SourceRef { get; init; } = SourceRef ?? new PurchaseCreditNoteSourceReference();
        public PurchaseCreditNoteDocument Document { get; init; } = Document ?? new PurchaseCreditNoteDocument();
        public PurchaseCreditNoteVendorInformation VendorInformation { get; init; } = VendorInformation ?? new PurchaseCreditNoteVendorInformation();
        public PurchaseCreditNoteFinancialDetails FinancialDetails { get; init; } = FinancialDetails ?? new PurchaseCreditNoteFinancialDetails();
        public PurchaseCreditNoteProductInformation ProductInformation { get; init; } = ProductInformation ?? new PurchaseCreditNoteProductInformation();
        public PurchaseCreditNoteGeneral General { get; init; } = General ?? new PurchaseCreditNoteGeneral();
        public PurchaseCreditNoteFooter Footer { get; init; } = Footer ?? new PurchaseCreditNoteFooter();
        public List<PurchaseCreditNoteLineItem> Items { get; init; } = Items ?? [];
        public List<PurchaseCreditNoteAddition> Additions { get; init; } = Additions ?? [];

        public static PurchaseCreditNoteBuildResult Valid(
            AdjustmentNoteNature noteNature,
            PurchaseCreditNoteSourceReference sourceRef,
            PurchaseCreditNoteDocument document,
            PurchaseCreditNoteVendorInformation vendorInformation,
            PurchaseCreditNoteFinancialDetails financialDetails,
            PurchaseCreditNoteProductInformation productInformation,
            PurchaseCreditNoteGeneral general,
            PurchaseCreditNoteFooter footer,
            List<PurchaseCreditNoteLineItem> items,
            List<PurchaseCreditNoteAddition> additions) =>
            new(null, noteNature, sourceRef, document, vendorInformation, financialDetails, productInformation, general, footer, items, additions);

        public static PurchaseCreditNoteBuildResult Invalid(string error) => new(error);
    }
}
