using backend.Features.Masters.Ledgers;
using backend.Features.Masters.Vendors;
using backend.Infrastructure.Filtering;
using backend.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Masters.Customers;

public static class CustomerEndpoints
{
    public static IEndpointRouteBuilder MapCustomerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/masters/customers").WithTags("Customer Masters");

        group.MapGet("/", GetAllAsync);
        group.MapGet("/{id:guid}", GetByIdAsync);
        group.MapPost("/", CreateAsync);
        group.MapPut("/{id:guid}", UpdateAsync);
        group.MapDelete("/{id:guid}", DeleteAsync);

        return app;
    }

    private static IQueryable<Customer> BuildQuery(AppDbContext dbContext) =>
        dbContext.Customers
            .Include(current => current.Ledger)
            .Include(current => current.OpeningBalance)
            .Include(current => current.SalesAndPricing.DefaultTax);

    private static async Task<IResult> GetAllAsync([AsParameters] CustomerFilterRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var handler = new GetCustomersQueryHandler(dbContext, new CustomerSortRegistry());
        var customers = await handler.HandleAsync(request, cancellationToken);

        return TypedResults.Ok(new ApiResponse<PagedResponse<CustomerListItemDto>>(true, "Customer list fetched successfully.", customers));
    }

    private static async Task<IResult> GetByIdAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var customer = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        return customer is null
            ? TypedResults.NotFound(new ApiResponse<object>(false, "Customer not found.", null))
            : TypedResults.Ok(new ApiResponse<CustomerDto>(true, "Customer fetched successfully.", CustomerDto.FromEntity(customer)));
    }

    private static async Task<IResult> CreateAsync(CreateCustomerRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildCustomerRequest(
            request.BasicDetails,
            request.Contact,
            request.BillingAddress,
            request.ShippingAddresses,
            request.TaxDocuments,
            request.Financials,
            request.SalesAndPricing,
            request.StatusDetails,
            request.Status,
            request.OpeningBalance);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        if (await dbContext.Customers.AnyAsync(current => current.BasicDetails.Code == buildResult.BasicDetails.Code || current.BasicDetails.Name == buildResult.BasicDetails.Name, cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Customer with this code or name already exists.", null));
        }

        var (ledger, resolutionError) = await PopulateReferencesAsync(dbContext, request.LedgerId, buildResult.SalesAndPricing, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        var now = DateTime.UtcNow;
        var customer = new Customer
        {
            BasicDetails = buildResult.BasicDetails,
            LedgerId = ledger?.Id,
            Ledger = ledger,
            Contact = buildResult.Contact,
            BillingAddress = buildResult.BillingAddress,
            ShippingAddresses = buildResult.ShippingAddresses,
            TaxDocuments = buildResult.TaxDocuments,
            Financials = buildResult.Financials,
            SalesAndPricing = buildResult.SalesAndPricing,
            StatusDetails = buildResult.StatusDetails,
            Status = buildResult.Status,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        if (buildResult.OpeningBalance is not null)
        {
            customer.OpeningBalance = new CustomerOpeningBalance
            {
                CustomerId = customer.Id,
                Amount = buildResult.OpeningBalance.Amount,
                BalanceType = buildResult.OpeningBalance.BalanceType,
                AsOfDate = buildResult.OpeningBalance.AsOfDate,
                CreatedAtUtc = now,
                UpdatedAtUtc = now
            };
        }

        dbContext.Customers.Add(customer);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Created($"/api/masters/customers/{customer.Id}", new ApiResponse<CustomerDto>(true, "Customer created successfully.", CustomerDto.FromEntity(customer)));
    }

    private static async Task<IResult> UpdateAsync(Guid id, UpdateCustomerRequest request, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var buildResult = BuildCustomerRequest(
            request.BasicDetails,
            request.Contact,
            request.BillingAddress,
            request.ShippingAddresses,
            request.TaxDocuments,
            request.Financials,
            request.SalesAndPricing,
            request.StatusDetails,
            request.Status,
            request.OpeningBalance);

        if (buildResult.Error is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, buildResult.Error, null));
        }

        var customer = await BuildQuery(dbContext).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (customer is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Customer not found.", null));
        }

        if (await dbContext.Customers.AnyAsync(current => current.Id != id && (current.BasicDetails.Code == buildResult.BasicDetails.Code || current.BasicDetails.Name == buildResult.BasicDetails.Name), cancellationToken))
        {
            return TypedResults.Conflict(new ApiResponse<object>(false, "Customer with this code or name already exists.", null));
        }

        var (ledger, resolutionError) = await PopulateReferencesAsync(dbContext, request.LedgerId, buildResult.SalesAndPricing, cancellationToken);
        if (resolutionError is not null)
        {
            return TypedResults.BadRequest(new ApiResponse<object>(false, resolutionError, null));
        }

        customer.BasicDetails = buildResult.BasicDetails;
        customer.LedgerId = ledger?.Id;
        customer.Ledger = ledger;
        customer.Contact = buildResult.Contact;
        customer.BillingAddress = buildResult.BillingAddress;
        customer.ShippingAddresses = buildResult.ShippingAddresses;
        customer.TaxDocuments = buildResult.TaxDocuments;
        customer.Financials = buildResult.Financials;
        customer.SalesAndPricing = buildResult.SalesAndPricing;
        customer.StatusDetails = buildResult.StatusDetails;
        customer.Status = buildResult.Status;
        customer.UpdatedAtUtc = DateTime.UtcNow;

        if (buildResult.OpeningBalance is null)
        {
            if (customer.OpeningBalance is not null)
            {
                dbContext.CustomerOpeningBalances.Remove(customer.OpeningBalance);
                customer.OpeningBalance = null;
            }
        }
        else if (customer.OpeningBalance is null)
        {
            var now = DateTime.UtcNow;
            customer.OpeningBalance = new CustomerOpeningBalance
            {
                CustomerId = customer.Id,
                Amount = buildResult.OpeningBalance.Amount,
                BalanceType = buildResult.OpeningBalance.BalanceType,
                AsOfDate = buildResult.OpeningBalance.AsOfDate,
                CreatedAtUtc = now,
                UpdatedAtUtc = now
            };
        }
        else
        {
            customer.OpeningBalance.Amount = buildResult.OpeningBalance.Amount;
            customer.OpeningBalance.BalanceType = buildResult.OpeningBalance.BalanceType;
            customer.OpeningBalance.AsOfDate = buildResult.OpeningBalance.AsOfDate;
            customer.OpeningBalance.UpdatedAtUtc = DateTime.UtcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<CustomerDto>(true, "Customer updated successfully.", CustomerDto.FromEntity(customer)));
    }

    private static async Task<IResult> DeleteAsync(Guid id, AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var customer = await dbContext.Customers.Include(current => current.OpeningBalance).FirstOrDefaultAsync(current => current.Id == id, cancellationToken);
        if (customer is null)
        {
            return TypedResults.NotFound(new ApiResponse<object>(false, "Customer not found.", null));
        }

        dbContext.Customers.Remove(customer);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<object>(true, "Customer deleted successfully.", null));
    }

    private static CustomerRequestBuildResult BuildCustomerRequest(
        CustomerBasicDetailsRequest basicDetailsRequest,
        CustomerContactRequest contactRequest,
        CustomerBillingAddressRequest billingAddressRequest,
        List<CustomerShippingAddressRequest>? shippingAddressRequests,
        List<CustomerTaxDocumentRequest>? taxDocumentRequests,
        CustomerFinancialsRequest financialsRequest,
        CustomerSalesAndPricingRequest salesAndPricingRequest,
        CustomerStatusDetailsRequest statusDetailsRequest,
        string? status,
        CustomerOpeningBalanceRequest? openingBalanceRequest)
    {
        var basicDetails = new CustomerBasicDetails
        {
            Code = basicDetailsRequest.Code?.Trim().ToUpperInvariant() ?? string.Empty,
            Name = basicDetailsRequest.Name?.Trim() ?? string.Empty,
            Alias = NormalizeOptional(basicDetailsRequest.Alias),
            CustomerType = string.IsNullOrWhiteSpace(basicDetailsRequest.CustomerType) ? CustomerTypes.Regular : basicDetailsRequest.CustomerType.Trim(),
            Category = NormalizeOptional(basicDetailsRequest.Category)
        };

        var contact = new CustomerContact
        {
            Phone = NormalizeOptional(contactRequest.Phone),
            Mobile = NormalizeOptional(contactRequest.Mobile),
            Email = NormalizeOptional(contactRequest.Email),
            Website = NormalizeOptional(contactRequest.Website)
        };

        var billingAddress = NormalizeBillingAddress(billingAddressRequest);
        var shippingAddresses = NormalizeShippingAddresses(shippingAddressRequests ?? []);
        var taxDocuments = NormalizeTaxDocuments(taxDocumentRequests ?? []);
        var financials = new CustomerFinancials
        {
            CreditLimit = financialsRequest.CreditLimit,
            CreditDays = financialsRequest.CreditDays
        };
        var salesAndPricing = new CustomerSalesAndPricing
        {
            DefaultTaxId = salesAndPricingRequest.DefaultTaxId,
            PriceLevel = string.IsNullOrWhiteSpace(salesAndPricingRequest.PriceLevel) ? CustomerPriceLevels.RRate : salesAndPricingRequest.PriceLevel.Trim()
        };
        var statusDetails = NormalizeStatusDetails(statusDetailsRequest);
        var normalizedStatus = string.IsNullOrWhiteSpace(status) ? CustomerStatuses.Active : status.Trim();
        var openingBalance = openingBalanceRequest;

        if (string.IsNullOrWhiteSpace(basicDetails.Code))
        {
            return new CustomerRequestBuildResult("Customer code is required.");
        }

        if (basicDetails.Code.Length is < 2 or > 20)
        {
            return new CustomerRequestBuildResult("Customer code must be between 2 and 20 characters.");
        }

        if (string.IsNullOrWhiteSpace(basicDetails.Name))
        {
            return new CustomerRequestBuildResult("Customer name is required.");
        }

        if (basicDetails.Name.Length is < 3 or > 150)
        {
            return new CustomerRequestBuildResult("Customer name must be between 3 and 150 characters.");
        }

        var requestedCustomerType = basicDetails.CustomerType;
        if (!CustomerTypes.All.Contains(requestedCustomerType, StringComparer.OrdinalIgnoreCase))
        {
            return new CustomerRequestBuildResult("Customer type is invalid.");
        }

        basicDetails.CustomerType = CustomerTypes.All.First(value => value.Equals(requestedCustomerType, StringComparison.OrdinalIgnoreCase));

        if (contact.Email is not null && contact.Email.Length > 120)
        {
            return new CustomerRequestBuildResult("Email cannot exceed 120 characters.");
        }

        if (contact.Phone is not null && contact.Phone.Length > 30)
        {
            return new CustomerRequestBuildResult("Phone cannot exceed 30 characters.");
        }

        if (contact.Mobile is not null && contact.Mobile.Length > 30)
        {
            return new CustomerRequestBuildResult("Mobile cannot exceed 30 characters.");
        }

        if (financials.CreditLimit is < 0)
        {
            return new CustomerRequestBuildResult("Credit limit cannot be negative.");
        }

        if (financials.CreditDays is < 0)
        {
            return new CustomerRequestBuildResult("Credit days cannot be negative.");
        }

        var requestedPriceLevel = salesAndPricing.PriceLevel;
        if (!CustomerPriceLevels.All.Contains(requestedPriceLevel, StringComparer.OrdinalIgnoreCase))
        {
            return new CustomerRequestBuildResult("Price level is invalid.");
        }

        salesAndPricing.PriceLevel = CustomerPriceLevels.All.First(value => value.Equals(requestedPriceLevel, StringComparison.OrdinalIgnoreCase));

        if (shippingAddresses.Count(item => item.IsDefault) > 1)
        {
            return new CustomerRequestBuildResult("Only one shipping address can be marked as default.");
        }

        foreach (var document in taxDocuments)
        {
            if (!CustomerTaxTypes.All.Contains(document.TaxType, StringComparer.OrdinalIgnoreCase))
            {
                return new CustomerRequestBuildResult("Tax document type is invalid.");
            }

            document.TaxType = CustomerTaxTypes.All.First(value => value.Equals(document.TaxType, StringComparison.OrdinalIgnoreCase));

            if (document.FilingFrequency is not null && !CustomerFilingFrequencies.All.Contains(document.FilingFrequency, StringComparer.OrdinalIgnoreCase))
            {
                return new CustomerRequestBuildResult("Tax document filing frequency is invalid.");
            }

            if (document.FilingFrequency is not null)
            {
                document.FilingFrequency = CustomerFilingFrequencies.All.First(value => value.Equals(document.FilingFrequency, StringComparison.OrdinalIgnoreCase));
            }

            if (document.EffectiveTo is not null && document.EffectiveTo < document.EffectiveFrom)
            {
                return new CustomerRequestBuildResult("Tax document effective-to date cannot be earlier than effective-from date.");
            }
        }

        var requestedStatus = normalizedStatus;
        if (!CustomerStatuses.All.Contains(requestedStatus, StringComparer.OrdinalIgnoreCase))
        {
            return new CustomerRequestBuildResult("Status must be either Active or Inactive.");
        }

        if (openingBalanceRequest is not null)
        {
            if (openingBalanceRequest.Amount < 0)
            {
                return new CustomerRequestBuildResult("Opening balance amount cannot be negative.");
            }

            if (!BalanceTypes.All.Contains(openingBalanceRequest.BalanceType, StringComparer.OrdinalIgnoreCase))
            {
                return new CustomerRequestBuildResult("Opening balance type must be either Dr or Cr.");
            }

            openingBalance = openingBalanceRequest with
            {
                BalanceType = BalanceTypes.All.First(value => value.Equals(openingBalanceRequest.BalanceType, StringComparison.OrdinalIgnoreCase))
            };
        }

        normalizedStatus = CustomerStatuses.All.First(value => value.Equals(requestedStatus, StringComparison.OrdinalIgnoreCase));
        return new CustomerRequestBuildResult(
            null,
            basicDetails,
            contact,
            billingAddress,
            shippingAddresses,
            taxDocuments,
            financials,
            salesAndPricing,
            statusDetails,
            normalizedStatus,
            openingBalance);
    }

    private static CustomerBillingAddress NormalizeBillingAddress(CustomerBillingAddressRequest request) =>
        new()
        {
            Street = NormalizeOptional(request.Street),
            City = NormalizeOptional(request.City),
            State = NormalizeOptional(request.State),
            Pincode = NormalizeOptional(request.Pincode),
            Country = NormalizeOptional(request.Country) ?? "India"
        };

    private static CustomerStatusDetails NormalizeStatusDetails(CustomerStatusDetailsRequest request) =>
        new()
        {
            Remarks = NormalizeOptional(request.Remarks)
        };

    private static List<CustomerShippingAddress> NormalizeShippingAddresses(IEnumerable<CustomerShippingAddressRequest> requests) =>
        requests
            .Select(request => new CustomerShippingAddress
            {
                Name = NormalizeOptional(request.Name),
                Street = NormalizeOptional(request.Street),
                City = NormalizeOptional(request.City),
                State = NormalizeOptional(request.State),
                Pincode = NormalizeOptional(request.Pincode),
                Country = NormalizeOptional(request.Country) ?? "India",
                IsDefault = request.IsDefault
            })
            .Where(item => item.Name is not null || item.Street is not null || item.City is not null || item.State is not null || item.Pincode is not null || item.IsDefault)
            .ToList();

    private static List<CustomerTaxDocument> NormalizeTaxDocuments(IEnumerable<CustomerTaxDocumentRequest> requests) =>
        requests
            .Select(request => new CustomerTaxDocument
            {
                TaxType = string.IsNullOrWhiteSpace(request.TaxType) ? CustomerTaxTypes.Gst : request.TaxType.Trim(),
                Number = request.Number?.Trim().ToUpperInvariant() ?? string.Empty,
                Verified = request.Verified,
                VerifiedAt = request.Verified ? request.VerifiedAt : null,
                State = NormalizeOptional(request.State),
                FilingFrequency = NormalizeOptional(request.FilingFrequency),
                EffectiveFrom = request.EffectiveFrom,
                EffectiveTo = request.EffectiveTo
            })
            .Where(item => !string.IsNullOrWhiteSpace(item.Number))
            .ToList();

    private static async Task<(Ledger? Ledger, string? Error)> PopulateReferencesAsync(AppDbContext dbContext, Guid? ledgerId, CustomerSalesAndPricing salesAndPricing, CancellationToken cancellationToken)
    {
        Ledger? ledger = null;

        if (ledgerId is not null)
        {
            ledger = await dbContext.Ledgers.FirstOrDefaultAsync(current => current.Id == ledgerId.Value, cancellationToken);
            if (ledger is null)
            {
                return (null, "Selected ledger does not exist.");
            }

            if (ledger.Status != LedgerStatuses.Active)
            {
                return (null, "Selected ledger must be active.");
            }
        }

        if (salesAndPricing.DefaultTaxId is not null)
        {
            salesAndPricing.DefaultTax = await dbContext.Taxes.FirstOrDefaultAsync(current => current.Id == salesAndPricing.DefaultTaxId.Value, cancellationToken);
            if (salesAndPricing.DefaultTax is null)
            {
                return (null, "Selected default tax does not exist.");
            }
        }

        return (ledger, null);
    }

    private static string? NormalizeOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed record CustomerRequestBuildResult(
        string? Error,
        CustomerBasicDetails? BasicDetails = null,
        CustomerContact? Contact = null,
        CustomerBillingAddress? BillingAddress = null,
        List<CustomerShippingAddress>? ShippingAddresses = null,
        List<CustomerTaxDocument>? TaxDocuments = null,
        CustomerFinancials? Financials = null,
        CustomerSalesAndPricing? SalesAndPricing = null,
        CustomerStatusDetails? StatusDetails = null,
        string Status = "",
        CustomerOpeningBalanceRequest? OpeningBalance = null)
    {
        public CustomerBasicDetails BasicDetails { get; init; } = BasicDetails ?? new CustomerBasicDetails();
        public CustomerContact Contact { get; init; } = Contact ?? new CustomerContact();
        public CustomerBillingAddress BillingAddress { get; init; } = BillingAddress ?? new CustomerBillingAddress();
        public List<CustomerShippingAddress> ShippingAddresses { get; init; } = ShippingAddresses ?? [];
        public List<CustomerTaxDocument> TaxDocuments { get; init; } = TaxDocuments ?? [];
        public CustomerFinancials Financials { get; init; } = Financials ?? new CustomerFinancials();
        public CustomerSalesAndPricing SalesAndPricing { get; init; } = SalesAndPricing ?? new CustomerSalesAndPricing();
        public CustomerStatusDetails StatusDetails { get; init; } = StatusDetails ?? new CustomerStatusDetails();
    }
}
