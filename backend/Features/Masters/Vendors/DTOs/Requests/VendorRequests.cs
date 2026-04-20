namespace backend.Features.Masters.Vendors;

public sealed record VendorBasicInfoRequest(
    string Code,
    string Name,
    string? Under);

public sealed record VendorAddressAndContactRequest(
    string? ContactName,
    string? NameInOl,
    string Address,
    string Phone,
    string? Mobile,
    string Email,
    string? Web,
    string? Fax);

public sealed record VendorCreditAndFinanceRequest(
    decimal? CreditLimit,
    int? DueDays,
    Guid? CurrencyId,
    string? PaymentTerms,
    string? Remark);

public sealed record VendorTaxAndComplianceRequest(
    string? Gstin,
    string? Tin);

public sealed record VendorBankDetailsRequest(
    string? BankDetails,
    string? AccountNo,
    string? BankAddress);

public sealed record VendorOtherInfoRequest(
    string? Company);

public sealed record VendorOpeningBalanceRequest(
    decimal Amount,
    string BalanceType,
    DateOnly AsOfDate);

public sealed record CreateVendorRequest(
    VendorBasicInfoRequest BasicInfo,
    VendorAddressAndContactRequest AddressAndContact,
    VendorCreditAndFinanceRequest CreditAndFinance,
    VendorTaxAndComplianceRequest TaxAndCompliance,
    Guid? LedgerId,
    VendorBankDetailsRequest BankDetails,
    VendorOtherInfoRequest Other,
    string? Status,
    VendorOpeningBalanceRequest? OpeningBalance);

public sealed record UpdateVendorRequest(
    VendorBasicInfoRequest BasicInfo,
    VendorAddressAndContactRequest AddressAndContact,
    VendorCreditAndFinanceRequest CreditAndFinance,
    VendorTaxAndComplianceRequest TaxAndCompliance,
    Guid? LedgerId,
    VendorBankDetailsRequest BankDetails,
    VendorOtherInfoRequest Other,
    string? Status,
    VendorOpeningBalanceRequest? OpeningBalance);
