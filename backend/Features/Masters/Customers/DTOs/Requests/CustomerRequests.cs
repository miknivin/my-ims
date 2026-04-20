namespace backend.Features.Masters.Customers;

public sealed record CustomerBasicDetailsRequest(string Code, string Name, string? Alias, string CustomerType, string? Category);
public sealed record CustomerContactRequest(string? Phone, string? Mobile, string? Email, string? Website);
public sealed record CustomerBillingAddressRequest(string? Street, string? City, string? State, string? Pincode, string? Country);
public sealed record CustomerShippingAddressRequest(string? Name, string? Street, string? City, string? State, string? Pincode, string? Country, bool IsDefault);
public sealed record CustomerTaxDocumentRequest(string TaxType, string Number, bool Verified, DateOnly? VerifiedAt, string? State, string? FilingFrequency, DateOnly EffectiveFrom, DateOnly? EffectiveTo);
public sealed record CustomerFinancialsRequest(decimal? CreditLimit, int? CreditDays);
public sealed record CustomerSalesAndPricingRequest(Guid? DefaultTaxId, string PriceLevel);
public sealed record CustomerStatusDetailsRequest(string? Remarks);
public sealed record CustomerOpeningBalanceRequest(decimal Amount, string BalanceType, DateOnly AsOfDate);
public sealed record CreateCustomerRequest(CustomerBasicDetailsRequest BasicDetails, Guid? LedgerId, CustomerContactRequest Contact, CustomerBillingAddressRequest BillingAddress, List<CustomerShippingAddressRequest> ShippingAddresses, List<CustomerTaxDocumentRequest> TaxDocuments, CustomerFinancialsRequest Financials, CustomerSalesAndPricingRequest SalesAndPricing, CustomerStatusDetailsRequest StatusDetails, string? Status, CustomerOpeningBalanceRequest? OpeningBalance);
public sealed record UpdateCustomerRequest(CustomerBasicDetailsRequest BasicDetails, Guid? LedgerId, CustomerContactRequest Contact, CustomerBillingAddressRequest BillingAddress, List<CustomerShippingAddressRequest> ShippingAddresses, List<CustomerTaxDocumentRequest> TaxDocuments, CustomerFinancialsRequest Financials, CustomerSalesAndPricingRequest SalesAndPricing, CustomerStatusDetailsRequest StatusDetails, string? Status, CustomerOpeningBalanceRequest? OpeningBalance);
