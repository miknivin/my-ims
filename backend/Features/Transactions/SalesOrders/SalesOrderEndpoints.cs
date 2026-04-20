using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using backend.Features.Auth;
using backend.Features.Masters.Customers;
using backend.Features.Masters.Currencies;
using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Products;
using backend.Features.Masters.Uoms;
using backend.Features.Masters.Warehouses;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Transactions.SalesOrders;

public static class SalesOrderEndpoints
{
    public static IEndpointRouteBuilder MapSalesOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/transactions/sales-orders")
            .WithTags("Sales Orders")
            .RequireAuthorization();

        group.MapGet("/", GetAllAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPut("/{id:guid}", UpdateAsync);
        group.MapDelete("/{id:guid}", DeleteAsync);

        return app;
    }

    private static IQueryable<SalesOrder> BuildQuery(AppDbContext dbContext)
    {
        return dbContext.SalesOrders
            .Include(current => current.PartyInformation.Customer)
            .Include(current => current.CommercialDetails.Currency)
            .Include(current => current.SalesDetails.SalesMan)
            .Include(current => current.Items)
                .ThenInclude(item => item.Unit)
            .Include(current => current.Items)
                .ThenInclude(item => item.Warehouse)
            .Include(current => current.Additions)
                .ThenInclude(item => item.Ledger);
    }

