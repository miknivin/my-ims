import {
  Customer,
  CustomerFilingFrequency,
  CustomerPayload,
  CustomerPriceLevel,
  CustomerStatus,
  CustomerTaxType,
  CustomerType,
} from "../../../../../app/api/customerApi";
import { BalanceType } from "../../../../../app/api/vendorApi";

export interface CustomerShippingAddressFormState {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface CustomerTaxDocumentFormState {
  id: string;
  taxType: CustomerTaxType;
  number: string;
  verified: boolean;
  verifiedAt: string;
  state: string;
  filingFrequency: string;
  effectiveFrom: string;
  effectiveTo: string;
}

export interface CustomerFormState {
  basicDetails: {
    code: string;
    name: string;
    alias: string;
    customerType: CustomerType;
    category: string;
    ledgerId: string;
    status: CustomerStatus;
  };
  contact: {
    phone: string;
    mobile: string;
    email: string;
    website: string;
  };
  financials: {
    creditLimit: string;
    creditDays: string;
  };
  openingBalance: {
    amount: string;
    balanceType: BalanceType;
    asOfDate: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  salesAndPricing: {
    defaultTaxId: string;
    priceLevel: CustomerPriceLevel;
    remarks: string;
  };
  shippingAddresses: CustomerShippingAddressFormState[];
  taxDocuments: CustomerTaxDocumentFormState[];
}

const createRowId = () => Math.random().toString(36).slice(2, 11);

export const createEmptyShippingAddress = (): CustomerShippingAddressFormState => ({
  id: createRowId(),
  name: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
});

export const createEmptyTaxDocument = (): CustomerTaxDocumentFormState => ({
  id: createRowId(),
  taxType: "GST",
  number: "",
  verified: false,
  verifiedAt: "",
  state: "",
  filingFrequency: "",
  effectiveFrom: "",
  effectiveTo: "",
});

export const createCustomerFormState = (customer?: Customer | null): CustomerFormState => ({
  basicDetails: {
    code: customer?.basicDetails.code ?? "",
    name: customer?.basicDetails.name ?? "",
    alias: customer?.basicDetails.alias ?? "",
    customerType: customer?.basicDetails.customerType ?? "Regular",
    category: customer?.basicDetails.category ?? "",
    ledgerId: customer?.ledgerId ?? "",
    status: customer?.status ?? "Active",
  },
  contact: {
    phone: customer?.contact.phone ?? "",
    mobile: customer?.contact.mobile ?? "",
    email: customer?.contact.email ?? "",
    website: customer?.contact.website ?? "",
  },
  financials: {
    creditLimit: customer?.financials.creditLimit?.toString() ?? "",
    creditDays: customer?.financials.creditDays?.toString() ?? "",
  },
  openingBalance: {
    amount: customer?.openingBalance?.amount?.toString() ?? "",
    balanceType: customer?.openingBalance?.balanceType ?? "Dr",
    asOfDate: customer?.openingBalance?.asOfDate ?? "",
  },
  billingAddress: {
    street: customer?.billingAddress.street ?? "",
    city: customer?.billingAddress.city ?? "",
    state: customer?.billingAddress.state ?? "",
    pincode: customer?.billingAddress.pincode ?? "",
    country: customer?.billingAddress.country ?? "India",
  },
  salesAndPricing: {
    defaultTaxId: customer?.salesAndPricing.defaultTaxId ?? "",
    priceLevel: customer?.salesAndPricing.priceLevel ?? "RRATE",
    remarks: customer?.statusDetails.remarks ?? "",
  },
  shippingAddresses:
    customer?.shippingAddresses.map((item) => ({
      id: item.id,
      name: item.name ?? "",
      street: item.street ?? "",
      city: item.city ?? "",
      state: item.state ?? "",
      pincode: item.pincode ?? "",
      country: item.country ?? "India",
      isDefault: item.isDefault,
    })) ?? [],
  taxDocuments:
    customer?.taxDocuments.map((item) => ({
      id: item.id,
      taxType: item.taxType,
      number: item.number,
      verified: item.verified,
      verifiedAt: item.verifiedAt ?? "",
      state: item.state ?? "",
      filingFrequency: item.filingFrequency ?? "",
      effectiveFrom: item.effectiveFrom,
      effectiveTo: item.effectiveTo ?? "",
    })) ?? [],
});

const numberOrNull = (value: string) => (value.trim() ? Number(value) : null);

const toFilingFrequency = (value: string): CustomerFilingFrequency | null =>
  value === "Monthly" || value === "Quarterly" ? value : null;

export const toCustomerPayload = (state: CustomerFormState): CustomerPayload => ({
  basicDetails: {
    code: state.basicDetails.code.trim().toUpperCase(),
    name: state.basicDetails.name.trim(),
    alias: state.basicDetails.alias.trim() || null,
    customerType: state.basicDetails.customerType,
    category: state.basicDetails.category.trim() || null,
  },
  ledgerId: state.basicDetails.ledgerId || null,
  contact: {
    phone: state.contact.phone.trim() || null,
    mobile: state.contact.mobile.trim() || null,
    email: state.contact.email.trim() || null,
    website: state.contact.website.trim() || null,
  },
  billingAddress: {
    street: state.billingAddress.street.trim() || null,
    city: state.billingAddress.city.trim() || null,
    state: state.billingAddress.state.trim() || null,
    pincode: state.billingAddress.pincode.trim() || null,
    country: state.billingAddress.country.trim() || null,
  },
  shippingAddresses: state.shippingAddresses
    .filter((item) => item.name.trim() || item.street.trim() || item.city.trim() || item.state.trim() || item.pincode.trim() || item.isDefault)
    .map((item) => ({
      name: item.name.trim() || null,
      street: item.street.trim() || null,
      city: item.city.trim() || null,
      state: item.state.trim() || null,
      pincode: item.pincode.trim() || null,
      country: item.country.trim() || null,
      isDefault: item.isDefault,
    })),
  taxDocuments: state.taxDocuments
    .filter((item) => item.number.trim())
    .map((item) => ({
      taxType: item.taxType,
      number: item.number.trim().toUpperCase(),
      verified: item.verified,
      verifiedAt: item.verified && item.verifiedAt ? item.verifiedAt : null,
      state: item.state.trim() || null,
      filingFrequency: toFilingFrequency(item.filingFrequency.trim()),
      effectiveFrom: item.effectiveFrom,
      effectiveTo: item.effectiveTo.trim() || null,
    })),
  financials: {
    creditLimit: numberOrNull(state.financials.creditLimit),
    creditDays: numberOrNull(state.financials.creditDays),
  },
  salesAndPricing: {
    defaultTaxId: state.salesAndPricing.defaultTaxId || null,
    priceLevel: state.salesAndPricing.priceLevel,
  },
  statusDetails: {
    remarks: state.salesAndPricing.remarks.trim() || null,
  },
  status: state.basicDetails.status,
  openingBalance:
    state.openingBalance.amount.trim() || state.openingBalance.asOfDate
      ? {
          amount: Number(state.openingBalance.amount),
          balanceType: state.openingBalance.balanceType,
          asOfDate: state.openingBalance.asOfDate,
        }
      : null,
});
