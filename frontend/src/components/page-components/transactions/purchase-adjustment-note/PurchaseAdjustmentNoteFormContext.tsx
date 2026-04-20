import { createContext, useContext, useMemo, useState } from "react";
import type { PurchaseInvoice } from "../../../../app/api/purchaseInvoiceApi";
import {
  createEmptyPurchaseAdjustmentNoteAddition,
  createEmptyPurchaseAdjustmentNoteLine,
  createPurchaseAdjustmentNoteFormState,
  getPurchaseAdjustmentInventoryEffectLabel,
  loadPurchaseAdjustmentNoteDraft,
  PurchaseAdjustmentNoteAdditionState,
  PurchaseAdjustmentNoteConfig,
  PURCHASE_ADJUSTMENT_NOTE_CONFIG,
  PurchaseAdjustmentNoteDocumentState,
  PurchaseAdjustmentNoteFinancialDetailsState,
  PurchaseAdjustmentNoteFooterState,
  PurchaseAdjustmentNoteFormState,
  PurchaseAdjustmentNoteGeneralState,
  PurchaseAdjustmentNoteLineState,
  PurchaseAdjustmentNoteNature,
  PurchaseAdjustmentNoteProductInformationState,
  PurchaseAdjustmentNoteSourceReferenceState,
  PurchaseAdjustmentNoteVariant,
  PurchaseAdjustmentNoteVendorInformationState,
  recalculatePurchaseAdjustmentNoteState,
} from "./types/types";

type PurchaseAdjustmentNoteFormContextValue = {
  variant: PurchaseAdjustmentNoteVariant;
  config: PurchaseAdjustmentNoteConfig;
  inventoryEffectLabel: string;
  state: PurchaseAdjustmentNoteFormState;
  setNoteNature: (value: PurchaseAdjustmentNoteNature) => void;
  setSourceRef: (
    patch: Partial<PurchaseAdjustmentNoteSourceReferenceState>,
  ) => void;
  setDocument: (patch: Partial<PurchaseAdjustmentNoteDocumentState>) => void;
  setVendorInformation: (
    patch: Partial<PurchaseAdjustmentNoteVendorInformationState>,
  ) => void;
  setFinancialDetails: (
    patch: Partial<PurchaseAdjustmentNoteFinancialDetailsState>,
  ) => void;
  setProductInformation: (
    patch: Partial<PurchaseAdjustmentNoteProductInformationState>,
  ) => void;
  setGeneral: (patch: Partial<PurchaseAdjustmentNoteGeneralState>) => void;
  setFooter: (patch: Partial<PurchaseAdjustmentNoteFooterState>) => void;
  updateLine: (
    rowId: string,
    patch: Partial<PurchaseAdjustmentNoteLineState>,
  ) => void;
  removeLine: (rowId: string) => void;
  updateAddition: (
    rowId: string,
    patch: Partial<PurchaseAdjustmentNoteAdditionState>,
  ) => void;
  addAddition: () => void;
  removeAddition: (rowId: string) => void;
  clearSourceInvoiceSelection: () => void;
  hydrateFromPurchaseInvoice: (purchaseInvoice: PurchaseInvoice) => void;
  reset: () => void;
};

const PurchaseAdjustmentNoteFormContext = createContext<
  PurchaseAdjustmentNoteFormContextValue | undefined
>(undefined);