    private static async Task<IResult> GetAllAsync(AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var salesOrders = await dbContext.SalesOrders
            .AsNoTracking()
            .OrderByDescending(current => current.UpdatedAtUtc)
            .Select(current => new SalesOrderListItemDto(
                current.Id,
                current.OrderDetails.No,
                current.OrderDetails.Date,
                current.PartyInformation.CustomerNameSnapshot,
                current.Footer.NetTotal,
                current.Status,
                current.CreatedAtUtc,
                current.UpdatedAtUtc))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<IReadOnlyList<SalesOrderListItemDto>>(true, "Sales order list fetched successfully.", salesOrders));
    }

    private static async Task<IResult> GetByIdAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var salesOrder = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return salesOrder is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Sales order not found.", null))
            : TypedResults.Ok(new ApiResponse<SalesOrderDto>(true, "Sales order fetched successfully.", SalesOrderDto.FromEntity(salesOrder)));
    }

    private static async Task<IResult> CreateAsync(CreateSalesOrderRequest request, ClaimsPrincipal principal, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedUserId(principal, out var userId))
        {
            return TypedResults.Unauthorized();
        }

        var buildResult = BuildSalesOrderRequest(
            request.OrderDetails,
            request.PartyInformation,
            request.CommercialDetails,
            request.SalesDetails,
            request.Items,
            request.Additions,
            request.Footer);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.SalesOrders.AnyAsync(current => current.OrderDetails.No == buildResult.OrderDetails.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Sales order number already exists.", null));
        }

        var resolutionError = await ResolveReferencesAsync(dbContext, buildResult, userId, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        var now = DateTime.UtcNow;
        var salesOrder = new SalesOrder
        {
            OrderDetails = buildResult.OrderDetails,
            PartyInformation = buildResult.PartyInformation,
            CommercialDetails = buildResult.CommercialDetails,
            SalesDetails = buildResult.SalesDetails,
            Items = buildResult.Items,
            Additions = buildResult.Additions,
            Footer = buildResult.Footer,
            Status = SalesOrderStatuses.Draft,
            CreatedById = userId,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.SalesOrders.Add(salesOrder);
        await dbContext.SaveChangesAsync(cancellationToken);

        var created = await BuildQuery(dbContext).FirstAsync(current => current.Id == salesOrder.Id, cancellationToken);
        return TypedResults.Created($"/api/transactions/sales-orders/{salesOrder.Id}", new ApiResponse<SalesOrderDto>(true, "Sales order created successfully.", SalesOrderDto.FromEntity(created)));
    }

    private static async Task<IResult> UpdateAsync(Guid id, UpdateSalesOrderRequest request, ClaimsPrincipal principal, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedUserId(principal, out var userId))
        {
            return TypedResults.Unauthorized();
        }

        var buildResult = BuildSalesOrderRequest(
            request.OrderDetails,
            request.PartyInformation,
            request.CommercialDetails,
            request.SalesDetails,
            request.Items,
            request.Additions,
            request.Footer);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        var salesOrder = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (salesOrder is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Sales order not found.", null));
        }

        if (await dbContext.SalesOrders.AnyAsync(current => current.Id != id && current.OrderDetails.No == buildResult.OrderDetails.No, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Sales order number already exists.", null));
        }

        var resolutionError = await ResolveReferencesAsync(dbContext, buildResult, userId, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        salesOrder.OrderDetails = buildResult.OrderDetails;
        salesOrder.PartyInformation = buildResult.PartyInformation;
        salesOrder.CommercialDetails = buildResult.CommercialDetails;
        salesOrder.SalesDetails = buildResult.SalesDetails;
        salesOrder.Footer = buildResult.Footer;
        salesOrder.Status = NormalizeStatus(request.Status);
        salesOrder.UpdatedById = userId;
        salesOrder.UpdatedAtUtc = DateTime.UtcNow;

        dbContext.RemoveRange(salesOrder.Items);
        salesOrder.Items = buildResult.Items;

        dbContext.RemoveRange(salesOrder.Additions);
        salesOrder.Additions = buildResult.Additions;

        await dbContext.SaveChangesAsync(cancellationToken);

        var updated = await BuildQuery(dbContext).FirstAsync(current => current.Id == id, cancellationToken);
        return TypedResults.Ok(new ApiResponse<SalesOrderDto>(true, "Sales order updated successfully.", SalesOrderDto.FromEntity(updated)));
    }

    private static async Task<IResult> DeleteAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var salesOrder = await dbContext.SalesOrders
            .Include(current => current.Items)
            .Include(current => current.Additions)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        if (salesOrder is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Sales order not found.", null));
        }

        dbContext.SalesOrders.Remove(salesOrder);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Sales order deleted successfully.", null));
    }

    private static SalesOrderBuildResult BuildSalesOrderRequest(
        SalesOrderOrderDetailsRequest orderDetailsRequest,
        SalesOrderPartyInformationRequest partyInformationRequest,
        SalesOrderCommercialDetailsRequest commercialDetailsRequest,
        SalesOrderSalesDetailsRequest salesDetailsRequest,
        IReadOnlyList<SalesOrderLineItemRequest> itemsRequest,
        IReadOnlyList<SalesOrderAdditionRequest> additionsRequest,
        SalesOrderFooterRequest footerRequest)
    {
        var orderDetails = new SalesOrderOrderDetails
        {
            VoucherType = string.IsNullOrWhiteSpace(orderDetailsRequest.VoucherType)
                ? SalesOrderVoucherTypes.Sales
                : orderDetailsRequest.VoucherType.Trim().ToUpperInvariant(),
            No = orderDetailsRequest.No?.Trim().ToUpperInvariant() ?? string.Empty,
            Date = orderDetailsRequest.Date,
            DeliveryDate = orderDetailsRequest.DeliveryDate
        };

        var partyInformation = new SalesOrderPartyInformation
        {
            CustomerId = partyInformationRequest.CustomerId,
            CustomerNameSnapshot = partyInformationRequest.CustomerName?.Trim() ?? string.Empty,
            CustomerCodeSnapshot = NormalizeOptional(partyInformationRequest.CustomerCode),
            Address = NormalizeOptional(partyInformationRequest.Address),
            Attention = NormalizeOptional(partyInformationRequest.Attention)
        };

        var commercialDetails = new SalesOrderCommercialDetails
        {
            RateLevel = string.IsNullOrWhiteSpace(commercialDetailsRequest.RateLevel)
                ? SalesOrderRateLevels.RRate
                : commercialDetailsRequest.RateLevel.Trim().ToUpperInvariant(),
            CurrencyId = commercialDetailsRequest.CurrencyId,
            CurrencyCodeSnapshot = NormalizeOptional(commercialDetailsRequest.CurrencyCode),
            CurrencySymbolSnapshot = NormalizeOptional(commercialDetailsRequest.CurrencySymbol),
            CreditLimit = commercialDetailsRequest.CreditLimit,
            IsInterState = commercialDetailsRequest.IsInterState,
            TaxApplication = string.IsNullOrWhiteSpace(commercialDetailsRequest.TaxApplication)
                ? SalesOrderTaxApplications.AfterDiscount
                : commercialDetailsRequest.TaxApplication.Trim()
        };

        var salesDetails = new SalesOrderSalesDetails
        {
            SalesManId = salesDetailsRequest.SalesManId,
            SalesManNameSnapshot = NormalizeOptional(salesDetailsRequest.SalesMan)
        };

        if (string.IsNullOrWhiteSpace(orderDetails.No))
        {
            return SalesOrderBuildResult.Invalid("Sales order number is required.");
        }

        if (!SalesOrderVoucherTypes.All.Contains(orderDetails.VoucherType, StringComparer.OrdinalIgnoreCase))
        {
            return SalesOrderBuildResult.Invalid("Voucher type must be either SL or PH.");
        }

        if (partyInformation.CustomerId == Guid.Empty)
        {
            return SalesOrderBuildResult.Invalid("Customer is required.");
        }

        if (!SalesOrderRateLevels.All.Contains(commercialDetails.RateLevel, StringComparer.OrdinalIgnoreCase))
        {
            return SalesOrderBuildResult.Invalid("Rate level is invalid.");
        }

        if (!SalesOrderTaxApplications.All.Contains(commercialDetails.TaxApplication, StringComparer.OrdinalIgnoreCase))
        {
            return SalesOrderBuildResult.Invalid("Tax application must be either After Discount or Before Discount.");
        }

        if (commercialDetails.CreditLimit is < 0)
        {
            return SalesOrderBuildResult.Invalid("Credit limit cannot be negative.");
        }

        if (footerRequest.Freight < 0 || footerRequest.SoAdvance < 0)
        {
            return SalesOrderBuildResult.Invalid("Freight and advance cannot be negative.");
        }

        if (itemsRequest is null || itemsRequest.Count == 0)
        {
            return SalesOrderBuildResult.Invalid("At least one line item is required.");
        }

        commercialDetails.RateLevel = SalesOrderRateLevels.All.First(value => value.Equals(commercialDetails.RateLevel, StringComparison.OrdinalIgnoreCase));
        commercialDetails.TaxApplication = SalesOrderTaxApplications.All.First(value => value.Equals(commercialDetails.TaxApplication, StringComparison.OrdinalIgnoreCase));

        var items = new List<SalesOrderLineItem>(itemsRequest.Count);
        foreach (var itemRequest in itemsRequest)
        {
            if (itemRequest.ProductId == Guid.Empty)
            {
                return SalesOrderBuildResult.Invalid("Each line item must have a product.");
            }

            if (itemRequest.UnitId == Guid.Empty)
            {
                return SalesOrderBuildResult.Invalid("Each line item must have a unit.");
            }

            if (itemRequest.Quantity <= 0)
            {
                return SalesOrderBuildResult.Invalid("Line item quantity must be greater than zero.");
            }

            if (itemRequest.Foc < 0 || itemRequest.Mrp < 0 || itemRequest.Rate < 0 || itemRequest.DiscountPercent < 0 || itemRequest.TaxPercent < 0)
            {
                return SalesOrderBuildResult.Invalid("Line item values cannot be negative.");
            }

            var grossAmount = RoundAmount(itemRequest.Quantity * itemRequest.Rate);
            var discountAmount = RoundAmount((grossAmount * itemRequest.DiscountPercent) / 100m);
            var taxableAmount = commercialDetails.TaxApplication == SalesOrderTaxApplications.BeforeDiscount
                ? grossAmount
                : Math.Max(0, RoundAmount(grossAmount - discountAmount));
            var taxAmount = RoundAmount((taxableAmount * itemRequest.TaxPercent) / 100m);
            var netAmount = RoundAmount(taxableAmount + taxAmount);

            items.Add(new SalesOrderLineItem
            {
                Sno = itemRequest.Sno <= 0 ? items.Count + 1 : itemRequest.Sno,
                ProductId = itemRequest.ProductId,
                ProductNameSnapshot = itemRequest.ProductNameSnapshot?.Trim() ?? string.Empty,
                HsnCode = NormalizeOptional(itemRequest.HsnCode),
                UnitId = itemRequest.UnitId,
                Quantity = itemRequest.Quantity,
                Foc = itemRequest.Foc,
                Mrp = itemRequest.Mrp,
                Rate = itemRequest.Rate,
                GrossAmount = grossAmount,
                DiscountPercent = itemRequest.DiscountPercent,
                DiscountAmount = discountAmount,
                TaxableAmount = taxableAmount,
                TaxPercent = itemRequest.TaxPercent,
                TaxAmount = taxAmount,
                NetAmount = netAmount,
                WarehouseId = itemRequest.WarehouseId
            });
        }

        var additions = new List<SalesOrderAddition>();
        foreach (var additionRequest in additionsRequest ?? [])
        {
            var normalizedType = string.IsNullOrWhiteSpace(additionRequest.Type)
                ? SalesOrderAdditionTypes.Addition
                : additionRequest.Type.Trim();
            var description = NormalizeOptional(additionRequest.Description);
            var ledgerName = NormalizeOptional(additionRequest.LedgerName);
            var hasMeaningfulData = additionRequest.LedgerId is not null || description is not null || additionRequest.Amount != 0;

            if (!hasMeaningfulData)
            {
                continue;
            }

            if (!SalesOrderAdditionTypes.All.Contains(normalizedType, StringComparer.OrdinalIgnoreCase))
            {
                return SalesOrderBuildResult.Invalid("Addition type must be either Addition or Deduction.");
            }

            if (additionRequest.Amount < 0)
            {
                return SalesOrderBuildResult.Invalid("Addition amount cannot be negative.");
            }

            normalizedType = SalesOrderAdditionTypes.All.First(value => value.Equals(normalizedType, StringComparison.OrdinalIgnoreCase));

            additions.Add(new SalesOrderAddition
            {
                Type = normalizedType,
                LedgerId = additionRequest.LedgerId,
                LedgerNameSnapshot = ledgerName ?? string.Empty,
                Description = description,
                Amount = additionRequest.Amount
            });
        }

        var footer = new SalesOrderFooter
        {
            VehicleNo = NormalizeOptional(footerRequest.VehicleNo),
            Freight = footerRequest.Freight,
            SoAdvance = footerRequest.SoAdvance,
            RoundOff = footerRequest.RoundOff,
            Remarks = NormalizeOptional(footerRequest.Remarks)
        };

        footer.Total = RoundAmount(items.Sum(item => item.GrossAmount));
        footer.Discount = RoundAmount(items.Sum(item => item.DiscountAmount));

        var additionsNet = RoundAmount(additions.Sum(item =>
            item.Type == SalesOrderAdditionTypes.Deduction ? -item.Amount : item.Amount));

        footer.NetTotal = RoundAmount(items.Sum(item => item.NetAmount) + footer.Freight + additionsNet + footer.RoundOff - footer.SoAdvance);
        footer.Balance = footer.NetTotal;

        return SalesOrderBuildResult.Valid(orderDetails, partyInformation, commercialDetails, salesDetails, items, additions, footer);
    }

    private static async Task<string?> ResolveReferencesAsync(AppDbContext dbContext, SalesOrderBuildResult buildResult, Guid userId, CancellationToken cancellationToken)
    {
        var currentUser = await dbContext.Users.FirstOrDefaultAsync(current => current.Id == userId && current.IsActive, cancellationToken);
        if (currentUser is null)
        {
            return "Authenticated user could not be resolved.";
        }

        var customer = await dbContext.Customers.FirstOrDefaultAsync(current => current.Id == buildResult.PartyInformation.CustomerId, cancellationToken);
        if (customer is null)
        {
            return "Selected customer does not exist.";
        }

        buildResult.PartyInformation.Customer = customer;
        if (string.IsNullOrWhiteSpace(buildResult.PartyInformation.CustomerNameSnapshot))
        {
            buildResult.PartyInformation.CustomerNameSnapshot = customer.BasicDetails.Name;
        }

        if (string.IsNullOrWhiteSpace(buildResult.PartyInformation.CustomerCodeSnapshot))
        {
            buildResult.PartyInformation.CustomerCodeSnapshot = customer.BasicDetails.Code;
        }

        if (string.IsNullOrWhiteSpace(buildResult.PartyInformation.Address))
        {
            buildResult.PartyInformation.Address = FormatCustomerAddress(customer);
        }

        if (buildResult.CommercialDetails.CurrencyId is not null)
        {
            var currency = await dbContext.Currencies.FirstOrDefaultAsync(current => current.Id == buildResult.CommercialDetails.CurrencyId.Value, cancellationToken);
            if (currency is null)
            {
                return "Selected currency does not exist.";
            }

            buildResult.CommercialDetails.Currency = currency;
            if (string.IsNullOrWhiteSpace(buildResult.CommercialDetails.CurrencyCodeSnapshot))
            {
                buildResult.CommercialDetails.CurrencyCodeSnapshot = currency.Code;
            }

            if (string.IsNullOrWhiteSpace(buildResult.CommercialDetails.CurrencySymbolSnapshot))
            {
                buildResult.CommercialDetails.CurrencySymbolSnapshot = currency.Symbol;
            }
        }

        if (buildResult.SalesDetails.SalesManId is not null)
        {
            var salesMan = await dbContext.Users.FirstOrDefaultAsync(current => current.Id == buildResult.SalesDetails.SalesManId.Value && current.IsActive, cancellationToken);
            if (salesMan is null)
            {
                return "Selected salesman does not exist.";
            }

            buildResult.SalesDetails.SalesMan = salesMan;
            if (string.IsNullOrWhiteSpace(buildResult.SalesDetails.SalesManNameSnapshot))
            {
                buildResult.SalesDetails.SalesManNameSnapshot = salesMan.Name;
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

    private static bool TryGetAuthenticatedUserId(ClaimsPrincipal principal, out Guid userId)
    {
        var rawUserId = principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? principal.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(rawUserId, out userId);
    }

    private static string NormalizeStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return SalesOrderStatuses.Draft;
        }

        var requested = status.Trim();
        return SalesOrderStatuses.All.FirstOrDefault(value => value.Equals(requested, StringComparison.OrdinalIgnoreCase))
            ?? SalesOrderStatuses.Draft;
    }

    private static decimal RoundAmount(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private static string? NormalizeOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string? FormatCustomerAddress(Customer customer)
    {
        var parts = new[]
        {
            customer.BillingAddress.Street,
            customer.BillingAddress.City,
            customer.BillingAddress.State,
            customer.BillingAddress.Pincode,
            customer.BillingAddress.Country
        }.Where(value => !string.IsNullOrWhiteSpace(value));

        var formatted = string.Join(", ", parts);
        return string.IsNullOrWhiteSpace(formatted) ? null : formatted;
    }

    private sealed record SalesOrderBuildResult(
        string? Error,
        SalesOrderOrderDetails? OrderDetails = null,
        SalesOrderPartyInformation? PartyInformation = null,
        SalesOrderCommercialDetails? CommercialDetails = null,
        SalesOrderSalesDetails? SalesDetails = null,
        List<SalesOrderLineItem>? Items = null,
        List<SalesOrderAddition>? Additions = null,
        SalesOrderFooter? Footer = null)
    {
        public SalesOrderOrderDetails OrderDetails { get; init; } = OrderDetails ?? new SalesOrderOrderDetails();
        public SalesOrderPartyInformation PartyInformation { get; init; } = PartyInformation ?? new SalesOrderPartyInformation();
        public SalesOrderCommercialDetails CommercialDetails { get; init; } = CommercialDetails ?? new SalesOrderCommercialDetails();
        public SalesOrderSalesDetails SalesDetails { get; init; } = SalesDetails ?? new SalesOrderSalesDetails();
        public List<SalesOrderLineItem> Items { get; init; } = Items ?? [];
        public List<SalesOrderAddition> Additions { get; init; } = Additions ?? [];
        public SalesOrderFooter Footer { get; init; } = Footer ?? new SalesOrderFooter();

        public static SalesOrderBuildResult Valid(
            SalesOrderOrderDetails orderDetails,
            SalesOrderPartyInformation partyInformation,
            SalesOrderCommercialDetails commercialDetails,
            SalesOrderSalesDetails salesDetails,
            List<SalesOrderLineItem> items,
            List<SalesOrderAddition> additions,
            SalesOrderFooter footer) =>
            new(null, orderDetails, partyInformation, commercialDetails, salesDetails, items, additions, footer);

        public static SalesOrderBuildResult Invalid(string error) => new(error);
    }
}
