import type { PurchaseInvoiceAiDraft } from "../../../../../app/api/purchaseInvoiceAiApi";

export interface PurchaseInvoiceAiVendorMatchResult {
  sourceName: string;
  matchedVendorId: string | null;
  isMatched: boolean;
}

export interface PurchaseInvoiceAiLineItemMatchResult {
  rowIndex: number;
  sourceProductName: string;
  sourceUomName: string;
  matchedProductId: string | null;
  matchedUomId: string | null;
  isProductMatched: boolean;
  isUomMatched: boolean;
}

export interface PurchaseInvoiceAiStepperStep {
  kind: "vendor" | "product" | "uom";
  title: string;
  description: string;
  rowIndex?: number;
  sourceName: string;
}

export interface PurchaseInvoiceAiMasterMatchSummary {
  vendor: PurchaseInvoiceAiVendorMatchResult;
  items: PurchaseInvoiceAiLineItemMatchResult[];
  missingSteps: PurchaseInvoiceAiStepperStep[];
  hasMissingMasters: boolean;
}

interface PurchaseInvoiceAiMasterMatchRequest {
  vendorName: string;
  items: Array<{
    rowIndex: number;
    productName: string;
    uomName: string;
  }>;
}

interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
}

export class PurchaseInvoiceAiMasterMatcher {
  static async analyzeDraft(
    draft: PurchaseInvoiceAiDraft,
  ): Promise<PurchaseInvoiceAiMasterMatchSummary> {
    const requestBody: PurchaseInvoiceAiMasterMatchRequest = {
      vendorName: draft.vendorInformation.vendorLabel,
      items: draft.items.map((item, index) => ({
        rowIndex: index,
        productName: item.productNameSnapshot,
        uomName: item.unitName,
      })),
    };

    const response = await fetch("/api/transactions/purchase-invoice-ai/master-match", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const payload = (await response.json()) as ApiResponse<PurchaseInvoiceAiMasterMatchSummary>;

    if (!response.ok || !payload.success) {
      throw new Error(payload.message || "Purchase invoice master match failed.");
    }

    return payload.data;
  }
}
