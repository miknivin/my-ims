import { createContext, useContext, useMemo, useState } from "react";
import type { PurchaseOrder } from "../../../../app/api/purchaseOrderApi";
import {
  createEmptyPurchaseInvoiceAddition,
  createEmptyPurchaseInvoiceLine,
  createPurchaseInvoiceFormState,
  loadPurchaseInvoiceDraft,
  PurchaseInvoiceAdditionState,
  PurchaseInvoiceDocumentState,
  PurchaseInvoiceFinancialDetailsState,
  PurchaseInvoiceFooterState,
  PurchaseInvoiceFormState,
  PurchaseInvoiceGeneralState,
  PurchaseInvoiceLineState,
  PurchaseInvoiceProductInformationState,
  PurchaseInvoiceSourceReferenceState,
  PurchaseInvoiceVendorInformationState,
  recalculatePurchaseInvoiceState,
} from "./types/types";

type PurchaseInvoiceFormContextValue = {
  state: PurchaseInvoiceFormState;
  setSourceRef: (patch: Partial<PurchaseInvoiceSourceReferenceState>) => void;
  setDocument: (patch: Partial<PurchaseInvoiceDocumentState>) => void;
  setVendorInformation: (
    patch: Partial<PurchaseInvoiceVendorInformationState>,
  ) => void;
  setFinancialDetails: (
    patch: Partial<PurchaseInvoiceFinancialDetailsState>,
  ) => void;
  setProductInformation: (
    patch: Partial<PurchaseInvoiceProductInformationState>,
  ) => void;
  setGeneral: (patch: Partial<PurchaseInvoiceGeneralState>) => void;
  setFooter: (patch: Partial<PurchaseInvoiceFooterState>) => void;
  updateLine: (rowId: string, patch: Partial<PurchaseInvoiceLineState>) => void;
  addLine: () => void;
  removeLine: (rowId: string) => void;
  updateAddition: (
    rowId: string,
    patch: Partial<PurchaseInvoiceAdditionState>,
  ) => void;
  addAddition: () => void;
  removeAddition: (rowId: string) => void;
  hydrateFromPurchaseOrder: (purchaseOrder: PurchaseOrder) => void;
  reset: () => void;
};

const PurchaseInvoiceFormContext = createContext<
  PurchaseInvoiceFormContextValue | undefined
>(undefined);

