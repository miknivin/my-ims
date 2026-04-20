import { FormEvent, useState } from "react";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router";
import { useCreateSalesInvoiceMutation } from "../../../../app/api/salesInvoiceApi";
import TransactionHeaderGrid from "../shared/TransactionHeaderGrid";
import TransactionStickyActionBar from "../shared/TransactionStickyActionBar";
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
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!state.document.no.trim()) {
      setFormError("Sales invoice number is required.");
      return;
    }

    if (!state.customerInformation.customerId) {
      setFormError("Please select a customer.");
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
      await createSalesInvoice(toSalesInvoicePayload(state)).unwrap();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        primaryLabel="Save Sales Invoice"
        onReset={() => {
          reset();
          window.localStorage.removeItem(SALES_INVOICE_DRAFT_STORAGE_KEY);
          setFormError("");
        }}
        onCancel={() => navigate("/operations/sales-invoice")}
      />
    </form>
  );
}

export default function SalesInvoiceForm() {
  return (
    <SalesInvoiceFormProvider>
      <SalesInvoiceFormBody />
    </SalesInvoiceFormProvider>
  );
}
