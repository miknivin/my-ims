namespace backend.Features.Masters.Customers;

public sealed record CustomerBasicDetailsDto(string Code, string Name, string? Alias, string CustomerType, string? Category);
public sealed record CustomerContactDto(string? Phone, string? Mobile, string? Email, string? Website);
public sealed record CustomerBillingAddressDto(string? Street, string? City, string? State, string? Pincode, string? Country);
public sealed record CustomerShippingAddressDto(Guid Id, string? Name, string? Street, string? City, string? State, string? Pincode, string? Country, bool IsDefault);
public sealed record CustomerTaxDocumentDto(Guid Id, string TaxType, string Number, bool Verified, DateOnly? VerifiedAt, string? State, string? FilingFrequency, DateOnly EffectiveFrom, DateOnly? EffectiveTo);
public sealed record CustomerFinancialsDto(decimal? CreditLimit, int? CreditDays);
public sealed record CustomerSalesAndPricingDto(Guid? DefaultTaxId, string? DefaultTaxName, string PriceLevel);
public sealed record CustomerStatusDetailsDto(string? Remarks);
public sealed record CustomerOpeningBalanceDto(decimal Amount, string BalanceType, DateOnly AsOfDate);

public sealed record CustomerDto(Guid Id, CustomerBasicDetailsDto BasicDetails, Guid? LedgerId, string? LedgerCode, string? LedgerName, CustomerContactDto Contact, CustomerBillingAddressDto BillingAddress, IReadOnlyList<CustomerShippingAddressDto> ShippingAddresses, IReadOnlyList<CustomerTaxDocumentDto> TaxDocuments, CustomerFinancialsDto Financials, CustomerSalesAndPricingDto SalesAndPricing, CustomerStatusDetailsDto StatusDetails, string Status, CustomerOpeningBalanceDto? OpeningBalance, DateTime CreatedAtUtc, DateTime UpdatedAtUtc)
{
    public static CustomerDto FromEntity(Customer customer)
    {
        return new CustomerDto(
            customer.Id,
            new CustomerBasicDetailsDto(customer.BasicDetails.Code, customer.BasicDetails.Name, customer.BasicDetails.Alias, customer.BasicDetails.CustomerType, customer.BasicDetails.Category),
            customer.LedgerId,
            customer.Ledger?.Code,
            customer.Ledger?.Name,
            new CustomerContactDto(customer.Contact.Phone, customer.Contact.Mobile, customer.Contact.Email, customer.Contact.Website),
            new CustomerBillingAddressDto(customer.BillingAddress.Street, customer.BillingAddress.City, customer.BillingAddress.State, customer.BillingAddress.Pincode, customer.BillingAddress.Country),
            customer.ShippingAddresses.OrderByDescending(item => item.IsDefault).ThenBy(item => item.Name).Select(item => new CustomerShippingAddressDto(item.Id, item.Name, item.Street, item.City, item.State, item.Pincode, item.Country, item.IsDefault)).ToList(),
            customer.TaxDocuments.OrderBy(item => item.EffectiveFrom).Select(item => new CustomerTaxDocumentDto(item.Id, item.TaxType, item.Number, item.Verified, item.VerifiedAt, item.State, item.FilingFrequency, item.EffectiveFrom, item.EffectiveTo)).ToList(),
            new CustomerFinancialsDto(customer.Financials.CreditLimit, customer.Financials.CreditDays),
            new CustomerSalesAndPricingDto(customer.SalesAndPricing.DefaultTaxId, customer.SalesAndPricing.DefaultTax?.Name, customer.SalesAndPricing.PriceLevel),
            new CustomerStatusDetailsDto(customer.StatusDetails.Remarks),
            customer.Status,
            customer.OpeningBalance is null ? null : new CustomerOpeningBalanceDto(customer.OpeningBalance.Amount, customer.OpeningBalance.BalanceType, customer.OpeningBalance.AsOfDate),
            customer.CreatedAtUtc,
            customer.UpdatedAtUtc);
    }
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
