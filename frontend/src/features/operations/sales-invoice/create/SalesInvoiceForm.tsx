import { FormEvent, useState } from "react";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router";
import {
  useCreateSalesInvoiceMutation,
  usePreviewSalesInvoicePdfMutation,
} from "@/redux/api/salesInvoiceApi";
import ConfirmAlert from "@/shared/components/ui/alert/ConfirmAlert";
import TransactionHeaderGrid from "@/features/operations/shared/TransactionHeaderGrid";
import TransactionStickyActionBar from "@/features/operations/shared/TransactionStickyActionBar";
import LineItemsSection from "./LineItemsSection";
import {
  SalesInvoiceFormProvider,
  useSalesInvoiceForm,
} from "./SalesInvoiceFormContext";
import SummaryFooterSection from "./SummaryFooterSection";
import {
  SALES_INVOICE_DRAFT_STORAGE_KEY,
  toSalesInvoicePayload,
} from "./types/types";
import CustomerInformationSection from "./sections/CustomerInformationSection";
import FinancialDetailsSection from "./sections/FinancialDetailsSection";
import OrderDetailsSection from "./sections/OrderDetailsSection";
import SalesInvoicePdfPreviewModal from "../SalesInvoicePdfPreviewModal";

function getMutationErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
) {
  if (!error) {
    return "Unable to save the sales invoice.";
  }

  if ("status" in error) {
    const errorData = error.data as { message?: string } | undefined;
    return errorData?.message ?? "Unable to save the sales invoice.";
  }

  return error.message ?? "Unable to save the sales invoice.";
}

function SalesInvoiceFormBody() {
  const navigate = useNavigate();
  const { state, reset } = useSalesInvoiceForm();
  const [createSalesInvoice] = useCreateSalesInvoiceMutation();
  const [previewPdf] = usePreviewSalesInvoicePdfMutation();
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showSubmitAlert, setShowSubmitAlert] = useState(false);

  const validateForm = () => {
    setFormError("");

    if (!state.document.no.trim()) {
      setFormError("Sales invoice number is required.");
      return false;
    }

    if (!state.customerInformation.customerId) {
      setFormError("Please select a customer.");
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
      await createSalesInvoice(toSalesInvoicePayload(state, status)).unwrap();
      window.localStorage.removeItem(SALES_INVOICE_DRAFT_STORAGE_KEY);
      reset();
      navigate("/operations/sales-invoice");
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

  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      const url = await previewPdf(toSalesInvoicePayload(state)).unwrap();
      setPreviewUrl(url);
    } catch {
      setFormError("Unable to generate PDF preview.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <>
      <SalesInvoicePdfPreviewModal url={previewUrl} onClose={closePreview} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <ConfirmAlert
          open={showSubmitAlert}
          title="Create sales invoice?"
          message="This will save the sales invoice as Submitted and post the related inventory and journal effects."
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
          <CustomerInformationSection />
          <FinancialDetailsSection />
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
          draftLabel="Save as Draft"
          onDraft={handleDraft}
          onPreview={handlePreview}
          isPreviewing={isPreviewing}
          onReset={() => {
            reset();
            window.localStorage.removeItem(SALES_INVOICE_DRAFT_STORAGE_KEY);
            setFormError("");
          }}
          onCancel={() => navigate("/operations/sales-invoice")}
        />
      </form>
    </>
  );
}

export default function SalesInvoiceForm() {
  return (
    <SalesInvoiceFormProvider>
      <SalesInvoiceFormBody />
    </SalesInvoiceFormProvider>
  );
}
