using backend.Features.Masters.Currencies;
using backend.Features.Masters.Customers;
using backend.Features.Inventory;
using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Products;
using backend.Features.Masters.Uoms;
using backend.Features.Masters.Warehouses;
using backend.Features.Transactions.SalesOrders;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Transactions.SalesInvoices;

public static class SalesInvoiceEndpoints
{
    public static IEndpointRouteBuilder MapSalesInvoiceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/sales-invoices").WithTags("Sales Invoices");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPatch("/{id:guid}", UpdateStatusAsync);

        return app;
    }

    private static IQueryable<SalesInvoice> BuildQuery(AppDbContext dbContext)
    {
        return dbContext.SalesInvoices
            .Include(current => current.CustomerInformation.Customer)
            .Include(current => current.FinancialDetails.Currency)
            .Include(current => current.Items)
                .ThenInclude(item => item.Unit)
            .Include(current => current.Items)
                .ThenInclude(item => item.Warehouse)
            .Include(current => current.Additions)
                .ThenInclude(item => item.Ledger);
    }

    private static async Task<IResult> GetAllAsync(
        string? keyword,
        int? limit,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var query = dbContext.SalesInvoices.AsNoTracking();
        var normalizedKeyword = keyword?.Trim();
        if (!string.IsNullOrWhiteSpace(normalizedKeyword))
        {
            var pattern = $"%{normalizedKeyword}%";
            query = query.Where(current =>
                EF.Functions.ILike(current.Document.No, pattern) ||
                EF.Functions.ILike(current.CustomerInformation.CustomerNameSnapshot, pattern));
        }

        var normalizedLimit = limit is > 0 ? Math.Min(limit.Value, 100) : 0;
        var sortedQuery = query
            .OrderByDescending(current => current.UpdatedAtUtc)
            .Select(current => new SalesInvoiceListItemDto(
                current.Id,
                current.Document.No,
                current.Document.Date,
                current.CustomerInformation.CustomerNameSnapshot,
                current.Footer.NetTotal,
                ToStatusLabel(current.Status),
                current.CreatedAtUtc,
                current.UpdatedAtUtc));

        var salesInvoices = normalizedLimit > 0
            ? await sortedQuery.Take(normalizedLimit).ToListAsync(cancellationToken)
            : await sortedQuery.ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<SalesInvoiceListItemDto>>(true, "Sales invoice list fetched successfully.", salesInvoices));
    }

    private static async Task<IResult> GetByIdAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var salesInvoice = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return salesInvoice is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Sales invoice not found.", null))
            : TypedResults.Ok(new ApiResponse<SalesInvoiceDto>(true, "Sales invoice fetched successfully.", SalesInvoiceDto.FromEntity(salesInvoice)));
    }

    private static async Task<IResult> CreateAsync(CreateSalesInvoiceRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildSalesInvoiceRequest(request.SourceRef, request.Document, request.CustomerInformation, request.FinancialDetails, request.General, request.Items, request.Additions, request.Footer);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.SalesInvoices.AnyAsync(current => current.Document.No == buildResult.Document.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Sales invoice number already exists.", null));
        }

        var resolutionError = await ResolveReferencesAsync(dbContext, buildResult, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        var now = DateTime.UtcNow;
        var salesInvoice = new SalesInvoice
        {
            SourceRef = buildResult.SourceRef,
            Document = buildResult.Document,
            CustomerInformation = buildResult.CustomerInformation,
            FinancialDetails = buildResult.FinancialDetails,
            General = buildResult.General,
            Items = buildResult.Items,
            Additions = buildResult.Additions,
            Footer = buildResult.Footer,
            Status = ParseStatus(request.Status),
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.SalesInvoices.Add(salesInvoice);
        if (salesInvoice.Status == SalesInvoiceStatus.Submitted)
        {
            var stockError = await ApplySubmissionStockEffectsAsync(dbContext, salesInvoice, cancellationToken);
            if (stockError is not null)
            {
                return TypedResults.BadRequest(new ApiResponse<object>(false, stockError, null));
            }

            var journalError = await SalesInvoiceJournalPosting.PostAsync(
                dbContext,
                salesInvoice,
                cancellationToken);
            if (journalError is not null)
            {
                return TypedResults.BadRequest(new ApiResponse<object>(false, journalError, null));
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var created = await BuildQuery(dbContext).FirstAsync(current => current.Id == salesInvoice.Id, cancellationToken);
        return TypedResults.Created($"/api/transactions/sales-invoices/{salesInvoice.Id}", new ApiResponse<SalesInvoiceDto>(true, "Sales invoice created successfully.", SalesInvoiceDto.FromEntity(created)));
    }

    private static async Task<IResult> UpdateStatusAsync(Guid id, UpdateSalesInvoiceStatusRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var salesInvoice = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (salesInvoice is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Sales invoice not found.", null));
        }

        var nextStatus = ParseStatus(request.Status);
        if (salesInvoice.Status == nextStatus)
        {
            var unchanged = await BuildQuery(dbContext).FirstAsync(current => current.Id == id, cancellationToken);
            return TypedResults.Ok(new ApiResponse<SalesInvoiceDto>(true, "Sales invoice updated successfully.", SalesInvoiceDto.FromEntity(unchanged)));
        }

        var transitionError = ValidateStatusTransition(salesInvoice.Status, nextStatus);
        if (transitionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, transitionError, null));
        }

        if (nextStatus == SalesInvoiceStatus.Submitted)
        {
            var stockError = await ApplySubmissionStockEffectsAsync(dbContext, salesInvoice, cancellationToken);
            if (stockError is not null)
            {
                return TypedResults.BadRequest(new ApiResponse<object>(false, stockError, null));
            }

            var journalError = await SalesInvoiceJournalPosting.PostAsync(
                dbContext,
                salesInvoice,
                cancellationToken);
            if (journalError is not null)
            {
                return TypedResults.BadRequest(new ApiResponse<object>(false, journalError, null));
            }
        }
        else if (salesInvoice.Status == SalesInvoiceStatus.Submitted && nextStatus == SalesInvoiceStatus.Cancelled)
        {
            await InventoryPostingService.RevertSourceAsync(dbContext, StockSourceTypes.SalesInvoice, salesInvoice.Id, cancellationToken);

            var journalError = await SalesInvoiceJournalPosting.ReverseAsync(
                dbContext,
                salesInvoice.Id,
                DateOnly.FromDateTime(DateTime.UtcNow),
                cancellationToken);
            if (journalError is not null)
            {
                return TypedResults.BadRequest(new ApiResponse<object>(false, journalError, null));
            }
        }

        salesInvoice.Status = nextStatus;
        salesInvoice.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        var updated = await BuildQuery(dbContext).FirstAsync(current => current.Id == id, cancellationToken);
        return TypedResults.Ok(new ApiResponse<SalesInvoiceDto>(true, "Sales invoice updated successfully.", SalesInvoiceDto.FromEntity(updated)));
    }

    private static SalesInvoiceBuildResult BuildSalesInvoiceRequest(
        SalesInvoiceSourceReferenceRequest sourceRefRequest,
        SalesInvoiceDocumentRequest documentRequest,
        SalesInvoiceCustomerInformationRequest customerInformationRequest,
        SalesInvoiceFinancialDetailsRequest financialDetailsRequest,
        SalesInvoiceGeneralRequest generalRequest,
        IReadOnlyList<SalesInvoiceLineItemRequest> itemsRequest,
        IReadOnlyList<SalesInvoiceAdditionRequest> additionsRequest,
        SalesInvoiceFooterRequest footerRequest)
    {
        var sourceRef = new SalesInvoiceSourceReference
        {
            Type = ParseReferenceType(sourceRefRequest.Type),
            ReferenceId = sourceRefRequest.ReferenceId,
            ReferenceNo = sourceRefRequest.ReferenceNo?.Trim() ?? string.Empty
        };

        var document = new SalesInvoiceDocument
        {
            VoucherType = string.IsNullOrWhiteSpace(documentRequest.VoucherType) ? "SI" : documentRequest.VoucherType.Trim().ToUpperInvariant(),
            No = documentRequest.No?.Trim().ToUpperInvariant() ?? string.Empty,
            Date = documentRequest.Date,
            DueDate = documentRequest.DueDate
        };

        var customerInformation = new SalesInvoiceCustomerInformation
        {
            CustomerId = customerInformationRequest.CustomerId,
            CustomerNameSnapshot = customerInformationRequest.CustomerNameSnapshot?.Trim() ?? string.Empty,
            Address = customerInformationRequest.Address?.Trim() ?? string.Empty
        };

        var financialDetails = new SalesInvoiceFinancialDetails
        {
            PaymentMode = ParsePaymentMode(financialDetailsRequest.PaymentMode),
            InvoiceNo = NormalizeOptional(financialDetailsRequest.InvoiceNo),
            LrNo = NormalizeOptional(financialDetailsRequest.LrNo),
            CurrencyId = financialDetailsRequest.CurrencyId,
            CurrencyCodeSnapshot = NormalizeOptional(financialDetailsRequest.CurrencyCodeSnapshot),
            CurrencySymbolSnapshot = NormalizeOptional(financialDetailsRequest.CurrencySymbolSnapshot),
            Balance = financialDetailsRequest.Balance
        };

        var general = new SalesInvoiceGeneral
        {
            Notes = NormalizeOptional(generalRequest.Notes),
            Taxable = generalRequest.Taxable,
            TaxApplication = ParseTaxApplication(generalRequest.TaxApplication),
            InterState = generalRequest.InterState
        };

        if (string.IsNullOrWhiteSpace(document.No))
        {
            return SalesInvoiceBuildResult.Invalid("Sales invoice number is required.");
        }

        if (customerInformation.CustomerId == Guid.Empty)
        {
            return SalesInvoiceBuildResult.Invalid("Customer is required.");
        }

        if (sourceRef.Type != SalesInvoiceReferenceType.Direct && string.IsNullOrWhiteSpace(sourceRef.ReferenceNo))
        {
            return SalesInvoiceBuildResult.Invalid("Reference number is required for the selected source type.");
        }

        if (footerRequest.Paid < 0)
        {
            return SalesInvoiceBuildResult.Invalid("Paid amount cannot be negative.");
        }

        if (itemsRequest is null || itemsRequest.Count == 0)
        {
            return SalesInvoiceBuildResult.Invalid("At least one line item is required.");
        }

        var items = new List<SalesInvoiceLineItem>(itemsRequest.Count);
        foreach (var itemRequest in itemsRequest)
        {
            if (itemRequest.ProductId == Guid.Empty)
            {
                return SalesInvoiceBuildResult.Invalid("Each line item must have a product.");
            }

            if (itemRequest.UnitId == Guid.Empty)
            {
                return SalesInvoiceBuildResult.Invalid("Each line item must have a unit.");
            }

            if (itemRequest.Quantity <= 0)
            {
                return SalesInvoiceBuildResult.Invalid("Line item quantity must be greater than zero.");
            }

            if (itemRequest.Rate < 0 || itemRequest.DiscountPercent < 0 || itemRequest.TaxPercent < 0)
            {
                return SalesInvoiceBuildResult.Invalid("Line item values cannot be negative.");
            }

            var grossAmount = Math.Round(itemRequest.Quantity * itemRequest.Rate, 2, MidpointRounding.AwayFromZero);
            var discountAmount = Math.Round((grossAmount * itemRequest.DiscountPercent) / 100m, 2, MidpointRounding.AwayFromZero);
            var taxableAmount = general.TaxApplication == SalesInvoiceTaxApplication.BeforeDiscount
                ? grossAmount
                : Math.Max(0, Math.Round(grossAmount - discountAmount, 2, MidpointRounding.AwayFromZero));
            var taxAmount = general.Taxable
                ? Math.Round((taxableAmount * itemRequest.TaxPercent) / 100m, 2, MidpointRounding.AwayFromZero)
                : 0;
            var lineTotal = Math.Round(taxableAmount + taxAmount, 2, MidpointRounding.AwayFromZero);

            items.Add(new SalesInvoiceLineItem
            {
                Sno = itemRequest.Sno <= 0 ? items.Count + 1 : itemRequest.Sno,
                ProductId = itemRequest.ProductId,
                ProductCodeSnapshot = NormalizeOptional(itemRequest.ProductCodeSnapshot),
                ProductNameSnapshot = itemRequest.ProductNameSnapshot?.Trim() ?? string.Empty,
                HsnCode = NormalizeOptional(itemRequest.HsnCode),
                Quantity = itemRequest.Quantity,
                UnitId = itemRequest.UnitId,
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

        var additions = new List<SalesInvoiceAddition>();
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
                return SalesInvoiceBuildResult.Invalid("Addition amount cannot be negative.");
            }

            additions.Add(new SalesInvoiceAddition
            {
                Type = ParseAdditionType(additionRequest.Type),
                LedgerId = additionRequest.LedgerId,
                LedgerNameSnapshot = ledgerSnapshot ?? string.Empty,
                Description = description,
                Amount = additionRequest.Amount
            });
        }

        var footer = new SalesInvoiceFooter
        {
            Notes = NormalizeOptional(footerRequest.Notes),
            Total = Math.Round(items.Sum(item => item.LineTotal), 2, MidpointRounding.AwayFromZero),
            Addition = Math.Round(additions.Where(item => item.Type == SalesInvoiceAdditionType.Addition).Sum(item => item.Amount), 2, MidpointRounding.AwayFromZero),
            Deduction = Math.Round(additions.Where(item => item.Type == SalesInvoiceAdditionType.Deduction).Sum(item => item.Amount), 2, MidpointRounding.AwayFromZero),
            Paid = footerRequest.Paid
        };
        footer.NetTotal = Math.Round(footer.Total + footer.Addition - footer.Deduction, 2, MidpointRounding.AwayFromZero);
        financialDetails.Balance = Math.Round(footer.NetTotal - footer.Paid, 2, MidpointRounding.AwayFromZero);

        return SalesInvoiceBuildResult.Valid(sourceRef, document, customerInformation, financialDetails, general, footer, items, additions);
    }

    private static async Task<string?> ResolveReferencesAsync(AppDbContext dbContext, SalesInvoiceBuildResult buildResult, CancellationToken cancellationToken)
    {
        if (buildResult.SourceRef.Type == SalesInvoiceReferenceType.SalesOrder && buildResult.SourceRef.ReferenceId is not null)
        {
            var salesOrder = await dbContext.SalesOrders.FirstOrDefaultAsync(current => current.Id == buildResult.SourceRef.ReferenceId.Value, cancellationToken);
            if (salesOrder is null)
            {
                return "Selected sales order reference does not exist.";
            }

            if (string.IsNullOrWhiteSpace(buildResult.SourceRef.ReferenceNo))
            {
                buildResult.SourceRef.ReferenceNo = salesOrder.OrderDetails.No;
            }
        }

        var customer = await dbContext.Customers.FirstOrDefaultAsync(current => current.Id == buildResult.CustomerInformation.CustomerId, cancellationToken);
        if (customer is null)
        {
            return "Selected customer does not exist.";
        }

        buildResult.CustomerInformation.Customer = customer;
        if (string.IsNullOrWhiteSpace(buildResult.CustomerInformation.CustomerNameSnapshot))
        {
            buildResult.CustomerInformation.CustomerNameSnapshot = customer.BasicDetails.Name;
        }

        if (string.IsNullOrWhiteSpace(buildResult.CustomerInformation.Address))
        {
            buildResult.CustomerInformation.Address = FormatCustomerAddress(customer);
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

            var unitCost = product.PricingAndRates.Cost ?? product.PricingAndRates.PurchaseRate ?? 0;
            var netSalesAmount = Math.Round(item.GrossAmount - item.DiscountAmount, 2, MidpointRounding.AwayFromZero);

            item.CostRate = Math.Round(unitCost, 2, MidpointRounding.AwayFromZero);
            item.CogsAmount = Math.Round(item.CostRate * item.Quantity, 2, MidpointRounding.AwayFromZero);
            item.GrossProfitAmount = Math.Round(netSalesAmount - item.CogsAmount, 2, MidpointRounding.AwayFromZero);

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

    private static SalesInvoiceReferenceType ParseReferenceType(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return SalesInvoiceReferenceType.Direct;
        }

        return value.Trim() switch
        {
            "SalesOrder" => SalesInvoiceReferenceType.SalesOrder,
            "DeliveryNote" => SalesInvoiceReferenceType.DeliveryNote,
            _ => SalesInvoiceReferenceType.Direct
        };
    }

    private static SalesInvoicePaymentMode ParsePaymentMode(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return SalesInvoicePaymentMode.Cash;
        }

        return value.Trim() switch
        {
            "Credit" => SalesInvoicePaymentMode.Credit,
            _ => SalesInvoicePaymentMode.Cash
        };
    }

    private static SalesInvoiceTaxApplication ParseTaxApplication(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return SalesInvoiceTaxApplication.AfterDiscount;
        }

        return value.Trim() switch
        {
            "Before Discount" => SalesInvoiceTaxApplication.BeforeDiscount,
            _ => SalesInvoiceTaxApplication.AfterDiscount
        };
    }

    private static SalesInvoiceAdditionType ParseAdditionType(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return SalesInvoiceAdditionType.Addition;
        }

        return value.Trim() switch
        {
            "Deduction" => SalesInvoiceAdditionType.Deduction,
            _ => SalesInvoiceAdditionType.Addition
        };
    }

    private static SalesInvoiceStatus ParseStatus(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return SalesInvoiceStatus.Draft;
        }

        return value.Trim() switch
        {
            "Created" => SalesInvoiceStatus.Submitted,
            "Submitted" => SalesInvoiceStatus.Submitted,
            "Cancelled" => SalesInvoiceStatus.Cancelled,
            _ => SalesInvoiceStatus.Draft
        };
    }

    private static async Task<string?> ApplySubmissionStockEffectsAsync(
        AppDbContext dbContext,
        SalesInvoice salesInvoice,
        CancellationToken cancellationToken)
    {
        var inventorySettings = await InventorySettingsResolver.GetEffectiveSettingsAsync(dbContext, cancellationToken);
        var issueLines = salesInvoice.Items
            .OrderBy(item => item.Sno)
            .ThenBy(item => item.Id)
            .Select(item => new InventoryIssuePostingLine(
                item.Id,
                item.ProductId,
                item.WarehouseId ?? Guid.Empty,
                item.Quantity,
                item.ProductNameSnapshot))
            .ToList();

        var issueResult = await InventoryPostingService.ApplyIssuesAsync(
            dbContext,
            inventorySettings,
            StockSourceTypes.SalesInvoice,
            salesInvoice.Id,
            salesInvoice.Document.Date,
            issueLines,
            cancellationToken);
        if (issueResult.Error is not null)
        {
            return issueResult.Error;
        }

        foreach (var item in salesInvoice.Items)
        {
            if (!issueResult.Costings.TryGetValue(item.Id, out var costing))
            {
                continue;
            }

            item.CostRate = costing.CostRate;
            item.CogsAmount = costing.TotalCost;
            item.GrossProfitAmount = Math.Round(
                Math.Round(item.GrossAmount - item.DiscountAmount, 2, MidpointRounding.AwayFromZero) - costing.TotalCost,
                2,
                MidpointRounding.AwayFromZero);
        }

        return null;
    }

    private static string? ValidateStatusTransition(SalesInvoiceStatus currentStatus, SalesInvoiceStatus nextStatus)
    {
        if (currentStatus == SalesInvoiceStatus.Cancelled)
        {
            return "Cancelled sales invoices cannot be changed.";
        }

        return (currentStatus, nextStatus) switch
        {
            (SalesInvoiceStatus.Draft, SalesInvoiceStatus.Submitted) => null,
            (SalesInvoiceStatus.Draft, SalesInvoiceStatus.Cancelled) => null,
            (SalesInvoiceStatus.Submitted, SalesInvoiceStatus.Cancelled) => null,
            _ => "Only draft sales invoices can be submitted, and only submitted sales invoices can be cancelled."
        };
    }

    private static string ToStatusLabel(SalesInvoiceStatus value) => value switch
    {
        SalesInvoiceStatus.Submitted => "Submitted",
        SalesInvoiceStatus.Cancelled => "Cancelled",
        _ => "Draft"
    };

    private static string FormatCustomerAddress(Customer customer)
    {
        var parts = new[]
        {
            customer.BillingAddress.Street,
            customer.BillingAddress.City,
            customer.BillingAddress.State,
            customer.BillingAddress.Pincode,
            customer.BillingAddress.Country
        }
        .Where(part => !string.IsNullOrWhiteSpace(part))
        .Select(part => part!.Trim());

        return string.Join(", ", parts);
    }

    private static string? NormalizeOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed record SalesInvoiceBuildResult(
        string? Error,
        SalesInvoiceSourceReference? SourceRef = null,
        SalesInvoiceDocument? Document = null,
        SalesInvoiceCustomerInformation? CustomerInformation = null,
        SalesInvoiceFinancialDetails? FinancialDetails = null,
        SalesInvoiceGeneral? General = null,
        SalesInvoiceFooter? Footer = null,
        List<SalesInvoiceLineItem>? Items = null,
        List<SalesInvoiceAddition>? Additions = null)
    {
        public SalesInvoiceSourceReference SourceRef { get; init; } = SourceRef ?? new SalesInvoiceSourceReference();
        public SalesInvoiceDocument Document { get; init; } = Document ?? new SalesInvoiceDocument();
        public SalesInvoiceCustomerInformation CustomerInformation { get; init; } = CustomerInformation ?? new SalesInvoiceCustomerInformation();
        public SalesInvoiceFinancialDetails FinancialDetails { get; init; } = FinancialDetails ?? new SalesInvoiceFinancialDetails();
        public SalesInvoiceGeneral General { get; init; } = General ?? new SalesInvoiceGeneral();
        public SalesInvoiceFooter Footer { get; init; } = Footer ?? new SalesInvoiceFooter();
        public List<SalesInvoiceLineItem> Items { get; init; } = Items ?? [];
        public List<SalesInvoiceAddition> Additions { get; init; } = Additions ?? [];

        public static SalesInvoiceBuildResult Valid(
            SalesInvoiceSourceReference sourceRef,
            SalesInvoiceDocument document,
            SalesInvoiceCustomerInformation customerInformation,
            SalesInvoiceFinancialDetails financialDetails,
            SalesInvoiceGeneral general,
            SalesInvoiceFooter footer,
            List<SalesInvoiceLineItem> items,
            List<SalesInvoiceAddition> additions) =>
            new(null, sourceRef, document, customerInformation, financialDetails, general, footer, items, additions);

        public static SalesInvoiceBuildResult Invalid(string error) =>
            new(error);
    }
}
