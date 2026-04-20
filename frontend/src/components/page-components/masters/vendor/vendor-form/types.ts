import { BalanceType, Vendor, VendorPayload, VendorStatus } from "../../../../../app/api/vendorApi";

export interface VendorBasicInfoFormState {
  code: string;
  name: string;
  under: string;
  status: VendorStatus;
  ledgerId: string;
}

export interface VendorAddressAndContactFormState {
  contactName: string;
  nameInOl: string;
  address: string;
  phone: string;
  mobile: string;
  email: string;
  web: string;
  fax: string;
}

export interface VendorCreditAndFinanceFormState {
  creditLimit: string;
  dueDays: string;
  currencyId: string;
  paymentTerms: string;
  remark: string;
}

export interface VendorTaxAndComplianceFormState {
  gstin: string;
  tin: string;
}

export interface VendorBankDetailsFormState {
  bankDetails: string;
  accountNo: string;
  bankAddress: string;
}

export interface VendorOtherFormState {
  company: string;
}

export interface VendorOpeningBalanceFormState {
  amount: string;
  balanceType: BalanceType;
  asOfDate: string;
}

export interface VendorFormState {
  basicInfo: VendorBasicInfoFormState;
  addressAndContact: VendorAddressAndContactFormState;
  creditAndFinance: VendorCreditAndFinanceFormState;
  taxAndCompliance: VendorTaxAndComplianceFormState;
  bankDetails: VendorBankDetailsFormState;
  other: VendorOtherFormState;
  openingBalance: VendorOpeningBalanceFormState;
}

export const createVendorFormState = (vendor?: Vendor | null): VendorFormState => ({
  basicInfo: {
    code: vendor?.basicInfo.code ?? "",
    name: vendor?.basicInfo.name ?? "",
    under: vendor?.basicInfo.under ?? "",
    status: vendor?.status ?? "Active",
    ledgerId: vendor?.ledgerId ?? "",
  },
  addressAndContact: {
    contactName: vendor?.addressAndContact.contactName ?? "",
    nameInOl: vendor?.addressAndContact.nameInOl ?? "",
    address: vendor?.addressAndContact.address ?? "",
    phone: vendor?.addressAndContact.phone ?? "",
    mobile: vendor?.addressAndContact.mobile ?? "",
    email: vendor?.addressAndContact.email ?? "",
    web: vendor?.addressAndContact.web ?? "",
    fax: vendor?.addressAndContact.fax ?? "",
  },
  creditAndFinance: {
    creditLimit: vendor?.creditAndFinance.creditLimit?.toString() ?? "",
    dueDays: vendor?.creditAndFinance.dueDays?.toString() ?? "",
    currencyId: vendor?.creditAndFinance.currencyId ?? "",
    paymentTerms: vendor?.creditAndFinance.paymentTerms ?? "",
    remark: vendor?.creditAndFinance.remark ?? "",
  },
  taxAndCompliance: {
    gstin: vendor?.taxAndCompliance.gstin ?? "",
    tin: vendor?.taxAndCompliance.tin ?? "",
  },
  bankDetails: {
    bankDetails: vendor?.bankDetails.bankDetails ?? "",
    accountNo: vendor?.bankDetails.accountNo ?? "",
    bankAddress: vendor?.bankDetails.bankAddress ?? "",
  },
  other: {
    company: vendor?.other.company ?? "",
  },
  openingBalance: {
    amount: vendor?.openingBalance?.amount?.toString() ?? "",
    balanceType: vendor?.openingBalance?.balanceType ?? "Cr",
    asOfDate: vendor?.openingBalance?.asOfDate ?? "",
  },
});

export const toVendorPayload = (state: VendorFormState): VendorPayload => ({
  basicInfo: {
    code: state.basicInfo.code.trim().toUpperCase(),
    name: state.basicInfo.name.trim(),
    under: state.basicInfo.under.trim() || null,
  },
  addressAndContact: {
    contactName: state.addressAndContact.contactName.trim() || null,
    nameInOl: state.addressAndContact.nameInOl.trim() || null,
    address: state.addressAndContact.address.trim(),
    phone: state.addressAndContact.phone.trim(),
    mobile: state.addressAndContact.mobile.trim() || null,
    email: state.addressAndContact.email.trim(),
    web: state.addressAndContact.web.trim() || null,
    fax: state.addressAndContact.fax.trim() || null,
  },
  creditAndFinance: {
    creditLimit: state.creditAndFinance.creditLimit.trim()
      ? Number(state.creditAndFinance.creditLimit)
      : null,
    dueDays: state.creditAndFinance.dueDays.trim()
      ? Number(state.creditAndFinance.dueDays)
      : null,
    currencyId: state.creditAndFinance.currencyId || null,
    paymentTerms: state.creditAndFinance.paymentTerms.trim() || null,
    remark: state.creditAndFinance.remark.trim() || null,
  },
  taxAndCompliance: {
    gstin: state.taxAndCompliance.gstin.trim() || null,
    tin: state.taxAndCompliance.tin.trim() || null,
  },
  ledgerId: state.basicInfo.ledgerId || null,
  bankDetails: {
    bankDetails: state.bankDetails.bankDetails.trim() || null,
    accountNo: state.bankDetails.accountNo.trim() || null,
    bankAddress: state.bankDetails.bankAddress.trim() || null,
  },
  other: {
    company: state.other.company.trim() || null,
  },
  status: state.basicInfo.status,
  openingBalance: state.openingBalance.amount.trim() || state.openingBalance.asOfDate
    ? {
        amount: Number(state.openingBalance.amount),
        balanceType: state.openingBalance.balanceType,
        asOfDate: state.openingBalance.asOfDate,
      }
    : null,
});
