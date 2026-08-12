import { createContext, useContext, useMemo, useState } from "react";
import type { SalesOrder } from "@/redux/api/salesOrderApi";
import {
  createDeliveryNoteFormState,
  createEmptyDeliveryNoteLine,
  DeliveryNoteCustomerInformationState,
  DeliveryNoteDocumentState,
  DeliveryNoteFooterState,
  DeliveryNoteFormState,
  DeliveryNoteGeneralState,
  DeliveryNoteLineState,
  DeliveryNoteLogisticsState,
  DeliveryNoteSourceReferenceState,
  hydrateFromSalesOrder,
  loadDeliveryNoteDraft,
  recalculateDeliveryNoteState,
} from "./types/types";

type DeliveryNoteFormContextValue = {
  state: DeliveryNoteFormState;
  setSourceRef: (patch: Partial<DeliveryNoteSourceReferenceState>) => void;
  setDocument: (patch: Partial<DeliveryNoteDocumentState>) => void;
  setCustomerInformation: (patch: Partial<DeliveryNoteCustomerInformationState>) => void;
  setLogistics: (patch: Partial<DeliveryNoteLogisticsState>) => void;
  setGeneral: (patch: Partial<DeliveryNoteGeneralState>) => void;
  setFooter: (patch: Partial<DeliveryNoteFooterState>) => void;
  updateLine: (rowId: string, patch: Partial<DeliveryNoteLineState>) => void;
  addLine: () => void;
  removeLine: (rowId: string) => void;
  hydrateFromSalesOrderFn: (salesOrder: SalesOrder) => void;
  reset: () => void;
};

const DeliveryNoteFormContext = createContext<
  DeliveryNoteFormContextValue | undefined
>(undefined);

export function DeliveryNoteFormProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: DeliveryNoteFormState;
}) {
  const [state, setState] = useState<DeliveryNoteFormState>(
    () => initialState ?? loadDeliveryNoteDraft() ?? createDeliveryNoteFormState(),
  );

  const value = useMemo<DeliveryNoteFormContextValue>(
    () => ({
      state,
      setSourceRef: (patch) =>
        setState((current) => ({
          ...current,
          sourceRef: { ...current.sourceRef, ...patch },
        })),
      setDocument: (patch) =>
        setState((current) => ({
          ...current,
          document: { ...current.document, ...patch },
        })),
      setCustomerInformation: (patch) =>
        setState((current) =>
          recalculateDeliveryNoteState({
            ...current,
            customerInformation: { ...current.customerInformation, ...patch },
          }),
        ),
      setLogistics: (patch) =>
        setState((current) => ({
          ...current,
          logistics: { ...current.logistics, ...patch },
        })),
      setGeneral: (patch) =>
        setState((current) => ({
          ...current,
          general: { ...current.general, ...patch },
        })),
      setFooter: (patch) =>
        setState((current) =>
          recalculateDeliveryNoteState({
            ...current,
            footer: { ...current.footer, ...patch },
          }),
        ),
      updateLine: (rowId, patch) =>
        setState((current) =>
          recalculateDeliveryNoteState({
            ...current,
            items: current.items.map((line) =>
              line.rowId === rowId ? { ...line, ...patch } : line,
            ),
          }),
        ),
      addLine: () =>
        setState((current) =>
          recalculateDeliveryNoteState({
            ...current,
            items: [
              ...current.items,
              createEmptyDeliveryNoteLine(current.items.length + 1),
            ],
          }),
        ),
      removeLine: (rowId) =>
        setState((current) =>
          recalculateDeliveryNoteState({
            ...current,
            items:
              current.items.length > 1
                ? current.items.filter((line) => line.rowId !== rowId)
                : [createEmptyDeliveryNoteLine(1)],
          }),
        ),
      hydrateFromSalesOrderFn: (salesOrder) =>
        setState((current) => hydrateFromSalesOrder(current, salesOrder)),
      reset: () => setState(createDeliveryNoteFormState()),
    }),
    [state],
  );

  return (
    <DeliveryNoteFormContext.Provider value={value}>
      {children}
    </DeliveryNoteFormContext.Provider>
  );
}

export function useDeliveryNoteForm() {
  const context = useContext(DeliveryNoteFormContext);
  if (!context) {
    throw new Error(
      "useDeliveryNoteForm must be used within DeliveryNoteFormProvider",
    );
  }
  return context;
}
