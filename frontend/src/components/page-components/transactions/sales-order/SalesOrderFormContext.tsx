import { createContext, useContext, useMemo, useState } from "react";
import {
  createEmptySalesOrderAddition,
  createEmptySalesOrderLine,
  createSalesOrderFormState,
  recalculateSalesOrderState,
  SalesOrderAdditionState,
  SalesOrderCommercialDetailsState,
  SalesOrderFooterState,
  SalesOrderFormState,
  SalesOrderLineState,
  SalesOrderOrderDetailsState,
  SalesOrderPartyInformationState,
  SalesOrderSalesDetailsState,
} from "./types/types";

type SalesOrderFormContextValue = {
  state: SalesOrderFormState;
  setOrderDetails: (patch: Partial<SalesOrderOrderDetailsState>) => void;
  setPartyInformation: (patch: Partial<SalesOrderPartyInformationState>) => void;
  setCommercialDetails: (
    patch: Partial<SalesOrderCommercialDetailsState>,
  ) => void;
  setSalesDetails: (patch: Partial<SalesOrderSalesDetailsState>) => void;
  setFooter: (patch: Partial<SalesOrderFooterState>) => void;
  updateLine: (rowId: string, patch: Partial<SalesOrderLineState>) => void;
  addLine: () => void;
  removeLine: (rowId: string) => void;
  updateAddition: (
    rowId: string,
    patch: Partial<SalesOrderAdditionState>,
  ) => void;
  addAddition: () => void;
  removeAddition: (rowId: string) => void;
  reset: () => void;
};

const SalesOrderFormContext = createContext<
  SalesOrderFormContextValue | undefined
>(undefined);

export function SalesOrderFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<SalesOrderFormState>(() =>
    createSalesOrderFormState(),
  );

  const value = useMemo<SalesOrderFormContextValue>(
    () => ({
      state,
      setOrderDetails: (patch) =>
        setState((current) => ({
          ...current,
          orderDetails: { ...current.orderDetails, ...patch },
        })),
      setPartyInformation: (patch) =>
        setState((current) => ({
          ...current,
          partyInformation: { ...current.partyInformation, ...patch },
        })),
      setCommercialDetails: (patch) =>
        setState((current) =>
          recalculateSalesOrderState({
            ...current,
            commercialDetails: { ...current.commercialDetails, ...patch },
          }),
        ),
      setSalesDetails: (patch) =>
        setState((current) => ({
          ...current,
          salesDetails: { ...current.salesDetails, ...patch },
        })),
      setFooter: (patch) =>
        setState((current) =>
          recalculateSalesOrderState({
            ...current,
            footer: { ...current.footer, ...patch },
          }),
        ),
      updateLine: (rowId, patch) =>
        setState((current) =>
          recalculateSalesOrderState({
            ...current,
            items: current.items.map((line) =>
              line.rowId === rowId ? { ...line, ...patch } : line,
            ),
          }),
        ),
      addLine: () =>
        setState((current) =>
          recalculateSalesOrderState({
            ...current,
            items: [
              ...current.items,
              createEmptySalesOrderLine(current.items.length + 1),
            ],
          }),
        ),
      removeLine: (rowId) =>
        setState((current) =>
          recalculateSalesOrderState({
            ...current,
            items:
              current.items.length > 1
                ? current.items.filter((line) => line.rowId !== rowId)
                : [createEmptySalesOrderLine(1)],
          }),
        ),
      updateAddition: (rowId, patch) =>
        setState((current) =>
          recalculateSalesOrderState({
            ...current,
            additions: current.additions.map((addition) =>
              addition.rowId === rowId ? { ...addition, ...patch } : addition,
            ),
          }),
        ),
      addAddition: () =>
        setState((current) =>
          recalculateSalesOrderState({
            ...current,
            additions: [...current.additions, createEmptySalesOrderAddition()],
          }),
        ),
      removeAddition: (rowId) =>
        setState((current) =>
          recalculateSalesOrderState({
            ...current,
            additions: current.additions.filter(
              (addition) => addition.rowId !== rowId,
            ),
          }),
        ),
      reset: () => setState(createSalesOrderFormState()),
    }),
    [state],
  );

  return (
    <SalesOrderFormContext.Provider value={value}>
      {children}
    </SalesOrderFormContext.Provider>
  );
}

export function useSalesOrderForm() {
  const context = useContext(SalesOrderFormContext);
  if (!context) {
    throw new Error("useSalesOrderForm must be used within SalesOrderFormProvider");
  }

  return context;
}
