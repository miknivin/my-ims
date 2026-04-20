import { createContext, useContext, useMemo, useState } from "react";
import type { SalesInvoice } from "../../../../app/api/salesInvoiceApi";
import {
  createEmptySalesAdjustmentNoteAddition,
  createSalesAdjustmentNoteFormState,
  getSalesAdjustmentInventoryEffectLabel,
  loadSalesAdjustmentNoteDraft,
  recalculateSalesAdjustmentNoteState,
  SalesAdjustmentNoteAdditionState,
  SalesAdjustmentNoteConfig,
  SALES_ADJUSTMENT_NOTE_CONFIG,
  SalesAdjustmentNoteCustomerInformationState,
  SalesAdjustmentNoteDocumentState,
  SalesAdjustmentNoteFinancialDetailsState,
  SalesAdjustmentNoteFooterState,
  SalesAdjustmentNoteFormState,
  SalesAdjustmentNoteGeneralState,
  SalesAdjustmentNoteLineState,
  SalesAdjustmentNoteNature,
  SalesAdjustmentNoteSourceReferenceState,
  SalesAdjustmentNoteVariant,
  createEmptySalesAdjustmentNoteLine,
} from "./types/types";

type SalesAdjustmentNoteFormContextValue = {
  variant: SalesAdjustmentNoteVariant;
  config: SalesAdjustmentNoteConfig;
  inventoryEffectLabel: string;
  state: SalesAdjustmentNoteFormState;
  setNoteNature: (value: SalesAdjustmentNoteNature) => void;
  setSourceRef: (
    patch: Partial<SalesAdjustmentNoteSourceReferenceState>,
  ) => void;
  setDocument: (patch: Partial<SalesAdjustmentNoteDocumentState>) => void;
  setCustomerInformation: (
    patch: Partial<SalesAdjustmentNoteCustomerInformationState>,
  ) => void;
  setFinancialDetails: (
    patch: Partial<SalesAdjustmentNoteFinancialDetailsState>,
  ) => void;
  setGeneral: (patch: Partial<SalesAdjustmentNoteGeneralState>) => void;
  setFooter: (patch: Partial<SalesAdjustmentNoteFooterState>) => void;
  updateLine: (
    rowId: string,
    patch: Partial<SalesAdjustmentNoteLineState>,
  ) => void;
  removeLine: (rowId: string) => void;
  updateAddition: (
    rowId: string,
    patch: Partial<SalesAdjustmentNoteAdditionState>,
  ) => void;
  addAddition: () => void;
  removeAddition: (rowId: string) => void;
  clearSourceInvoiceSelection: () => void;
  hydrateFromSalesInvoice: (salesInvoice: SalesInvoice) => void;
  reset: () => void;
};

const SalesAdjustmentNoteFormContext = createContext<
  SalesAdjustmentNoteFormContextValue | undefined
>(undefined);

