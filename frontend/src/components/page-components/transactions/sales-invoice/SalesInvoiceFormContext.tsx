import { createContext, useContext, useMemo, useState } from "react";
import type { SalesOrder } from "../../../../app/api/salesOrderApi";
import {
  createEmptySalesInvoiceAddition,
  createEmptySalesInvoiceLine,
  createSalesInvoiceFormState,
  loadSalesInvoiceDraft,
  recalculateSalesInvoiceState,
  SalesInvoiceAdditionState,
  SalesInvoiceCustomerInformationState,
  SalesInvoiceDocumentState,
  SalesInvoiceFinancialDetailsState,
  SalesInvoiceFooterState,
  SalesInvoiceFormState,
  SalesInvoiceGeneralState,
  SalesInvoiceLineState,
  SalesInvoiceSourceReferenceState,
} from "./types/types";

type SalesInvoiceFormContextValue = {
  state: SalesInvoiceFormState;
  setSourceRef: (patch: Partial<SalesInvoiceSourceReferenceState>) => void;
  setDocument: (patch: Partial<SalesInvoiceDocumentState>) => void;
  setCustomerInformation: (
    patch: Partial<SalesInvoiceCustomerInformationState>,
  ) => void;
  setFinancialDetails: (
    patch: Partial<SalesInvoiceFinancialDetailsState>,
  ) => void;
  setGeneral: (patch: Partial<SalesInvoiceGeneralState>) => void;
  setFooter: (patch: Partial<SalesInvoiceFooterState>) => void;
  updateLine: (rowId: string, patch: Partial<SalesInvoiceLineState>) => void;
  addLine: () => void;
  removeLine: (rowId: string) => void;
  updateAddition: (
    rowId: string,
    patch: Partial<SalesInvoiceAdditionState>,
  ) => void;
  addAddition: () => void;
  removeAddition: (rowId: string) => void;
  hydrateFromSalesOrder: (salesOrder: SalesOrder) => void;
  reset: () => void;
};

const SalesInvoiceFormContext = createContext<
  SalesInvoiceFormContextValue | undefined
>(undefined);

export function SalesInvoiceFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<SalesInvoiceFormState>(() => {
    return loadSalesInvoiceDraft() ?? createSalesInvoiceFormState();
  });

  const value = useMemo<SalesInvoiceFormContextValue>(
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
          recalculateSalesInvoiceState({
            ...current,
            customerInformation: { ...current.customerInformation, ...patch },
          }),
        ),
      setFinancialDetails: (patch) =>
        setState((current) =>
          recalculateSalesInvoiceState({
            ...current,
            financialDetails: { ...current.financialDetails, ...patch },
          }),
        ),
      setGeneral: (patch) =>
        setState((current) =>
          recalculateSalesInvoiceState({
            ...current,
            general: { ...current.general, ...patch },
          }),
        ),
      setFooter: (patch) =>
        setState((current) =>
          recalculateSalesInvoiceState({
            ...current,
            footer: { ...current.footer, ...patch },
          }),
        ),
      updateLine: (rowId, patch) =>
        setState((current) =>
          recalculateSalesInvoiceState({
            ...current,
            items: current.items.map((line) =>
              line.rowId === rowId ? { ...line, ...patch } : line,
            ),
          }),
        ),
      addLine: () =>
        setState((current) =>
          recalculateSalesInvoiceState({
            ...current,
            items: [
              ...current.items,
              createEmptySalesInvoiceLine(current.items.length + 1),
            ],
          }),
        ),
      removeLine: (rowId) =>
        setState((current) =>
          recalculateSalesInvoiceState({
            ...current,
            items:
              current.items.length > 1
                ? current.items.filter((line) => line.rowId !== rowId)
                : [createEmptySalesInvoiceLine(1)],
          }),
        ),
      updateAddition: (rowId, patch) =>
        setState((current) =>
          recalculateSalesInvoiceState({
            ...current,
            additions: current.additions.map((addition) =>
              addition.rowId === rowId ? { ...addition, ...patch } : addition,
            ),
          }),
        ),
      addAddition: () =>
        setState((current) =>
          recalculateSalesInvoiceState({
            ...current,
            additions: [...current.additions, createEmptySalesInvoiceAddition()],
          }),
        ),
      removeAddition: (rowId) =>
        setState((current) =>
          recalculateSalesInvoiceState({
            ...current,
            additions: current.additions.filter(
              (addition) => addition.rowId !== rowId,
            ),
          }),
        ),
      hydrateFromSalesOrder: (salesOrder) =>
        setState((current) =>
          recalculateSalesInvoiceState({
            ...current,
            sourceRef: {
              type: "SalesOrder",
              referenceId: salesOrder.id,
              no: salesOrder.orderDetails.no,
            },
            customerInformation: {
              customerId: salesOrder.partyInformation.customerId,
              customerName: salesOrder.partyInformation.customerNameSnapshot,
              address: salesOrder.partyInformation.address ?? "",
            },
            financialDetails: {
              ...current.financialDetails,
              currencyId: salesOrder.commercialDetails.currencyId,
              currencyCode:
                salesOrder.commercialDetails.currencyCodeSnapshot ?? "",
              currencySymbol:
                salesOrder.commercialDetails.currencySymbolSnapshot ?? "",
            },
            general: {
              ...current.general,
              taxApplication: salesOrder.commercialDetails.taxApplication,
              interState: salesOrder.commercialDetails.isInterState,
            },
            items:
              salesOrder.items.length > 0
                ? salesOrder.items.map((item, index) =>
                    createEmptySalesInvoiceLine(index + 1, {
                      productId: item.productId,
                      productNameSnapshot: item.productNameSnapshot,
                      hsnCode: item.hsnCode ?? "",
                      unitId: item.unitId,
                      unitName: item.unitName,
                      quantity: `${item.quantity}`,
                      rate: `${item.rate}`,
                      discountPercent: `${item.discountPercent}`,
                      taxPercent: `${item.taxPercent}`,
                      warehouseId: item.warehouseId,
                      warehouseName: item.warehouseName ?? "",
                    }),
                  )
                : current.items,
          }),
        ),
      reset: () => setState(createSalesInvoiceFormState()),
    }),
    [state],
  );

  return (
    <SalesInvoiceFormContext.Provider value={value}>
      {children}
    </SalesInvoiceFormContext.Provider>
  );
}

export function useSalesInvoiceForm() {
  const context = useContext(SalesInvoiceFormContext);
  if (!context) {
    throw new Error(
      "useSalesInvoiceForm must be used within SalesInvoiceFormProvider",
    );
  }

  return context;
}