export function PurchaseAdjustmentNoteFormProvider({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: PurchaseAdjustmentNoteVariant;
}) {
  const config = PURCHASE_ADJUSTMENT_NOTE_CONFIG[variant];
  const [state, setState] = useState<PurchaseAdjustmentNoteFormState>(() => {
    return (
      loadPurchaseAdjustmentNoteDraft(variant) ??
      createPurchaseAdjustmentNoteFormState(variant)
    );
  });

  const value = useMemo<PurchaseAdjustmentNoteFormContextValue>(
    () => ({
      variant,
      config,
      inventoryEffectLabel: getPurchaseAdjustmentInventoryEffectLabel(
        variant,
        state.noteNature,
      ),
      state,
      setNoteNature: (value) =>
        setState((current) =>
          recalculatePurchaseAdjustmentNoteState({
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
      setVendorInformation: (patch) =>
        setState((current) =>
          recalculatePurchaseAdjustmentNoteState({
            ...current,
            vendorInformation: {
              ...current.vendorInformation,
              ...patch,
            },
          }),
        ),
      setFinancialDetails: (patch) =>
        setState((current) =>
          recalculatePurchaseAdjustmentNoteState({
            ...current,
            financialDetails: {
              ...current.financialDetails,
              ...patch,
            },
          }),
        ),
      setProductInformation: (patch) =>
        setState((current) => ({
          ...current,
          productInformation: {
            ...current.productInformation,
            ...patch,
          },
        })),
      setGeneral: (patch) =>
        setState((current) =>
          recalculatePurchaseAdjustmentNoteState({
            ...current,
            general: { ...current.general, ...patch },
          }),
        ),
      setFooter: (patch) =>
        setState((current) =>
          recalculatePurchaseAdjustmentNoteState({
            ...current,
            footer: { ...current.footer, ...patch },
          }),
        ),
      updateLine: (rowId, patch) =>
        setState((current) =>
          recalculatePurchaseAdjustmentNoteState({
            ...current,
            items: current.items.map((line) =>
              line.rowId === rowId ? { ...line, ...patch } : line,
            ),
          }),
        ),
      removeLine: (rowId) =>
        setState((current) =>
          recalculatePurchaseAdjustmentNoteState({
            ...current,
            items: current.items.filter((line) => line.rowId !== rowId),
          }),
        ),
      updateAddition: (rowId, patch) =>
        setState((current) =>
          recalculatePurchaseAdjustmentNoteState({
            ...current,
            additions: current.additions.map((addition) =>
              addition.rowId === rowId ? { ...addition, ...patch } : addition,
            ),
          }),
        ),
      addAddition: () =>
        setState((current) =>
          recalculatePurchaseAdjustmentNoteState({
            ...current,
            additions: [
              ...current.additions,
              createEmptyPurchaseAdjustmentNoteAddition(),
            ],
          }),
        ),
      removeAddition: (rowId) =>
        setState((current) =>
          recalculatePurchaseAdjustmentNoteState({
            ...current,
            additions: current.additions.filter(
              (addition) => addition.rowId !== rowId,
            ),
          }),
        ),
      clearSourceInvoiceSelection: () =>
        setState((current) =>
          recalculatePurchaseAdjustmentNoteState({
            ...current,
            sourceRef: {
              referenceId: null,
              referenceNo: "",
            },
            vendorInformation: {
              vendorId: null,
              vendorLabel: "",
              address: "",
              attention: "",
              phone: "",
            },
            items: [],
          }),
        ),
      hydrateFromPurchaseInvoice: (purchaseInvoice) =>
        setState((current) =>
          recalculatePurchaseAdjustmentNoteState({
            ...current,
            sourceRef: {
              referenceId: purchaseInvoice.id,
              referenceNo: purchaseInvoice.document.no,
            },
            vendorInformation: {
              vendorId: purchaseInvoice.vendorInformation.vendorId,
              vendorLabel: purchaseInvoice.vendorInformation.vendorNameSnapshot,
              address: purchaseInvoice.vendorInformation.address,
              attention: purchaseInvoice.vendorInformation.attention ?? "",
              phone: purchaseInvoice.vendorInformation.phone ?? "",
            },
            financialDetails: {
              ...current.financialDetails,
              paymentMode: purchaseInvoice.financialDetails.paymentMode,
              supplierInvoiceNo:
                purchaseInvoice.financialDetails.supplierInvoiceNo ?? "",
              lrNo: purchaseInvoice.financialDetails.lrNo ?? "",
              currencyId: purchaseInvoice.financialDetails.currencyId,
              currencyCode:
                purchaseInvoice.financialDetails.currencyCodeSnapshot ?? "",
              currencySymbol:
                purchaseInvoice.financialDetails.currencySymbolSnapshot ?? "",
            },
            productInformation: {
              vendorProducts:
                purchaseInvoice.productInformation.vendorProducts,
              ownProductsOnly:
                purchaseInvoice.productInformation.ownProductsOnly,
            },
            general: {
              ...current.general,
              taxable: purchaseInvoice.general.taxable,
              taxApplication: purchaseInvoice.general.taxApplication,
              interState: purchaseInvoice.general.interState,
              taxOnFoc: purchaseInvoice.general.taxOnFoc,
            },
            items:
              purchaseInvoice.items.length > 0
                ? purchaseInvoice.items.map((item, index) =>
                    createEmptyPurchaseAdjustmentNoteLine(index + 1, {
                      sourceLineId: item.id,
                      productId: item.productId,
                      productCodeSnapshot: item.productCodeSnapshot ?? "",
                      productNameSnapshot: item.productNameSnapshot,
                      hsnCode: item.hsnCode ?? "",
                      unitId: item.unitId,
                      unitName: item.unitName,
                      quantity: `${item.quantity}`,
                      foc: `${item.foc}`,
                      rate: `${item.rate}`,
                      discountPercent: `${item.discountPercent}`,
                      taxPercent: `${item.taxPercent}`,
                      sellingRate: `${item.sellingRate}`,
                      wholesaleRate: `${item.wholesaleRate}`,
                      mrp: `${item.mrp}`,
                      warehouseId: item.warehouseId,
                      warehouseName: item.warehouseName ?? "",
                    }),
                  )
                : [],
          }),
        ),
      reset: () => setState(createPurchaseAdjustmentNoteFormState(variant)),
    }),
    [config, state, variant],
  );

  return (
    <PurchaseAdjustmentNoteFormContext.Provider value={value}>
      {children}
    </PurchaseAdjustmentNoteFormContext.Provider>
  );
}

export function usePurchaseAdjustmentNoteForm() {
  const context = useContext(PurchaseAdjustmentNoteFormContext);
  if (!context) {
    throw new Error(
      "usePurchaseAdjustmentNoteForm must be used within PurchaseAdjustmentNoteFormProvider",
    );
  }

  return context;
}
