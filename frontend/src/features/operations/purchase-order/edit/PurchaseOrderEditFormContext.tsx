import { createContext, useContext, useMemo, useState } from "react";
import {
  createEmptyPurchaseOrderAddition,
  createEmptyPurchaseOrderLine,
  createPurchaseOrderFormState,
  PurchaseOrderAdditionState,
  PurchaseOrderDeliveryInformationState,
  PurchaseOrderFinancialDetailsState,
  PurchaseOrderFooterState,
  PurchaseOrderFormState,
  PurchaseOrderLineState,
  PurchaseOrderOrderDetailsState,
  PurchaseOrderProductInformationState,
  PurchaseOrderVendorInformationState,
  recalculatePurchaseOrderState,
} from "../create/types/types";

export type PurchaseOrderEditConfig = {
  id: string;
  status: string;
};

type PurchaseOrderEditFormContextValue = {
  state: PurchaseOrderFormState;
  editConfig: PurchaseOrderEditConfig;
  setOrderDetails: (patch: Partial<PurchaseOrderOrderDetailsState>) => void;
  setVendorInformation: (patch: Partial<PurchaseOrderVendorInformationState>) => void;
  setFinancialDetails: (patch: Partial<PurchaseOrderFinancialDetailsState>) => void;
  setDeliveryInformation: (patch: Partial<PurchaseOrderDeliveryInformationState>) => void;
  setProductInformation: (patch: Partial<PurchaseOrderProductInformationState>) => void;
  setFooter: (patch: Partial<PurchaseOrderFooterState>) => void;
  updateLine: (rowId: string, patch: Partial<PurchaseOrderLineState>) => void;
  addLine: () => void;
  removeLine: (rowId: string) => void;
  updateAddition: (rowId: string, patch: Partial<PurchaseOrderAdditionState>) => void;
  addAddition: () => void;
  removeAddition: (rowId: string) => void;
};

const PurchaseOrderEditFormContext = createContext<
  PurchaseOrderEditFormContextValue | undefined
>(undefined);

export function PurchaseOrderEditFormProvider({
  children,
  initialState,
  editConfig,
}: {
  children: React.ReactNode;
  initialState: PurchaseOrderFormState;
  editConfig: PurchaseOrderEditConfig;
}) {
  const [state, setState] = useState<PurchaseOrderFormState>(initialState);

  const value = useMemo<PurchaseOrderEditFormContextValue>(
    () => ({
      state,
      editConfig,
      setOrderDetails: (patch) =>
        setState((current) => ({
          ...current,
          orderDetails: { ...current.orderDetails, ...patch },
        })),
      setVendorInformation: (patch) =>
        setState((current) =>
          recalculatePurchaseOrderState({
            ...current,
            vendorInformation: { ...current.vendorInformation, ...patch },
          }),
        ),
      setFinancialDetails: (patch) =>
        setState((current) =>
          recalculatePurchaseOrderState({
            ...current,
            financialDetails: { ...current.financialDetails, ...patch },
          }),
        ),
      setDeliveryInformation: (patch) =>
        setState((current) => ({
          ...current,
          deliveryInformation: { ...current.deliveryInformation, ...patch },
        })),
      setProductInformation: (patch) =>
        setState((current) => ({
          ...current,
          productInformation: { ...current.productInformation, ...patch },
        })),
      setFooter: (patch) =>
        setState((current) =>
          recalculatePurchaseOrderState({
            ...current,
            footer: { ...current.footer, ...patch },
          }),
        ),
      updateLine: (rowId, patch) =>
        setState((current) =>
          recalculatePurchaseOrderState({
            ...current,
            items: current.items.map((line) =>
              line.rowId === rowId ? { ...line, ...patch } : line,
            ),
          }),
        ),
      addLine: () =>
        setState((current) =>
          recalculatePurchaseOrderState({
            ...current,
            items: [
              ...current.items,
              createEmptyPurchaseOrderLine(current.items.length + 1, {
                warehouseId: current.deliveryInformation.warehouseId,
              }),
            ],
          }),
        ),
      removeLine: (rowId) =>
        setState((current) =>
          recalculatePurchaseOrderState({
            ...current,
            items:
              current.items.length > 1
                ? current.items.filter((line) => line.rowId !== rowId)
                : [createEmptyPurchaseOrderLine(1)],
          }),
        ),
      updateAddition: (rowId, patch) =>
        setState((current) =>
          recalculatePurchaseOrderState({
            ...current,
            additions: current.additions.map((addition) =>
              addition.rowId === rowId ? { ...addition, ...patch } : addition,
            ),
          }),
        ),
      addAddition: () =>
        setState((current) =>
          recalculatePurchaseOrderState({
            ...current,
            additions: [...current.additions, createEmptyPurchaseOrderAddition()],
          }),
        ),
      removeAddition: (rowId) =>
        setState((current) =>
          recalculatePurchaseOrderState({
            ...current,
            additions: current.additions.filter(
              (addition) => addition.rowId !== rowId,
            ),
          }),
        ),
    }),
    [state, editConfig],
  );

  return (
    <PurchaseOrderEditFormContext.Provider value={value}>
      {children}
    </PurchaseOrderEditFormContext.Provider>
  );
}

export function usePurchaseOrderEditForm() {
  const context = useContext(PurchaseOrderEditFormContext);
  if (!context) {
    throw new Error(
      "usePurchaseOrderEditForm must be used within PurchaseOrderEditFormProvider",
    );
  }
  return context;
}

// re-export form state type for edit sections
export type { PurchaseOrderFormState } from "../create/types/types";
export { createPurchaseOrderFormState };
