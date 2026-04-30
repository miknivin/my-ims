using backend.Features.Masters.Currencies;
using backend.Features.Inventory;
using backend.Features.Inventory.GoodsReceiptNotes;
using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Products;
using backend.Features.Masters.Uoms;
using backend.Features.Masters.Vendors;
using backend.Features.Masters.Warehouses;
using backend.Features.Transactions.PurchaseOrders;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Transactions.PurchaseInvoices;

public static class PurchaseInvoiceEndpoints
{
    public static IEndpointRouteBuilder MapPurchaseInvoiceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/purchase-invoices").WithTags("Purchase Invoices");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPatch("/{id:guid}", UpdateStatusAsync);

        return app;
    }

    private static IQueryable<PurchaseInvoice> BuildQuery(AppDbContext dbContext)
    {
        return dbContext.PurchaseInvoices
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
        var purchaseInvoices = await dbContext.PurchaseInvoices
            .AsNoTracking()
            .OrderByDescending(current => current.UpdatedAtUtc)
            .Select(current => new PurchaseInvoiceListItemDto(
                current.Id,
                current.Document.No,
                current.Document.Date,
                current.VendorInformation.VendorNameSnapshot,
                current.Footer.NetTotal,
                ToStatusLabel(current.Status),
                current.CreatedAtUtc,
                current.UpdatedAtUtc))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<PurchaseInvoiceListItemDto>>(true, "Purchase invoice list fetched successfully.", purchaseInvoices));
    }

    private static async Task<IResult> GetByIdAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var purchaseInvoice = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return purchaseInvoice is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Purchase invoice not found.", null))
            : TypedResults.Ok(new ApiResponse<PurchaseInvoiceDto>(true, "Purchase invoice fetched successfully.", PurchaseInvoiceDto.FromEntity(purchaseInvoice)));
    }

    private static async Task<IResult> CreateAsync(CreatePurchaseInvoiceRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildPurchaseInvoiceRequest(request.SourceRef, request.Document, request.VendorInformation, request.FinancialDetails, request.ProductInformation, request.General, request.Items, request.Additions, request.Footer);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.PurchaseInvoices.AnyAsync(current => current.Document.No == buildResult.Document.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Purchase invoice number already exists.", null));
        }

        var resolutionError = await ResolveReferencesAsync(dbContext, buildResult, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        var now = DateTime.UtcNow;
        var purchaseInvoice = new PurchaseInvoice
        {
            SourceRef = buildResult.SourceRef,
            Document = buildResult.Document,
            VendorInformation = buildResult.VendorInformation,
            FinancialDetails = buildResult.FinancialDetails,
            ProductInformation = buildResult.ProductInformation,
            General = buildResult.General,
            Items = buildResult.Items,
            Additions = buildResult.Additions,
            Footer = buildResult.Footer,
            Status = ParseStatus(request.Status),
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.PurchaseInvoices.Add(purchaseInvoice);
        if (purchaseInvoice.Status == PurchaseInvoiceStatus.Submitted)
        {
            var stockError = await ApplySubmissionStockEffectsAsync(dbContext, purchaseInvoice, cancellationToken);
            if (stockError is not null)
            {
                return TypedResults.BadRequest(new ApiResponse<object>(false, stockError, null));
            }

            var journalError = await PurchaseInvoiceJournalPosting.PostAsync(
                dbContext,
                purchaseInvoice,
                cancellationToken);
            if (journalError is not null)
            {
                return TypedResults.BadRequest(new ApiResponse<object>(false, journalError, null));
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var created = await BuildQuery(dbContext).FirstAsync(current => current.Id == purchaseInvoice.Id, cancellationToken);
        return TypedResults.Created($"/api/transactions/purchase-invoices/{purchaseInvoice.Id}", new ApiResponse<PurchaseInvoiceDto>(true, "Purchase invoice created successfully.", PurchaseInvoiceDto.FromEntity(created)));
    }

    private static async Task<IResult> UpdateStatusAsync(Guid id, UpdatePurchaseInvoiceStatusRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var purchaseInvoice = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (purchaseInvoice is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Purchase invoice not found.", null));
        }

        var nextStatus = ParseStatus(request.Status);
        if (purchaseInvoice.Status == nextStatus)
        {
            var unchanged = await BuildQuery(dbContext).FirstAsync(current => current.Id == id, cancellationToken);
            return TypedResults.Ok(new ApiResponse<PurchaseInvoiceDto>(true, "Purchase invoice updated successfully.", PurchaseInvoiceDto.FromEntity(unchanged)));
        }

        var transitionError = ValidateStatusTransition(purchaseInvoice.Status, nextStatus);
        if (transitionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, transitionError, null));
        }

        if (nextStatus == PurchaseInvoiceStatus.Submitted)
        {
            var stockError = await ApplySubmissionStockEffectsAsync(dbContext, purchaseInvoice, cancellationToken);
            if (stockError is not null)
            {
                return TypedResults.BadRequest(new ApiResponse<object>(false, stockError, null));
            }

            var journalError = await PurchaseInvoiceJournalPosting.PostAsync(
                dbContext,
                purchaseInvoice,
                cancellationToken);
            if (journalError is not null)
            {
                return TypedResults.BadRequest(new ApiResponse<object>(false, journalError, null));
            }
        }
        else if (purchaseInvoice.Status == PurchaseInvoiceStatus.Submitted && nextStatus == PurchaseInvoiceStatus.Cancelled)
        {
            if (purchaseInvoice.SourceRef.Type == PurchaseInvoiceReferenceType.Direct)
            {
                if (await InventoryPostingService.HasConsumedLayersAsync(dbContext, StockSourceTypes.PurchaseInvoice, purchaseInvoice.Id, cancellationToken))
                {
                    return TypedResults.BadRequest(new ApiResponse<object>(false, "Submitted purchase invoice cannot be cancelled after its stock has been issued.", null));
                }
            }
            else if (purchaseInvoice.SourceRef.Type == PurchaseInvoiceReferenceType.GoodsReceipt)
            {
                if (await InventoryPostingService.HasPostRevaluationConsumptionAsync(dbContext, StockSourceTypes.PurchaseInvoice, purchaseInvoice.Id, cancellationToken))
                {
                    return TypedResults.BadRequest(new ApiResponse<object>(false, "Submitted purchase invoice cannot be cancelled after revalued stock has been issued.", null));
                }
            }

            await InventoryPostingService.RevertSourceAsync(dbContext, StockSourceTypes.PurchaseInvoice, purchaseInvoice.Id, cancellationToken);

            var journalError = await PurchaseInvoiceJournalPosting.ReverseAsync(
                dbContext,
                purchaseInvoice.Id,
                DateOnly.FromDateTime(DateTime.UtcNow),
                cancellationToken);
            if (journalError is not null)
            {
                return TypedResults.BadRequest(new ApiResponse<object>(false, journalError, null));
            }
        }

        purchaseInvoice.Status = nextStatus;
        purchaseInvoice.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        var updated = await BuildQuery(dbContext).FirstAsync(current => current.Id == id, cancellationToken);
        return TypedResults.Ok(new ApiResponse<PurchaseInvoiceDto>(true, "Purchase invoice updated successfully.", PurchaseInvoiceDto.FromEntity(updated)));
    }

    private static PurchaseInvoiceBuildResult BuildPurchaseInvoiceRequest(
        PurchaseInvoiceSourceReferenceRequest sourceRefRequest,
        PurchaseInvoiceDocumentRequest documentRequest,
        PurchaseInvoiceVendorInformationRequest vendorInformationRequest,
        PurchaseInvoiceFinancialDetailsRequest financialDetailsRequest,
        PurchaseInvoiceProductInformationRequest productInformationRequest,
        PurchaseInvoiceGeneralRequest generalRequest,
        IReadOnlyList<PurchaseInvoiceLineItemRequest> itemsRequest,
        IReadOnlyList<PurchaseInvoiceAdditionRequest> additionsRequest,
        PurchaseInvoiceFooterRequest footerRequest)
    {
        var sourceRef = new PurchaseInvoiceSourceReference
        {
            Type = ParseReferenceType(sourceRefRequest.Type),
            ReferenceId = sourceRefRequest.ReferenceId,
            ReferenceNo = sourceRefRequest.ReferenceNo?.Trim() ?? string.Empty
        };

        var document = new PurchaseInvoiceDocument
        {
            No = documentRequest.No?.Trim().ToUpperInvariant() ?? string.Empty,
            Date = documentRequest.Date,
            DueDate = documentRequest.DueDate
        };

        var vendorInformation = new PurchaseInvoiceVendorInformation
        {
            VendorId = vendorInformationRequest.VendorId,
            VendorNameSnapshot = vendorInformationRequest.VendorNameSnapshot?.Trim() ?? string.Empty,
            Address = vendorInformationRequest.Address?.Trim() ?? string.Empty,
            Attention = NormalizeOptional(vendorInformationRequest.Attention),
            Phone = NormalizeOptional(vendorInformationRequest.Phone)
        };

        var financialDetails = new PurchaseInvoiceFinancialDetails
        {
            PaymentMode = ParsePaymentMode(financialDetailsRequest.PaymentMode),
            SupplierInvoiceNo = NormalizeOptional(financialDetailsRequest.SupplierInvoiceNo),
            LrNo = NormalizeOptional(financialDetailsRequest.LrNo),
            CurrencyId = financialDetailsRequest.CurrencyId,
            CurrencyCodeSnapshot = NormalizeOptional(financialDetailsRequest.CurrencyCodeSnapshot),
            CurrencySymbolSnapshot = NormalizeOptional(financialDetailsRequest.CurrencySymbolSnapshot),
            Balance = 0
        };

        var productInformation = new PurchaseInvoiceProductInformation
        {
            VendorProducts = string.IsNullOrWhiteSpace(productInformationRequest.VendorProducts) ? "Vendor Products" : productInformationRequest.VendorProducts.Trim(),
            OwnProductsOnly = productInformationRequest.OwnProductsOnly
        };

        var general = new PurchaseInvoiceGeneral
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
            return PurchaseInvoiceBuildResult.Invalid("Purchase invoice number is required.");
        }

        if (vendorInformation.VendorId == Guid.Empty)
        {
            return PurchaseInvoiceBuildResult.Invalid("Vendor is required.");
        }

        if (string.IsNullOrWhiteSpace(vendorInformation.Address))
        {
            return PurchaseInvoiceBuildResult.Invalid("Vendor address is required.");
        }

        if (sourceRef.Type != PurchaseInvoiceReferenceType.Direct && string.IsNullOrWhiteSpace(sourceRef.ReferenceNo))
        {
            return PurchaseInvoiceBuildResult.Invalid("Reference number is required for the selected source type.");
        }

        if (sourceRef.Type == PurchaseInvoiceReferenceType.GoodsReceipt && sourceRef.ReferenceId is null)
        {
            return PurchaseInvoiceBuildResult.Invalid("Goods receipt reference is required for the selected source type.");
        }

        if (itemsRequest is null || itemsRequest.Count == 0)
        {
            return PurchaseInvoiceBuildResult.Invalid("At least one line item is required.");
        }

        var items = new List<PurchaseInvoiceLineItem>(itemsRequest.Count);
        foreach (var itemRequest in itemsRequest)
        {
            if (itemRequest.ProductId == Guid.Empty)
            {
                return PurchaseInvoiceBuildResult.Invalid("Each line item must have a product.");
            }

            if (itemRequest.UnitId == Guid.Empty)
            {
                return PurchaseInvoiceBuildResult.Invalid("Each line item must have a unit.");
            }

            if (itemRequest.Quantity <= 0)
            {
                return PurchaseInvoiceBuildResult.Invalid("Line item quantity must be greater than zero.");
            }

            if (itemRequest.Foc < 0 || itemRequest.Rate < 0 || itemRequest.DiscountPercent < 0 || itemRequest.TaxPercent < 0 || itemRequest.SellingRate < 0 || itemRequest.WholesaleRate < 0 || itemRequest.Mrp < 0)
            {
                return PurchaseInvoiceBuildResult.Invalid("Line item values cannot be negative.");
            }

            var totalQuantity = itemRequest.Quantity + itemRequest.Foc;
            var grossAmount = Math.Round(totalQuantity * itemRequest.Rate, 2, MidpointRounding.AwayFromZero);
            var discountAmount = Math.Round((grossAmount * itemRequest.DiscountPercent) / 100m, 2, MidpointRounding.AwayFromZero);
            var taxBaseQuantity = general.TaxOnFoc ? totalQuantity : itemRequest.Quantity;
            var taxBaseGross = Math.Round(taxBaseQuantity * itemRequest.Rate, 2, MidpointRounding.AwayFromZero);
            var discountRatio = grossAmount > 0 ? discountAmount / grossAmount : 0;
            var discountedTaxBase = general.TaxApplication == PurchaseInvoiceTaxApplication.AfterDiscount
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

            items.Add(new PurchaseInvoiceLineItem
            {
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

        var additions = new List<PurchaseInvoiceAddition>();
        foreach (var additionRequest in additionsRequest ?? [])
        {
            var normalizedType = ParseAdditionType(additionRequest.Type);
            var description = NormalizeOptional(additionRequest.Description);
            var ledgerSnapshot = NormalizeOptional(additionRequest.LedgerNameSnapshot);
            var hasMeaningfulData = additionRequest.LedgerId is not null || description is not null || additionRequest.Amount != 0;

            if (!hasMeaningfulData)
            {
                continue;
            }

            if (additionRequest.Amount < 0)
            {
                return PurchaseInvoiceBuildResult.Invalid("Addition amount cannot be negative.");
            }

            additions.Add(new PurchaseInvoiceAddition
            {
                Type = normalizedType,
                LedgerId = additionRequest.LedgerId,
                LedgerNameSnapshot = ledgerSnapshot ?? string.Empty,
                Description = description,
                Amount = additionRequest.Amount
            });
        }

        var footer = new PurchaseInvoiceFooter
        {
            Notes = NormalizeOptional(footerRequest.Notes),
            Total = Math.Round(items.Sum(item => item.LineTotal), 2, MidpointRounding.AwayFromZero),
            Discount = Math.Round(items.Sum(item => item.DiscountAmount), 2, MidpointRounding.AwayFromZero),
            Addition = Math.Round(additions.Where(item => item.Type == PurchaseInvoiceAdditionType.Addition).Sum(item => item.Amount), 2, MidpointRounding.AwayFromZero),
            Deduction = Math.Round(additions.Where(item => item.Type == PurchaseInvoiceAdditionType.Deduction).Sum(item => item.Amount), 2, MidpointRounding.AwayFromZero)
        };
        footer.NetTotal = Math.Round(footer.Total + footer.Addition - footer.Deduction, 2, MidpointRounding.AwayFromZero);
        financialDetails.Balance = footer.NetTotal;

        return PurchaseInvoiceBuildResult.Valid(sourceRef, document, vendorInformation, financialDetails, productInformation, general, footer, items, additions);
    }

    private static async Task<string?> ResolveReferencesAsync(AppDbContext dbContext, PurchaseInvoiceBuildResult buildResult, CancellationToken cancellationToken)
    {
        if (buildResult.SourceRef.Type == PurchaseInvoiceReferenceType.PurchaseOrder && buildResult.SourceRef.ReferenceId is not null)
        {
            var purchaseOrder = await dbContext.PurchaseOrders.FirstOrDefaultAsync(current => current.Id == buildResult.SourceRef.ReferenceId.Value, cancellationToken);
            if (purchaseOrder is null)
            {
                return "Selected purchase order reference does not exist.";
            }

            if (string.IsNullOrWhiteSpace(buildResult.SourceRef.ReferenceNo))
            {
                buildResult.SourceRef.ReferenceNo = purchaseOrder.OrderDetails.No;
            }
        }
        else if (buildResult.SourceRef.Type == PurchaseInvoiceReferenceType.GoodsReceipt && buildResult.SourceRef.ReferenceId is not null)
        {
            var goodsReceiptNote = await dbContext.GoodsReceiptNotes
                .FirstOrDefaultAsync(current => current.Id == buildResult.SourceRef.ReferenceId.Value, cancellationToken);
            if (goodsReceiptNote is null)
            {
                return "Selected goods receipt reference does not exist.";
            }

            if (string.IsNullOrWhiteSpace(buildResult.SourceRef.ReferenceNo))
            {
                buildResult.SourceRef.ReferenceNo = goodsReceiptNote.Document.No;
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

            if (string.IsNullOrWhiteSpace(item.ProductCodeSnapshot))
            {
                item.ProductCodeSnapshot = product.BasicInfo.Code;
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

    private static PurchaseInvoiceReferenceType ParseReferenceType(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return PurchaseInvoiceReferenceType.Direct;
        }

        return value.Trim() switch
        {
            "PurchaseOrder" => PurchaseInvoiceReferenceType.PurchaseOrder,
            "GoodsReceipt" => PurchaseInvoiceReferenceType.GoodsReceipt,
            _ => PurchaseInvoiceReferenceType.Direct
        };
    }

    private static PurchaseInvoicePaymentMode ParsePaymentMode(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return PurchaseInvoicePaymentMode.Credit;
        }

        return value.Trim() switch
        {
            "Cash" => PurchaseInvoicePaymentMode.Cash,
            _ => PurchaseInvoicePaymentMode.Credit
        };
    }

    private static PurchaseInvoiceTaxApplication ParseTaxApplication(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return PurchaseInvoiceTaxApplication.AfterDiscount;
        }

        return value.Trim() switch
        {
            "Before Discount" => PurchaseInvoiceTaxApplication.BeforeDiscount,
            _ => PurchaseInvoiceTaxApplication.AfterDiscount
        };
    }

    private static PurchaseInvoiceAdditionType ParseAdditionType(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return PurchaseInvoiceAdditionType.Addition;
        }

        return value.Trim() switch
        {
            "Deduction" => PurchaseInvoiceAdditionType.Deduction,
            _ => PurchaseInvoiceAdditionType.Addition
        };
    }

    private static PurchaseInvoiceStatus ParseStatus(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return PurchaseInvoiceStatus.Draft;
        }

        return value.Trim() switch
        {
            "Created" => PurchaseInvoiceStatus.Submitted,
            "Submitted" => PurchaseInvoiceStatus.Submitted,
            "Cancelled" => PurchaseInvoiceStatus.Cancelled,
            _ => PurchaseInvoiceStatus.Draft
        };
    }

    private static async Task<string?> ApplySubmissionStockEffectsAsync(
        AppDbContext dbContext,
        PurchaseInvoice purchaseInvoice,
        CancellationToken cancellationToken)
    {
        var inventorySettings = await InventorySettingsResolver.GetEffectiveSettingsAsync(dbContext, cancellationToken);

        return purchaseInvoice.SourceRef.Type switch
        {
            PurchaseInvoiceReferenceType.Direct => await InventoryPostingService.ApplyReceiptsAsync(
                dbContext,
                inventorySettings,
                StockSourceTypes.PurchaseInvoice,
                purchaseInvoice.Id,
                purchaseInvoice.Document.Date,
                BuildDirectReceiptPostingLines(purchaseInvoice),
                cancellationToken),
            PurchaseInvoiceReferenceType.GoodsReceipt => await ApplyGoodsReceiptRevaluationAsync(
                dbContext,
                inventorySettings,
                purchaseInvoice,
                cancellationToken),
            PurchaseInvoiceReferenceType.PurchaseOrder => "Submitted purchase invoices against purchase orders require a submitted goods receipt note. Use the GoodsReceipt source type instead.",
            _ => "Unsupported purchase invoice source type."
        };
    }

    private static async Task<string?> ApplyGoodsReceiptRevaluationAsync(
        AppDbContext dbContext,
        EffectiveInventorySettings inventorySettings,
        PurchaseInvoice purchaseInvoice,
        CancellationToken cancellationToken)
    {
        if (purchaseInvoice.SourceRef.ReferenceId is null || purchaseInvoice.SourceRef.ReferenceId == Guid.Empty)
        {
            return "Purchase invoice against goods receipt must reference a goods receipt note.";
        }

        var goodsReceiptNote = await dbContext.GoodsReceiptNotes
            .Include(current => current.Items)
            .FirstOrDefaultAsync(current => current.Id == purchaseInvoice.SourceRef.ReferenceId.Value, cancellationToken);
        if (goodsReceiptNote is null)
        {
            return "Selected goods receipt reference does not exist.";
        }

        if (goodsReceiptNote.Status != GoodsReceiptStatuses.Submitted)
        {
            return "Purchase invoice can only be submitted against a submitted goods receipt note.";
        }

        if (goodsReceiptNote.VendorInformation.VendorId != purchaseInvoice.VendorInformation.VendorId)
        {
            return "Referenced goods receipt note does not belong to the selected vendor.";
        }

        if (await dbContext.PurchaseInvoices.AnyAsync(
                current =>
                    current.Id != purchaseInvoice.Id &&
                    current.SourceRef.Type == PurchaseInvoiceReferenceType.GoodsReceipt &&
                    current.SourceRef.ReferenceId == goodsReceiptNote.Id &&
                    current.Status == PurchaseInvoiceStatus.Submitted,
                cancellationToken))
        {
            return "Referenced goods receipt note is already linked to another submitted purchase invoice.";
        }

        var matchResult = BuildGoodsReceiptRevaluationLines(purchaseInvoice, goodsReceiptNote);
        if (matchResult.Error is not null)
        {
            return matchResult.Error;
        }

        return await InventoryPostingService.ApplyRevaluationsAsync(
            dbContext,
            inventorySettings,
            StockSourceTypes.PurchaseInvoice,
            purchaseInvoice.Id,
            purchaseInvoice.Document.Date,
            matchResult.Lines,
            cancellationToken);
    }

    private static List<InventoryReceiptPostingLine> BuildDirectReceiptPostingLines(PurchaseInvoice purchaseInvoice) =>
        purchaseInvoice.Items
            .OrderBy(item => item.Sno)
            .ThenBy(item => item.Id)
            .Select(item => new InventoryReceiptPostingLine(
                item.Id,
                item.ProductId,
                item.WarehouseId ?? Guid.Empty,
                item.Quantity + item.Foc,
                item.TaxableAmount,
                item.ProductNameSnapshot))
            .ToList();

    private static GoodsReceiptRevaluationBuildResult BuildGoodsReceiptRevaluationLines(
        PurchaseInvoice purchaseInvoice,
        GoodsReceiptNote goodsReceiptNote)
    {
        var purchaseLines = purchaseInvoice.Items
            .OrderBy(item => item.Sno)
            .ThenBy(item => item.Id)
            .ToList();
        var receiptLines = goodsReceiptNote.Items
            .OrderBy(item => item.SerialNo)
            .ThenBy(item => item.Id)
            .ToList();

        if (purchaseLines.Count != receiptLines.Count)
        {
            return GoodsReceiptRevaluationBuildResult.Invalid("Purchase invoice line count must match the referenced goods receipt note.");
        }

        var lines = new List<InventoryRevaluationPostingLine>(purchaseLines.Count);
        for (var index = 0; index < purchaseLines.Count; index++)
        {
            var purchaseLine = purchaseLines[index];
            var receiptLine = receiptLines[index];

            var purchaseQuantity = RoundQuantity(purchaseLine.Quantity + purchaseLine.Foc);
            var receiptQuantity = RoundQuantity(receiptLine.Quantity + receiptLine.FocQuantity);
            if (purchaseLine.ProductId != receiptLine.ProductId ||
                purchaseLine.WarehouseId != receiptLine.WarehouseId ||
                purchaseQuantity != receiptQuantity)
            {
                return GoodsReceiptRevaluationBuildResult.Invalid("Purchase invoice items must match the referenced goods receipt note by line, warehouse, and received quantity.");
            }

            if (purchaseLine.WarehouseId is null)
            {
                return GoodsReceiptRevaluationBuildResult.Invalid("Warehouse is required for submitted purchase invoice items against goods receipt.");
            }

            var newUnitRate = purchaseQuantity > 0
                ? RoundRate(purchaseLine.TaxableAmount / purchaseQuantity)
                : 0;

            lines.Add(new InventoryRevaluationPostingLine(
                purchaseLine.Id,
                purchaseLine.ProductId,
                purchaseLine.WarehouseId.Value,
                StockSourceTypes.GoodsReceiptNote,
                goodsReceiptNote.Id,
                receiptLine.Id,
                newUnitRate,
                purchaseLine.ProductNameSnapshot));
        }

        return GoodsReceiptRevaluationBuildResult.Valid(lines);
    }

    private static string? ValidateStatusTransition(PurchaseInvoiceStatus currentStatus, PurchaseInvoiceStatus nextStatus)
    {
        if (currentStatus == PurchaseInvoiceStatus.Cancelled)
        {
            return "Cancelled purchase invoices cannot be changed.";
        }

        return (currentStatus, nextStatus) switch
        {
            (PurchaseInvoiceStatus.Draft, PurchaseInvoiceStatus.Submitted) => null,
            (PurchaseInvoiceStatus.Draft, PurchaseInvoiceStatus.Cancelled) => null,
            (PurchaseInvoiceStatus.Submitted, PurchaseInvoiceStatus.Cancelled) => null,
            _ => "Only draft purchase invoices can be submitted, and only submitted purchase invoices can be cancelled."
        };
    }

    private static decimal RoundQuantity(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private static decimal RoundRate(decimal value) =>
        Math.Round(value, 4, MidpointRounding.AwayFromZero);

    private static string ToStatusLabel(PurchaseInvoiceStatus value) => value switch
    {
        PurchaseInvoiceStatus.Submitted => "Submitted",
        PurchaseInvoiceStatus.Cancelled => "Cancelled",
        _ => "Draft"
    };

    private static string? NormalizeOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed record PurchaseInvoiceBuildResult(
        string? Error,
        PurchaseInvoiceSourceReference? SourceRef = null,
        PurchaseInvoiceDocument? Document = null,
        PurchaseInvoiceVendorInformation? VendorInformation = null,
        PurchaseInvoiceFinancialDetails? FinancialDetails = null,
        PurchaseInvoiceProductInformation? ProductInformation = null,
        PurchaseInvoiceGeneral? General = null,
        PurchaseInvoiceFooter? Footer = null,
        List<PurchaseInvoiceLineItem>? Items = null,
        List<PurchaseInvoiceAddition>? Additions = null)
    {
        public PurchaseInvoiceSourceReference SourceRef { get; init; } = SourceRef ?? new PurchaseInvoiceSourceReference();
        public PurchaseInvoiceDocument Document { get; init; } = Document ?? new PurchaseInvoiceDocument();
        public PurchaseInvoiceVendorInformation VendorInformation { get; init; } = VendorInformation ?? new PurchaseInvoiceVendorInformation();
        public PurchaseInvoiceFinancialDetails FinancialDetails { get; init; } = FinancialDetails ?? new PurchaseInvoiceFinancialDetails();
        public PurchaseInvoiceProductInformation ProductInformation { get; init; } = ProductInformation ?? new PurchaseInvoiceProductInformation();
        public PurchaseInvoiceGeneral General { get; init; } = General ?? new PurchaseInvoiceGeneral();
        public PurchaseInvoiceFooter Footer { get; init; } = Footer ?? new PurchaseInvoiceFooter();
        public List<PurchaseInvoiceLineItem> Items { get; init; } = Items ?? [];
        public List<PurchaseInvoiceAddition> Additions { get; init; } = Additions ?? [];

        public static PurchaseInvoiceBuildResult Valid(
            PurchaseInvoiceSourceReference sourceRef,
            PurchaseInvoiceDocument document,
            PurchaseInvoiceVendorInformation vendorInformation,
            PurchaseInvoiceFinancialDetails financialDetails,
            PurchaseInvoiceProductInformation productInformation,
            PurchaseInvoiceGeneral general,
            PurchaseInvoiceFooter footer,
            List<PurchaseInvoiceLineItem> items,
            List<PurchaseInvoiceAddition> additions) =>
            new(null, sourceRef, document, vendorInformation, financialDetails, productInformation, general, footer, items, additions);

        public static PurchaseInvoiceBuildResult Invalid(string error) =>
            new(error);
    }

    private sealed record GoodsReceiptRevaluationBuildResult(string? Error, List<InventoryRevaluationPostingLine>? Lines = null)
    {
        public List<InventoryRevaluationPostingLine> Lines { get; init; } = Lines ?? [];

        public static GoodsReceiptRevaluationBuildResult Valid(List<InventoryRevaluationPostingLine> lines) =>
            new(null, lines);

        public static GoodsReceiptRevaluationBuildResult Invalid(string error) =>
            new(error);
    }
}
