import { createContext, useContext, useMemo, useState } from "react";
import {
  createEmptyPurchaseOrderAddition,
  createEmptyPurchaseOrderLine,
  createPurchaseOrderFormState,
  loadPurchaseOrderDraft,
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
} from "./types/types";

type PurchaseOrderFormContextValue = {
  state: PurchaseOrderFormState;
  setOrderDetails: (patch: Partial<PurchaseOrderOrderDetailsState>) => void;
  setVendorInformation: (
    patch: Partial<PurchaseOrderVendorInformationState>,
  ) => void;
  setFinancialDetails: (
    patch: Partial<PurchaseOrderFinancialDetailsState>,
  ) => void;
  setDeliveryInformation: (
    patch: Partial<PurchaseOrderDeliveryInformationState>,
  ) => void;
  setProductInformation: (
    patch: Partial<PurchaseOrderProductInformationState>,
  ) => void;
  setFooter: (patch: Partial<PurchaseOrderFooterState>) => void;
  updateLine: (rowId: string, patch: Partial<PurchaseOrderLineState>) => void;
  addLine: () => void;
  removeLine: (rowId: string) => void;
  updateAddition: (
    rowId: string,
    patch: Partial<PurchaseOrderAdditionState>,
  ) => void;
  addAddition: () => void;
  removeAddition: (rowId: string) => void;
  reset: () => void;
};

const PurchaseOrderFormContext = createContext<
  PurchaseOrderFormContextValue | undefined
>(undefined);

export function PurchaseOrderFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<PurchaseOrderFormState>(() => {
    return loadPurchaseOrderDraft() ?? createPurchaseOrderFormState();
  });

  const value = useMemo<PurchaseOrderFormContextValue>(
    () => ({
      state,
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
      reset: () => setState(createPurchaseOrderFormState()),
    }),
    [state],
  );

  return (
    <PurchaseOrderFormContext.Provider value={value}>
      {children}
    </PurchaseOrderFormContext.Provider>
  );
}

export function usePurchaseOrderForm() {
  const context = useContext(PurchaseOrderFormContext);
  if (!context) {
    throw new Error(
      "usePurchaseOrderForm must be used within PurchaseOrderFormProvider",
    );
  }

  return context;
}