export function PurchaseInvoiceFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<PurchaseInvoiceFormState>(() => {
    return loadPurchaseInvoiceDraft() ?? createPurchaseInvoiceFormState();
  });

  const value = useMemo<PurchaseInvoiceFormContextValue>(
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
      setVendorInformation: (patch) =>
        setState((current) =>
          recalculatePurchaseInvoiceState({
            ...current,
            vendorInformation: { ...current.vendorInformation, ...patch },
          }),
        ),
      setFinancialDetails: (patch) =>
        setState((current) =>
          recalculatePurchaseInvoiceState({
            ...current,
            financialDetails: { ...current.financialDetails, ...patch },
          }),
        ),
      setProductInformation: (patch) =>
        setState((current) => ({
          ...current,
          productInformation: { ...current.productInformation, ...patch },
        })),
      setGeneral: (patch) =>
        setState((current) =>
          recalculatePurchaseInvoiceState({
            ...current,
            general: { ...current.general, ...patch },
          }),
        ),
      setFooter: (patch) =>
        setState((current) =>
          recalculatePurchaseInvoiceState({
            ...current,
            footer: { ...current.footer, ...patch },
          }),
        ),
      updateLine: (rowId, patch) =>
        setState((current) =>
          recalculatePurchaseInvoiceState({
            ...current,
            items: current.items.map((line) =>
              line.rowId === rowId ? { ...line, ...patch } : line,
            ),
          }),
        ),
      addLine: () =>
        setState((current) =>
          recalculatePurchaseInvoiceState({
            ...current,
            items: [
              ...current.items,
              createEmptyPurchaseInvoiceLine(current.items.length + 1),
            ],
          }),
        ),
      removeLine: (rowId) =>
        setState((current) =>
          recalculatePurchaseInvoiceState({
            ...current,
            items:
              current.items.length > 1
                ? current.items.filter((line) => line.rowId !== rowId)
                : [createEmptyPurchaseInvoiceLine(1)],
          }),
        ),
      updateAddition: (rowId, patch) =>
        setState((current) =>
          recalculatePurchaseInvoiceState({
            ...current,
            additions: current.additions.map((addition) =>
              addition.rowId === rowId ? { ...addition, ...patch } : addition,
            ),
          }),
        ),
      addAddition: () =>
        setState((current) =>
          recalculatePurchaseInvoiceState({
            ...current,
            additions: [...current.additions, createEmptyPurchaseInvoiceAddition()],
          }),
        ),
      removeAddition: (rowId) =>
        setState((current) =>
          recalculatePurchaseInvoiceState({
            ...current,
            additions: current.additions.filter(
              (addition) => addition.rowId !== rowId,
            ),
          }),
        ),
      hydrateFromPurchaseOrder: (purchaseOrder) =>
        setState((current) =>
          recalculatePurchaseInvoiceState({
            ...current,
            sourceRef: {
              type: "PurchaseOrder",
              referenceId: purchaseOrder.id,
              no: purchaseOrder.orderDetails.no,
            },
            vendorInformation: {
              vendorId: purchaseOrder.vendorInformation.vendorId,
              vendorLabel: purchaseOrder.vendorInformation.vendorNameSnapshot,
              address: purchaseOrder.vendorInformation.address,
              attention: purchaseOrder.vendorInformation.attention ?? "",
              phone: purchaseOrder.vendorInformation.phone ?? "",
            },
            financialDetails: {
              ...current.financialDetails,
              paymentMode: purchaseOrder.financialDetails.paymentMode as
                | "Cash"
                | "Credit",
              currencyId: purchaseOrder.financialDetails.currencyId,
              currencyCode:
                purchaseOrder.financialDetails.currencyLabelSnapshot ?? "",
            },
            productInformation: {
              vendorProducts: purchaseOrder.productInformation.vendorProducts,
              ownProductsOnly: purchaseOrder.productInformation.ownProductsOnly,
            },
            items:
              purchaseOrder.items.length > 0
                ? purchaseOrder.items.map((item, index) =>
                    createEmptyPurchaseInvoiceLine(index + 1, {
                      productId: item.itemId,
                      productNameSnapshot: item.itemNameSnapshot,
                      hsnCode: item.hsnCode ?? "",
                      unitId: item.unitId,
                      unitName: item.unitName,
                      quantity: `${item.quantity}`,
                      foc: "0",
                      rate: `${item.rate}`,
                      discountPercent:
                        item.discountType === "percentage"
                          ? `${item.discountValue}`
                          : item.grossAmount > 0
                            ? `${(item.discountAmount / item.grossAmount) * 100}`
                            : "0",
                      taxPercent: `${item.cgstRate + item.sgstRate + item.igstRate}`,
                      sellingRate: `${item.rate}`,
                      wholesaleRate: `${item.rate}`,
                      mrp: `${item.rate}`,
                      warehouseId: item.warehouseId,
                      warehouseName: item.warehouseName ?? "",
                    }),
                  )
                : current.items,
          }),
        ),
      reset: () => setState(createPurchaseInvoiceFormState()),
    }),
    [state],
  );

  return (
    <PurchaseInvoiceFormContext.Provider value={value}>
      {children}
    </PurchaseInvoiceFormContext.Provider>
  );
}

export function usePurchaseInvoiceForm() {
  const context = useContext(PurchaseInvoiceFormContext);
  if (!context) {
    throw new Error(
      "usePurchaseInvoiceForm must be used within PurchaseInvoiceFormProvider",
    );
  }

  return context;
}
