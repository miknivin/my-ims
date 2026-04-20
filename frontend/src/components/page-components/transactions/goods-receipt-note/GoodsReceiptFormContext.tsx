import { createContext, useContext, useMemo, useState } from "react";
import type { PurchaseOrder } from "../../../../app/api/purchaseOrderApi";
import {
  createEmptyGoodsReceiptLine,
  createGoodsReceiptFormState,
  GoodsReceiptDocumentState,
  GoodsReceiptFooterState,
  GoodsReceiptFormState,
  GoodsReceiptGeneralState,
  GoodsReceiptLineState,
  GoodsReceiptLogisticsState,
  GoodsReceiptSourceReferenceState,
  GoodsReceiptVendorInformationState,
  loadGoodsReceiptDraft,
  recalculateGoodsReceiptState,
} from "./types/types";

type GoodsReceiptFormContextValue = {
  state: GoodsReceiptFormState;
  setSourceRef: (patch: Partial<GoodsReceiptSourceReferenceState>) => void;
  setDocument: (patch: Partial<GoodsReceiptDocumentState>) => void;
  setVendorInformation: (
    patch: Partial<GoodsReceiptVendorInformationState>,
  ) => void;
  setLogistics: (patch: Partial<GoodsReceiptLogisticsState>) => void;
  setGeneral: (patch: Partial<GoodsReceiptGeneralState>) => void;
  setFooter: (patch: Partial<GoodsReceiptFooterState>) => void;
  updateLine: (rowId: string, patch: Partial<GoodsReceiptLineState>) => void;
  addLine: () => void;
  removeLine: (rowId: string) => void;
  hydrateFromPurchaseOrder: (purchaseOrder: PurchaseOrder) => void;
  reset: () => void;
};

const GoodsReceiptFormContext = createContext<
  GoodsReceiptFormContextValue | undefined
>(undefined);

export function GoodsReceiptFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<GoodsReceiptFormState>(() => {
    return loadGoodsReceiptDraft() ?? createGoodsReceiptFormState();
  });

  const value = useMemo<GoodsReceiptFormContextValue>(
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
          recalculateGoodsReceiptState({
            ...current,
            vendorInformation: { ...current.vendorInformation, ...patch },
          }),
        ),
      setLogistics: (patch) =>
        setState((current) => ({
          ...current,
          logistics: { ...current.logistics, ...patch },
        })),
      setGeneral: (patch) =>
        setState((current) =>
          recalculateGoodsReceiptState({
            ...current,
            general: { ...current.general, ...patch },
          }),
        ),
      setFooter: (patch) =>
        setState((current) =>
          recalculateGoodsReceiptState({
            ...current,
            footer: { ...current.footer, ...patch },
          }),
        ),
      updateLine: (rowId, patch) =>
        setState((current) =>
          recalculateGoodsReceiptState({
            ...current,
            items: current.items.map((line) =>
              line.rowId === rowId ? { ...line, ...patch } : line,
            ),
          }),
        ),
      addLine: () =>
        setState((current) =>
          recalculateGoodsReceiptState({
            ...current,
            items: [
              ...current.items,
              createEmptyGoodsReceiptLine(current.items.length + 1),
            ],
          }),
        ),
      removeLine: (rowId) =>
        setState((current) =>
          recalculateGoodsReceiptState({
            ...current,
            items:
              current.items.length > 1
                ? current.items.filter((line) => line.rowId !== rowId)
                : [createEmptyGoodsReceiptLine(1)],
          }),
        ),
      hydrateFromPurchaseOrder: (purchaseOrder) =>
        setState((current) => {
          const remainingLines = purchaseOrder.items
            .map((item) => {
              const remainingQty = Math.max(item.quantity - item.receivedQty, 0);
              return {
                item,
                remainingQty,
              };
            })
            .filter((entry) => entry.remainingQty > 0);

          return recalculateGoodsReceiptState({
            ...current,
            sourceRef: {
              mode: "AgainstPurchaseOrder",
              purchaseOrderId: purchaseOrder.id,
              purchaseOrderNo: purchaseOrder.orderDetails.no,
              directLpoNo: "",
              directVendorInvoiceNo: "",
            },
            vendorInformation: {
              vendorId: purchaseOrder.vendorInformation.vendorId,
              vendorLabel: purchaseOrder.vendorInformation.vendorNameSnapshot,
              address: purchaseOrder.vendorInformation.address,
              attention: purchaseOrder.vendorInformation.attention ?? "",
              phone: purchaseOrder.vendorInformation.phone ?? "",
            },
            general: {
              ...current.general,
              ownProductsOnly: purchaseOrder.productInformation.ownProductsOnly,
            },
            items:
              remainingLines.length > 0
                ? remainingLines.map(({ item, remainingQty }, index) =>
                    createEmptyGoodsReceiptLine(index + 1, {
                      productId: item.itemId,
                      productNameSnapshot: item.itemNameSnapshot,
                      hsnCode: item.hsnCode ?? "",
                      unitId: item.unitId,
                      unitName: item.unitName,
                      quantity: `${remainingQty}`,
                      rate: `${item.rate}`,
                      discountPercent:
                        item.discountType === "percentage"
                          ? `${item.discountValue}`
                          : item.grossAmount > 0
                            ? `${(item.discountAmount / item.grossAmount) * 100}`
                            : "0",
                      warehouseId:
                        item.warehouseId ??
                        purchaseOrder.deliveryInformation.warehouseId,
                      warehouseName:
                        item.warehouseName ??
                        purchaseOrder.deliveryInformation.warehouseNameSnapshot ??
                        "",
                      purchaseOrderLineId: item.id,
                    }),
                  )
                : current.items,
          });
        }),
      reset: () => setState(createGoodsReceiptFormState()),
    }),
    [state],
  );

  return (
    <GoodsReceiptFormContext.Provider value={value}>
      {children}
    </GoodsReceiptFormContext.Provider>
  );
}

export function useGoodsReceiptForm() {
  const context = useContext(GoodsReceiptFormContext);
  if (!context) {
    throw new Error(
      "useGoodsReceiptForm must be used within GoodsReceiptFormProvider",
    );
  }

  return context;
}