export function SalesAdjustmentNoteFormProvider({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: SalesAdjustmentNoteVariant;
}) {
  const config = SALES_ADJUSTMENT_NOTE_CONFIG[variant];
  const [state, setState] = useState<SalesAdjustmentNoteFormState>(() => {
    return (
      loadSalesAdjustmentNoteDraft(variant) ??
      createSalesAdjustmentNoteFormState(variant)
    );
  });

  const value = useMemo<SalesAdjustmentNoteFormContextValue>(
    () => ({
      variant,
      config,
      inventoryEffectLabel: getSalesAdjustmentInventoryEffectLabel(
        variant,
        state.noteNature,
      ),
      state,
      setNoteNature: (value) =>
        setState((current) =>
          recalculateSalesAdjustmentNoteState({
            ...current,
            noteNature: value,
          }),
        ),
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
          recalculateSalesAdjustmentNoteState({
            ...current,
            customerInformation: {
              ...current.customerInformation,
              ...patch,
            },
          }),
        ),
      setFinancialDetails: (patch) =>
        setState((current) =>
          recalculateSalesAdjustmentNoteState({
            ...current,
            financialDetails: {
              ...current.financialDetails,
              ...patch,
            },
          }),
        ),
      setGeneral: (patch) =>
        setState((current) =>
          recalculateSalesAdjustmentNoteState({
            ...current,
            general: { ...current.general, ...patch },
          }),
        ),
      setFooter: (patch) =>
        setState((current) =>
          recalculateSalesAdjustmentNoteState({
            ...current,
            footer: { ...current.footer, ...patch },
          }),
        ),
      updateLine: (rowId, patch) =>
        setState((current) =>
          recalculateSalesAdjustmentNoteState({
            ...current,
            items: current.items.map((line) =>
              line.rowId === rowId ? { ...line, ...patch } : line,
            ),
          }),
        ),
      removeLine: (rowId) =>
        setState((current) =>
          recalculateSalesAdjustmentNoteState({
            ...current,
            items: current.items.filter((line) => line.rowId !== rowId),
          }),
        ),
      updateAddition: (rowId, patch) =>
        setState((current) =>
          recalculateSalesAdjustmentNoteState({
            ...current,
            additions: current.additions.map((addition) =>
              addition.rowId === rowId ? { ...addition, ...patch } : addition,
            ),
          }),
        ),
      addAddition: () =>
        setState((current) =>
          recalculateSalesAdjustmentNoteState({
            ...current,
            additions: [
              ...current.additions,
              createEmptySalesAdjustmentNoteAddition(),
            ],
          }),
        ),
      removeAddition: (rowId) =>
        setState((current) =>
          recalculateSalesAdjustmentNoteState({
            ...current,
            additions: current.additions.filter(
              (addition) => addition.rowId !== rowId,
            ),
          }),
        ),
      clearSourceInvoiceSelection: () =>
        setState((current) =>
          recalculateSalesAdjustmentNoteState({
            ...current,
            sourceRef: {
              referenceId: null,
              referenceNo: "",
            },
            customerInformation: {
              customerId: null,
              customerName: "",
              address: "",
            },
            items: [],
          }),
        ),
      hydrateFromSalesInvoice: (salesInvoice) =>
        setState((current) =>
          recalculateSalesAdjustmentNoteState({
            ...current,
            sourceRef: {
              referenceId: salesInvoice.id,
              referenceNo: salesInvoice.document.no,
            },
            customerInformation: {
              customerId: salesInvoice.customerInformation.customerId,
              customerName:
                salesInvoice.customerInformation.customerNameSnapshot,
              address: salesInvoice.customerInformation.address,
            },
            financialDetails: {
              ...current.financialDetails,
              paymentMode: salesInvoice.financialDetails.paymentMode,
              invoiceNo: salesInvoice.financialDetails.invoiceNo ?? "",
              lrNo: salesInvoice.financialDetails.lrNo ?? "",
              currencyId: salesInvoice.financialDetails.currencyId,
              currencyCode:
                salesInvoice.financialDetails.currencyCodeSnapshot ?? "",
              currencySymbol:
                salesInvoice.financialDetails.currencySymbolSnapshot ?? "",
            },
            general: {
              ...current.general,
              taxable: salesInvoice.general.taxable,
              taxApplication: salesInvoice.general.taxApplication,
              interState: salesInvoice.general.interState,
            },
            items:
              salesInvoice.items.length > 0
                ? salesInvoice.items.map((item, index) =>
                    createEmptySalesAdjustmentNoteLine(index + 1, {
                      sourceLineId: item.id,
                      productId: item.productId,
                      productCodeSnapshot: item.productCodeSnapshot ?? "",
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
                : [
                    createEmptySalesAdjustmentNoteLine(1, {
                      sourceLineId: null,
                    }),
                  ],
          }),
        ),
      reset: () => setState(createSalesAdjustmentNoteFormState(variant)),
    }),
    [config, state, variant],
  );

  return (
    <SalesAdjustmentNoteFormContext.Provider value={value}>
      {children}
    </SalesAdjustmentNoteFormContext.Provider>
  );
}

export function useSalesAdjustmentNoteForm() {
  const context = useContext(SalesAdjustmentNoteFormContext);
  if (!context) {
    throw new Error(
      "useSalesAdjustmentNoteForm must be used within SalesAdjustmentNoteFormProvider",
    );
  }

  return context;
}
