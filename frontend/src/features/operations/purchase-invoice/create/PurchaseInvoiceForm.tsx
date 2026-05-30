import { FormEvent, useState } from "react";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router";
import { useCreatePurchaseInvoiceMutation } from "@/redux/api/purchaseInvoiceApi";
import ConfirmAlert from "@/shared/components/ui/alert/ConfirmAlert";
import TransactionHeaderGrid from "@/features/operations/shared/TransactionHeaderGrid";
import TransactionStickyActionBar from "@/features/operations/shared/TransactionStickyActionBar";
import LineItemsSection from "./LineItemsSection";
import {
  PurchaseInvoiceFormProvider,
  usePurchaseInvoiceForm,
} from "./PurchaseInvoiceFormContext";
import SummaryFooterSection from "./SummaryFooterSection";
import {
  PURCHASE_INVOICE_DRAFT_STORAGE_KEY,
  toPurchaseInvoicePayload,
} from "./types/types";
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

function PurchaseInvoiceFormBody() {
  const navigate = useNavigate();
  const { state, reset } = usePurchaseInvoiceForm();
  const [createPurchaseInvoice] = useCreatePurchaseInvoiceMutation();
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSubmitAlert, setShowSubmitAlert] = useState(false);

  const validateForm = () => {
    setFormError("");

    if (!state.document.no.trim()) {
      setFormError("Purchase invoice number is required.");
      return false;
    }

    if (!state.vendorInformation.vendorId) {
      setFormError("Please select a vendor.");
      return false;
    }

    if (state.sourceRef.type !== "Direct" && !state.sourceRef.no.trim()) {
      setFormError("Please choose a source reference or switch to Direct.");
      return false;
    }

    const hasValidLine = state.items.some(
      (line) => line.productId && Number.parseFloat(line.quantity) > 0,
    );

    if (!hasValidLine) {
      setFormError("Add at least one line item with a product and quantity.");
      return false;
    }

    return true;
  };

  const saveInvoice = async (status: "Draft" | "Submitted") => {
    setIsSaving(true);

    try {
      await createPurchaseInvoice(toPurchaseInvoicePayload(state, status)).unwrap();
      window.localStorage.removeItem(PURCHASE_INVOICE_DRAFT_STORAGE_KEY);
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validateForm()) {
      setShowSubmitAlert(true);
    }
  };

  const handleDraft = () => {
    if (validateForm()) {
      void saveInvoice("Draft");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ConfirmAlert
        open={showSubmitAlert}
        title="Create purchase invoice?"
        message="This will save the purchase invoice as Submitted and post the related inventory and journal effects."
        confirmLabel="Create"
        isConfirming={isSaving}
        onConfirm={() => {
          setShowSubmitAlert(false);
          void saveInvoice("Submitted");
        }}
        onCancel={() => setShowSubmitAlert(false)}
      />

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
        primaryLabel="Create"
        onDraft={handleDraft}
        onReset={() => {
          reset();
          window.localStorage.removeItem(PURCHASE_INVOICE_DRAFT_STORAGE_KEY);
          setFormError("");
        }}
        onCancel={() => navigate("/operations/purchase-invoice")}
      />
    </form>
  );
}

export default function PurchaseInvoiceForm() {
  return (
    <PurchaseInvoiceFormProvider>
      <PurchaseInvoiceFormBody />
    </PurchaseInvoiceFormProvider>
  );
}
