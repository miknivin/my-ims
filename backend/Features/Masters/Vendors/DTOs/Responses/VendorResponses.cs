namespace backend.Features.Masters.Vendors;

public sealed record VendorOpeningBalanceDto(
    decimal Amount,
    string BalanceType,
    DateOnly AsOfDate);

public sealed record VendorBasicInfoDto(
    string Code,
    string Name,
    string? Under);

public sealed record VendorAddressAndContactDto(
    string? ContactName,
    string? NameInOl,
    string Address,
    string Phone,
    string? Mobile,
    string Email,
    string? Web,
    string? Fax);

public sealed record VendorCreditAndFinanceDto(
    decimal? CreditLimit,
    int? DueDays,
    Guid? CurrencyId,
    string? CurrencyCode,
    string? PaymentTerms,
    string? Remark);

public sealed record VendorTaxAndComplianceDto(
    string? Gstin,
    string? Tin);

public sealed record VendorBankDetailsDto(
    string? BankDetails,
    string? AccountNo,
    string? BankAddress);

public sealed record VendorOtherInfoDto(
    string? Company);

public sealed record VendorDto(
    Guid Id,
    VendorBasicInfoDto BasicInfo,
    VendorAddressAndContactDto AddressAndContact,
    VendorCreditAndFinanceDto CreditAndFinance,
    VendorTaxAndComplianceDto TaxAndCompliance,
    Guid? LedgerId,
    string? LedgerCode,
    string? LedgerName,
    VendorBankDetailsDto BankDetails,
    VendorOtherInfoDto Other,
    string Status,
    VendorOpeningBalanceDto? OpeningBalance,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc)
{
    public static VendorDto FromEntity(Vendor vendor)
    {
        return new VendorDto(
            vendor.Id,
            new VendorBasicInfoDto(
                vendor.BasicInfo.Code,
                vendor.BasicInfo.Name,
                vendor.BasicInfo.Under),
            new VendorAddressAndContactDto(
                vendor.AddressAndContact.ContactName,
                vendor.AddressAndContact.NameInOl,
                vendor.AddressAndContact.Address,
                vendor.AddressAndContact.Phone,
                vendor.AddressAndContact.Mobile,
                vendor.AddressAndContact.Email,
                vendor.AddressAndContact.Web,
                vendor.AddressAndContact.Fax),
            new VendorCreditAndFinanceDto(
                vendor.CreditAndFinance.CreditLimit,
                vendor.CreditAndFinance.DueDays,
                vendor.CreditAndFinance.CurrencyId,
                vendor.CreditAndFinance.Currency?.Code,
                vendor.CreditAndFinance.PaymentTerms,
                vendor.CreditAndFinance.Remark),
            new VendorTaxAndComplianceDto(
                vendor.TaxAndCompliance.Gstin,
                vendor.TaxAndCompliance.Tin),
            vendor.LedgerId,
            vendor.Ledger?.Code,
            vendor.Ledger?.Name,
            new VendorBankDetailsDto(
                vendor.BankDetails.BankDetails,
                vendor.BankDetails.AccountNo,
                vendor.BankDetails.BankAddress),
            new VendorOtherInfoDto(vendor.Other.Company),
            vendor.Status,
            vendor.OpeningBalance is null
                ? null
                : new VendorOpeningBalanceDto(
                    vendor.OpeningBalance.Amount,
                    vendor.OpeningBalance.BalanceType,
                    vendor.OpeningBalance.AsOfDate),
            vendor.CreatedAtUtc,
            vendor.UpdatedAtUtc);
    }
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
