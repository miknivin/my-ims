using backend.Features.Masters.Currencies;
using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Products;
using backend.Features.Masters.Uoms;
using backend.Features.Masters.Vendors;
using backend.Features.Masters.Warehouses;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Transactions.PurchaseOrders;

public static class PurchaseOrderEndpoints
{
    public static IEndpointRouteBuilder MapPurchaseOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/purchase-orders").WithTags("Purchase Orders");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPatch("/{id:guid}", UpdateStatusAsync);

        return app;
    }

    private static IQueryable<PurchaseOrder> BuildQuery(AppDbContext dbContext)
    {
        return dbContext.PurchaseOrders
            .Include(current => current.VendorInformation.Vendor)
            .Include(current => current.FinancialDetails.Currency)
            .Include(current => current.DeliveryInformation.Warehouse)
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
        var query = dbContext.PurchaseOrders.AsNoTracking();
        var normalizedKeyword = keyword?.Trim();
        if (!string.IsNullOrWhiteSpace(normalizedKeyword))
        {
            var pattern = $"%{normalizedKeyword}%";
            query = query.Where(current =>
                EF.Functions.ILike(current.OrderDetails.No, pattern) ||
                EF.Functions.ILike(current.VendorInformation.VendorNameSnapshot, pattern));
        }

        var normalizedLimit = limit is > 0 ? Math.Min(limit.Value, 100) : 0;
        var sortedQuery = query
            .OrderByDescending(current => current.UpdatedAtUtc)
            .Select(current => new PurchaseOrderListItemDto(
                current.Id,
                current.OrderDetails.No,
                current.OrderDetails.Date,
                current.VendorInformation.VendorNameSnapshot,
                current.Footer.NetTotal,
                current.Status,
                current.CreatedAtUtc,
                current.UpdatedAtUtc));

        var purchaseOrders = normalizedLimit > 0
            ? await sortedQuery.Take(normalizedLimit).ToListAsync(cancellationToken)
            : await sortedQuery.ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<PurchaseOrderListItemDto>>(true, "Purchase order list fetched successfully.", purchaseOrders));
    }

    private static async Task<IResult> GetByIdAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var purchaseOrder = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return purchaseOrder is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Purchase order not found.", null))
            : TypedResults.Ok(new ApiResponse<PurchaseOrderDto>(true, "Purchase order fetched successfully.", PurchaseOrderDto.FromEntity(purchaseOrder)));
    }

    private static async Task<IResult> CreateAsync(CreatePurchaseOrderRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildPurchaseOrderRequest(request.OrderDetails, request.VendorInformation, request.FinancialDetails, request.DeliveryInformation, request.ProductInformation, request.Items, request.Additions, request.Footer);
        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.PurchaseOrders.AnyAsync(current => current.OrderDetails.No == buildResult.OrderDetails.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Purchase order number already exists.", null));
        }

        var resolutionError = await ResolveReferencesAsync(dbContext, buildResult, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        var now = DateTime.UtcNow;
        var purchaseOrder = new PurchaseOrder
        {
            OrderDetails = buildResult.OrderDetails,
            VendorInformation = buildResult.VendorInformation,
            FinancialDetails = buildResult.FinancialDetails,
            DeliveryInformation = buildResult.DeliveryInformation,
            ProductInformation = buildResult.ProductInformation,
            Additions = buildResult.Additions,
            Footer = buildResult.Footer,
            Status = PurchaseOrderStatuses.Draft,
            Items = buildResult.Items,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.PurchaseOrders.Add(purchaseOrder);
        await dbContext.SaveChangesAsync(cancellationToken);

        var created = await BuildQuery(dbContext).FirstAsync(current => current.Id == purchaseOrder.Id, cancellationToken);
        return TypedResults.Created($"/api/transactions/purchase-orders/{purchaseOrder.Id}", new ApiResponse<PurchaseOrderDto>(true, "Purchase order created successfully.", PurchaseOrderDto.FromEntity(created)));
    }

    private static async Task<IResult> UpdateStatusAsync(
        Guid id,
        UpdatePurchaseOrderStatusRequest request,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var purchaseOrder = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (purchaseOrder is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Purchase order not found.", null));
        }

        var nextStatus = string.IsNullOrWhiteSpace(request.Status)
            ? purchaseOrder.Status
            : NormalizeStatus(request.Status);
        if (purchaseOrder.Status == nextStatus)
        {
            var unchanged = await BuildQuery(dbContext).FirstAsync(current => current.Id == id, cancellationToken);
            return TypedResults.Ok(new ApiResponse<PurchaseOrderDto>(
                true,
                "Purchase order updated successfully.",
                PurchaseOrderDto.FromEntity(unchanged)));
        }

        var transitionError = ValidateStatusTransition(purchaseOrder.Status, nextStatus);
        if (transitionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, transitionError, null));
        }

        purchaseOrder.Status = nextStatus;
        purchaseOrder.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        var updated = await BuildQuery(dbContext).FirstAsync(current => current.Id == id, cancellationToken);
        return TypedResults.Ok(new ApiResponse<PurchaseOrderDto>(true, "Purchase order updated successfully.", PurchaseOrderDto.FromEntity(updated)));
    }

    private static PurchaseOrderBuildResult BuildPurchaseOrderRequest(
        PurchaseOrderOrderDetailsRequest orderDetailsRequest,
        PurchaseOrderVendorInformationRequest vendorInformationRequest,
        PurchaseOrderFinancialDetailsRequest financialDetailsRequest,
        PurchaseOrderDeliveryInformationRequest deliveryInformationRequest,
        PurchaseOrderProductInformationRequest productInformationRequest,
        IReadOnlyList<PurchaseOrderLineItemRequest> itemsRequest,
        IReadOnlyList<PurchaseOrderAdditionRequest> additionsRequest,
        PurchaseOrderFooterRequest footerRequest)
    {
        var orderDetails = new PurchaseOrderOrderDetails
        {
            VoucherType = string.IsNullOrWhiteSpace(orderDetailsRequest.VoucherType) ? "PO" : orderDetailsRequest.VoucherType.Trim().ToUpperInvariant(),
            No = orderDetailsRequest.No?.Trim().ToUpperInvariant() ?? string.Empty,
            Date = orderDetailsRequest.Date,
            DueDate = orderDetailsRequest.DueDate,
            DeliveryDate = orderDetailsRequest.DeliveryDate
        };

        var vendorInformation = new PurchaseOrderVendorInformation
        {
            VendorId = vendorInformationRequest.VendorId,
            VendorNameSnapshot = vendorInformationRequest.VendorLabel?.Trim() ?? string.Empty,
            Address = vendorInformationRequest.Address?.Trim() ?? string.Empty,
            Attention = NormalizeOptional(vendorInformationRequest.Attention),
            Phone = NormalizeOptional(vendorInformationRequest.Phone)
        };

        var financialDetails = new PurchaseOrderFinancialDetails
        {
            PaymentMode = string.IsNullOrWhiteSpace(financialDetailsRequest.PaymentMode) ? PurchaseOrderPaymentModes.Cash : financialDetailsRequest.PaymentMode.Trim(),
            CreditLimit = financialDetailsRequest.CreditLimit,
            CurrencyId = financialDetailsRequest.CurrencyId,
            CurrencyLabelSnapshot = NormalizeOptional(financialDetailsRequest.CurrencyLabel),
            Balance = financialDetailsRequest.Balance
        };

        var deliveryInformation = new PurchaseOrderDeliveryInformation
        {
            WarehouseId = deliveryInformationRequest.WarehouseId,
            WarehouseNameSnapshot = NormalizeOptional(deliveryInformationRequest.WarehouseName),
            Address = deliveryInformationRequest.Address?.Trim() ?? string.Empty,
            Attention = NormalizeOptional(deliveryInformationRequest.Attention),
            Phone = NormalizeOptional(deliveryInformationRequest.Phone)
        };

        var productInformation = new PurchaseOrderProductInformation
        {
            VendorProducts = string.IsNullOrWhiteSpace(productInformationRequest.VendorProducts) ? "Re-Order Level" : productInformationRequest.VendorProducts.Trim(),
            OwnProductsOnly = productInformationRequest.OwnProductsOnly,
            Reference = NormalizeOptional(productInformationRequest.Reference),
            MrNo = NormalizeOptional(productInformationRequest.MrNo)
        };

        if (string.IsNullOrWhiteSpace(orderDetails.No))
        {
            return PurchaseOrderBuildResult.Invalid("Purchase order number is required.");
        }

        if (vendorInformation.VendorId == Guid.Empty)
        {
            return PurchaseOrderBuildResult.Invalid("Vendor is required.");
        }

        if (string.IsNullOrWhiteSpace(vendorInformation.Address))
        {
            return PurchaseOrderBuildResult.Invalid("Vendor address is required.");
        }

        if (string.IsNullOrWhiteSpace(deliveryInformation.Address))
        {
            return PurchaseOrderBuildResult.Invalid("Delivery address is required.");
        }

        if (!PurchaseOrderPaymentModes.All.Contains(financialDetails.PaymentMode, StringComparer.OrdinalIgnoreCase))
        {
            return PurchaseOrderBuildResult.Invalid("Payment mode must be either Cash or Credit.");
        }

        if (financialDetails.CreditLimit < 0)
        {
            return PurchaseOrderBuildResult.Invalid("Credit limit cannot be negative.");
        }

        if (itemsRequest is null || itemsRequest.Count == 0)
        {
            return PurchaseOrderBuildResult.Invalid("At least one line item is required.");
        }

        var footer = new PurchaseOrderFooter
        {
            Notes = NormalizeOptional(footerRequest.Notes),
            Remarks = NormalizeOptional(footerRequest.Remarks),
            Taxable = footerRequest.Taxable,
            Advance = footerRequest.Advance
        };

        if (footer.Advance < 0)
        {
            return PurchaseOrderBuildResult.Invalid("Footer advance cannot be negative.");
        }

        var items = new List<PurchaseOrderLineItem>(itemsRequest.Count);
        foreach (var itemRequest in itemsRequest)
        {
            if (itemRequest.ItemId == Guid.Empty)
            {
                return PurchaseOrderBuildResult.Invalid("Each line item must have a product.");
            }

            if (itemRequest.UnitId == Guid.Empty)
            {
                return PurchaseOrderBuildResult.Invalid("Each line item must have a unit.");
            }

            if (itemRequest.Quantity <= 0)
            {
                return PurchaseOrderBuildResult.Invalid("Line item quantity must be greater than zero.");
            }

            if (itemRequest.Rate < 0 || itemRequest.DiscountValue < 0 || itemRequest.CgstRate < 0 || itemRequest.SgstRate < 0 || itemRequest.IgstRate < 0 || itemRequest.ReceivedQty < 0)
            {
                return PurchaseOrderBuildResult.Invalid("Line item values cannot be negative.");
            }

            if (!PurchaseOrderDiscountTypes.All.Contains(itemRequest.DiscountType, StringComparer.OrdinalIgnoreCase))
            {
                return PurchaseOrderBuildResult.Invalid("Discount type must be either percentage or fixed.");
            }

            var normalizedDiscountType = PurchaseOrderDiscountTypes.All.First(value => value.Equals(itemRequest.DiscountType, StringComparison.OrdinalIgnoreCase));
            var grossAmount = Math.Round(itemRequest.Quantity * itemRequest.Rate, 2, MidpointRounding.AwayFromZero);
            var discountAmount = normalizedDiscountType == PurchaseOrderDiscountTypes.Percentage
                ? Math.Round((grossAmount * itemRequest.DiscountValue) / 100m, 2, MidpointRounding.AwayFromZero)
                : Math.Round(itemRequest.DiscountValue, 2, MidpointRounding.AwayFromZero);
            var taxableAmount = Math.Max(0, Math.Round(grossAmount - discountAmount, 2, MidpointRounding.AwayFromZero));
            var cgstAmount = footer.Taxable ? Math.Round((taxableAmount * itemRequest.CgstRate) / 100m, 2, MidpointRounding.AwayFromZero) : 0;
            var sgstAmount = footer.Taxable ? Math.Round((taxableAmount * itemRequest.SgstRate) / 100m, 2, MidpointRounding.AwayFromZero) : 0;
            var igstAmount = footer.Taxable ? Math.Round((taxableAmount * itemRequest.IgstRate) / 100m, 2, MidpointRounding.AwayFromZero) : 0;
            var lineTotal = Math.Round(taxableAmount + cgstAmount + sgstAmount + igstAmount, 2, MidpointRounding.AwayFromZero);

            items.Add(new PurchaseOrderLineItem
            {
                ProductId = itemRequest.ItemId,
                ProductNameSnapshot = itemRequest.ItemNameSnapshot?.Trim() ?? string.Empty,
                HsnCode = NormalizeOptional(itemRequest.HsnCode),
                Quantity = itemRequest.Quantity,
                UnitId = itemRequest.UnitId,
                Rate = itemRequest.Rate,
                GrossAmount = grossAmount,
                DiscountType = normalizedDiscountType,
                DiscountValue = itemRequest.DiscountValue,
                DiscountAmount = discountAmount,
                TaxableAmount = taxableAmount,
                CgstRate = footer.Taxable ? itemRequest.CgstRate : 0,
                CgstAmount = cgstAmount,
                SgstRate = footer.Taxable ? itemRequest.SgstRate : 0,
                SgstAmount = sgstAmount,
                IgstRate = footer.Taxable ? itemRequest.IgstRate : 0,
                IgstAmount = igstAmount,
                LineTotal = lineTotal,
                WarehouseId = itemRequest.WarehouseId,
                ReceivedQty = itemRequest.ReceivedQty
            });
        }

        var additions = new List<PurchaseOrderAddition>();
        foreach (var additionRequest in additionsRequest ?? [])
        {
            var normalizedType = string.IsNullOrWhiteSpace(additionRequest.Type)
                ? PurchaseOrderAdditionTypes.Addition
                : additionRequest.Type.Trim();
            var description = NormalizeOptional(additionRequest.Description);
            var ledgerName = NormalizeOptional(additionRequest.LedgerName);
            var hasMeaningfulData = additionRequest.LedgerId is not null || description is not null || additionRequest.Amount != 0;

            if (!hasMeaningfulData)
            {
                continue;
            }

            if (!PurchaseOrderAdditionTypes.All.Contains(normalizedType, StringComparer.OrdinalIgnoreCase))
            {
                return PurchaseOrderBuildResult.Invalid("Addition type must be either Addition or Deduction.");
            }

            if (additionRequest.Amount < 0)
            {
                return PurchaseOrderBuildResult.Invalid("Addition amount cannot be negative.");
            }

            normalizedType = PurchaseOrderAdditionTypes.All.First(value => value.Equals(normalizedType, StringComparison.OrdinalIgnoreCase));

            additions.Add(new PurchaseOrderAddition
            {
                Type = normalizedType,
                LedgerId = additionRequest.LedgerId,
                LedgerNameSnapshot = ledgerName ?? string.Empty,
                Description = description,
                Amount = additionRequest.Amount
            });
        }

        footer.Addition = Math.Round(additions.Sum(item =>
            item.Type == PurchaseOrderAdditionTypes.Deduction ? -item.Amount : item.Amount), 2, MidpointRounding.AwayFromZero);
        footer.Total = Math.Round(items.Sum(item => item.LineTotal), 2, MidpointRounding.AwayFromZero);
        footer.Discount = Math.Round(items.Sum(item => item.DiscountAmount), 2, MidpointRounding.AwayFromZero);
        footer.Tax = Math.Round(items.Sum(item => item.CgstAmount + item.SgstAmount + item.IgstAmount), 2, MidpointRounding.AwayFromZero);
        footer.NetTotal = Math.Round(footer.Total + footer.Addition - footer.Advance, 2, MidpointRounding.AwayFromZero);
        financialDetails.Balance = Math.Round(financialDetails.CreditLimit - footer.NetTotal, 2, MidpointRounding.AwayFromZero);

        return PurchaseOrderBuildResult.Valid(orderDetails, vendorInformation, financialDetails, deliveryInformation, productInformation, footer, items, additions);
    }

    private static async Task<string?> ResolveReferencesAsync(AppDbContext dbContext, PurchaseOrderBuildResult buildResult, CancellationToken cancellationToken)
    {
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
            if (string.IsNullOrWhiteSpace(buildResult.FinancialDetails.CurrencyLabelSnapshot))
            {
                buildResult.FinancialDetails.CurrencyLabelSnapshot = string.IsNullOrWhiteSpace(currency.Symbol)
                    ? currency.Code
                    : $"{currency.Code} ({currency.Symbol})";
            }
        }

        if (buildResult.DeliveryInformation.WarehouseId is not null)
        {
            var warehouse = await dbContext.Warehouses.FirstOrDefaultAsync(current => current.Id == buildResult.DeliveryInformation.WarehouseId.Value, cancellationToken);
            if (warehouse is null)
            {
                return "Selected delivery warehouse does not exist.";
            }

            buildResult.DeliveryInformation.Warehouse = warehouse;
            if (string.IsNullOrWhiteSpace(buildResult.DeliveryInformation.WarehouseNameSnapshot))
            {
                buildResult.DeliveryInformation.WarehouseNameSnapshot = warehouse.Name;
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

    private static string NormalizeStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return PurchaseOrderStatuses.Draft;
        }

        var requested = status.Trim();
        return PurchaseOrderStatuses.All.FirstOrDefault(value => value.Equals(requested, StringComparison.OrdinalIgnoreCase))
            ?? PurchaseOrderStatuses.Draft;
    }

    private static string? ValidateStatusTransition(string currentStatus, string nextStatus)
    {
        if (string.Equals(currentStatus, PurchaseOrderStatuses.Cancelled, StringComparison.Ordinal))
        {
            return "Cancelled purchase orders cannot be changed.";
        }

        return (currentStatus, nextStatus) switch
        {
            (PurchaseOrderStatuses.Draft, PurchaseOrderStatuses.Submitted) => null,
            (PurchaseOrderStatuses.Draft, PurchaseOrderStatuses.Cancelled) => null,
            (PurchaseOrderStatuses.Submitted, PurchaseOrderStatuses.Cancelled) => null,
            _ => "Only draft purchase orders can be submitted, and only draft or submitted purchase orders can be cancelled."
        };
    }

    private static string? NormalizeOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed record PurchaseOrderBuildResult(
        string? Error,
        PurchaseOrderOrderDetails? OrderDetails = null,
        PurchaseOrderVendorInformation? VendorInformation = null,
        PurchaseOrderFinancialDetails? FinancialDetails = null,
        PurchaseOrderDeliveryInformation? DeliveryInformation = null,
        PurchaseOrderProductInformation? ProductInformation = null,
        PurchaseOrderFooter? Footer = null,
        List<PurchaseOrderLineItem>? Items = null,
        List<PurchaseOrderAddition>? Additions = null)
    {
        public PurchaseOrderOrderDetails OrderDetails { get; init; } = OrderDetails ?? new PurchaseOrderOrderDetails();
        public PurchaseOrderVendorInformation VendorInformation { get; init; } = VendorInformation ?? new PurchaseOrderVendorInformation();
        public PurchaseOrderFinancialDetails FinancialDetails { get; init; } = FinancialDetails ?? new PurchaseOrderFinancialDetails();
        public PurchaseOrderDeliveryInformation DeliveryInformation { get; init; } = DeliveryInformation ?? new PurchaseOrderDeliveryInformation();
        public PurchaseOrderProductInformation ProductInformation { get; init; } = ProductInformation ?? new PurchaseOrderProductInformation();
        public PurchaseOrderFooter Footer { get; init; } = Footer ?? new PurchaseOrderFooter();
        public List<PurchaseOrderLineItem> Items { get; init; } = Items ?? [];
        public List<PurchaseOrderAddition> Additions { get; init; } = Additions ?? [];

        public static PurchaseOrderBuildResult Valid(
            PurchaseOrderOrderDetails orderDetails,
            PurchaseOrderVendorInformation vendorInformation,
            PurchaseOrderFinancialDetails financialDetails,
            PurchaseOrderDeliveryInformation deliveryInformation,
            PurchaseOrderProductInformation productInformation,
            PurchaseOrderFooter footer,
            List<PurchaseOrderLineItem> items,
            List<PurchaseOrderAddition> additions) =>
            new(null, orderDetails, vendorInformation, financialDetails, deliveryInformation, productInformation, footer, items, additions);

        public static PurchaseOrderBuildResult Invalid(string error) =>
            new(error);
    }
}
