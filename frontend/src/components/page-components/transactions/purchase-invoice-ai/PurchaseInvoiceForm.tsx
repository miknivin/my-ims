import { FormEvent, useMemo, useState } from "react";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router";
import { PurchaseInvoiceAiMappingResult } from "../../../../app/api/purchaseInvoiceAiApi";
import { useCreatePurchaseInvoiceMutation } from "../../../../app/api/purchaseInvoiceApi";
import TransactionHeaderGrid from "../shared/TransactionHeaderGrid";
import TransactionStickyActionBar from "../shared/TransactionStickyActionBar";
import LineItemsSection from "./LineItemsSection";
import {
  PurchaseInvoiceFormProvider,
  usePurchaseInvoiceForm,
} from "./PurchaseInvoiceFormContext";
import SummaryFooterSection from "./SummaryFooterSection";
import {
  clearPurchaseInvoiceAiDraft,
  toPurchaseInvoicePayload,
} from "./types/types";
import type { PurchaseInvoiceFormState } from "./types/types";
import FinancialDetailsSection from "./sections/FinancialDetailsSection";
import OrderDetailsSection from "./sections/OrderDetailsSection";
import ProcurementSection from "./sections/ProcurementSection";
import VendorInformationSection from "./sections/VendorInformationSection";

function getMutationErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
) {
  if (!error) {
    return "Unable to save the purchase invoice.";
  }

  if ("status" in error) {
    const errorData = error.data as { message?: string } | undefined;
    return errorData?.message ?? "Unable to save the purchase invoice.";
  }

  return error.message ?? "Unable to save the purchase invoice.";
}

function AiSummaryBanner({
  aiMapping,
}: {
  aiMapping?: PurchaseInvoiceAiMappingResult | null;
}) {
  if (!aiMapping) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-300">
        Open this page from <span className="font-medium">Add with AI</span> to
        upload a purchase invoice PDF and prefill the form automatically.
      </div>
    );
  }

  const totalsMessage =
    aiMapping.declaredTotals.netTotal !== null &&
    aiMapping.declaredTotals.computedNetTotal !== null
      ? `Declared net total: ${aiMapping.declaredTotals.netTotal.toFixed(
          2,
        )} | Computed net total: ${aiMapping.declaredTotals.computedNetTotal.toFixed(
          2,
        )}`
      : null;

  return (
    <div className="space-y-3 rounded-2xl border border-brand-200 bg-brand-50/70 px-4 py-4 text-sm text-brand-900 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-100">
      <div className="font-medium">AI draft loaded. Please review before saving.</div>
      {totalsMessage ? <div>{totalsMessage}</div> : null}
      {aiMapping.unresolvedFields.length > 0 ? (
        <div>
          <div className="font-medium">Needs manual review</div>
          <ul className="mt-1 list-disc pl-5">
            {aiMapping.unresolvedFields.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {aiMapping.warnings.length > 0 ? (
        <div>
          <div className="font-medium">Warnings</div>
          <ul className="mt-1 list-disc pl-5">
            {aiMapping.warnings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function PurchaseInvoiceFormBody({
  aiMapping,
}: {
  aiMapping?: PurchaseInvoiceAiMappingResult | null;
}) {
  const navigate = useNavigate();
  const { state, reset } = usePurchaseInvoiceForm();
  const [createPurchaseInvoice] = useCreatePurchaseInvoiceMutation();
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!state.document.no.trim()) {
      setFormError("Purchase invoice number is required.");
      return;
    }

    if (!state.vendorInformation.vendorId) {
      setFormError("Please select a vendor.");
      return;
    }

    if (state.sourceRef.type !== "Direct" && !state.sourceRef.no.trim()) {
      setFormError("Please choose a source reference or switch to Direct.");
      return;
    }

    const hasValidLine = state.items.some(
      (line) => line.productId && Number.parseFloat(line.quantity) > 0,
    );

    if (!hasValidLine) {
      setFormError("Add at least one line item with a product and quantity.");
      return;
    }

    setIsSaving(true);

    try {
      await createPurchaseInvoice(toPurchaseInvoicePayload(state)).unwrap();
      clearPurchaseInvoiceAiDraft();
      reset();
      navigate("/operations/purchase-invoice");
    } catch (error) {
      setFormError(
        getMutationErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AiSummaryBanner aiMapping={aiMapping} />

      <TransactionHeaderGrid>
        <OrderDetailsSection />
        <VendorInformationSection />
        <FinancialDetailsSection />
        <ProcurementSection />
      </TransactionHeaderGrid>

      <LineItemsSection />
      <SummaryFooterSection />

      {formError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {formError}
        </div>
      ) : null}

      <TransactionStickyActionBar
        isSaving={isSaving}
        primaryLabel="Save Purchase Invoice"
        onReset={() => {
          reset();
          clearPurchaseInvoiceAiDraft();
          setFormError("");
        }}
        onCancel={() => navigate("/operations/purchase-invoice")}
      />
    </form>
  );
}

export default function PurchaseInvoiceForm({
  aiMapping,
}: {
  aiMapping?: PurchaseInvoiceAiMappingResult | null;
}) {
  const initialState = useMemo(
    () =>
      (aiMapping?.draft as unknown as Partial<PurchaseInvoiceFormState> | null) ??
      null,
    [aiMapping],
  );

  return (
    <PurchaseInvoiceFormProvider initialState={initialState}>
      <PurchaseInvoiceFormBody aiMapping={aiMapping} />
    </PurchaseInvoiceFormProvider>
  );
}
