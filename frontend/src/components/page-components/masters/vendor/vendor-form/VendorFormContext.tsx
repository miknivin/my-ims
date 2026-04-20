import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Vendor } from "../../../../../app/api/vendorApi";
import {
  createVendorFormState,
  VendorAddressAndContactFormState,
  VendorBankDetailsFormState,
  VendorBasicInfoFormState,
  VendorCreditAndFinanceFormState,
  VendorFormState,
  VendorOpeningBalanceFormState,
  VendorOtherFormState,
  VendorTaxAndComplianceFormState,
} from "./types";

type VendorFormContextValue = {
  state: VendorFormState;
  setBasicInfo: (patch: Partial<VendorBasicInfoFormState>) => void;
  setAddressAndContact: (patch: Partial<VendorAddressAndContactFormState>) => void;
  setCreditAndFinance: (patch: Partial<VendorCreditAndFinanceFormState>) => void;
  setTaxAndCompliance: (patch: Partial<VendorTaxAndComplianceFormState>) => void;
  setBankDetails: (patch: Partial<VendorBankDetailsFormState>) => void;
  setOther: (patch: Partial<VendorOtherFormState>) => void;
  setOpeningBalance: (patch: Partial<VendorOpeningBalanceFormState>) => void;
};

const VendorFormContext = createContext<VendorFormContextValue | undefined>(undefined);

export function VendorFormProvider({
  vendor,
  children,
}: {
  vendor?: Vendor | null;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<VendorFormState>(() => createVendorFormState(vendor));

  useEffect(() => {
    setState(createVendorFormState(vendor));
  }, [vendor]);

  const value = useMemo<VendorFormContextValue>(
    () => ({
      state,
      setBasicInfo: (patch) =>
        setState((current) => ({ ...current, basicInfo: { ...current.basicInfo, ...patch } })),
      setAddressAndContact: (patch) =>
        setState((current) => ({
          ...current,
          addressAndContact: { ...current.addressAndContact, ...patch },
        })),
      setCreditAndFinance: (patch) =>
        setState((current) => ({
          ...current,
          creditAndFinance: { ...current.creditAndFinance, ...patch },
        })),
      setTaxAndCompliance: (patch) =>
        setState((current) => ({
          ...current,
          taxAndCompliance: { ...current.taxAndCompliance, ...patch },
        })),
      setBankDetails: (patch) =>
        setState((current) => ({
          ...current,
          bankDetails: { ...current.bankDetails, ...patch },
        })),
      setOther: (patch) =>
        setState((current) => ({ ...current, other: { ...current.other, ...patch } })),
      setOpeningBalance: (patch) =>
        setState((current) => ({
          ...current,
          openingBalance: { ...current.openingBalance, ...patch },
        })),
    }),
    [state]
  );

  return <VendorFormContext.Provider value={value}>{children}</VendorFormContext.Provider>;
}

export function useVendorForm() {
  const context = useContext(VendorFormContext);
  if (!context) {
    throw new Error("useVendorForm must be used within VendorFormProvider");
  }

  return context;
}
