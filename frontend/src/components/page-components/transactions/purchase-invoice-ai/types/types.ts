import { createPurchaseInvoiceFormState } from "../../purchase-invoice/types/types";

export { createPurchaseInvoiceFormState };

export {
  createEmptyPurchaseInvoiceAddition,
  createEmptyPurchaseInvoiceLine,
  recalculatePurchaseInvoiceLine,
  recalculatePurchaseInvoiceState,
  toPurchaseInvoicePayload,
} from "../../purchase-invoice/types/types";

export type {
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
} from "../../purchase-invoice/types/types";

export const PURCHASE_INVOICE_AI_DRAFT_STORAGE_KEY =
  "ims.purchase-invoice-ai.draft";

export function loadPurchaseInvoiceAiDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(PURCHASE_INVOICE_AI_DRAFT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return createPurchaseInvoiceFormState(parsed);
  } catch {
    return null;
  }
}

export function savePurchaseInvoiceAiDraft(value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    PURCHASE_INVOICE_AI_DRAFT_STORAGE_KEY,
    JSON.stringify(value),
  );
}

export function clearPurchaseInvoiceAiDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PURCHASE_INVOICE_AI_DRAFT_STORAGE_KEY);
}
