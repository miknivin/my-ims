import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Customer } from "../../../../../app/api/customerApi";
import {
  createCustomerFormState,
  CustomerFormState,
  CustomerShippingAddressFormState,
  CustomerTaxDocumentFormState,
} from "./types";

type CustomerFormContextValue = {
  state: CustomerFormState;
  setSection: <K extends Exclude<keyof CustomerFormState, "shippingAddresses" | "taxDocuments">>(
    section: K,
    patch: Partial<CustomerFormState[K]>,
  ) => void;
  saveShippingAddress: (item: CustomerShippingAddressFormState) => void;
  removeShippingAddress: (id: string) => void;
  saveTaxDocument: (item: CustomerTaxDocumentFormState) => void;
  removeTaxDocument: (id: string) => void;
};

const CustomerFormContext = createContext<CustomerFormContextValue | undefined>(undefined);

export function CustomerFormProvider({
  customer,
  children,
}: {
  customer?: Customer | null;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<CustomerFormState>(() => createCustomerFormState(customer));

  useEffect(() => {
    setState(createCustomerFormState(customer));
  }, [customer]);

  const value = useMemo<CustomerFormContextValue>(
    () => ({
      state,
      setSection: (section, patch) =>
        setState((current) => ({
          ...current,
          [section]: { ...current[section], ...patch },
        })),
      saveShippingAddress: (item) =>
        setState((current) => ({
          ...current,
          shippingAddresses: [
            ...current.shippingAddresses
              .filter((currentItem) => currentItem.id !== item.id)
              .map((currentItem) =>
                item.isDefault ? { ...currentItem, isDefault: false } : currentItem,
              ),
            item,
          ],
        })),
      removeShippingAddress: (id) =>
        setState((current) => ({
          ...current,
          shippingAddresses: current.shippingAddresses.filter((item) => item.id !== id),
        })),
      saveTaxDocument: (item) =>
        setState((current) => ({
          ...current,
          taxDocuments: [
            ...current.taxDocuments.filter((currentItem) => currentItem.id !== item.id),
            item.verified ? item : { ...item, verifiedAt: "" },
          ],
        })),
      removeTaxDocument: (id) =>
        setState((current) => ({
          ...current,
          taxDocuments: current.taxDocuments.filter((item) => item.id !== id),
        })),
    }),
    [state],
  );

  return <CustomerFormContext.Provider value={value}>{children}</CustomerFormContext.Provider>;
}

export function useCustomerForm() {
  const context = useContext(CustomerFormContext);
  if (!context) {
    throw new Error("useCustomerForm must be used within CustomerFormProvider");
  }

  return context;
}
