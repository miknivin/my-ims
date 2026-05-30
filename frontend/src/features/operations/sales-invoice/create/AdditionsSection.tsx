import SharedAdditionsSection from "@/features/operations/shared/AdditionsSection";
import { useSalesInvoiceForm } from "./SalesInvoiceFormContext";

export default function AdditionsSection() {
  const { state, addAddition, updateAddition, removeAddition } =
    useSalesInvoiceForm();

  return (
    <SharedAdditionsSection
      additions={state.additions}
      onAdd={addAddition}
      onUpdate={updateAddition}
      onRemove={removeAddition}
      description="Capture freight, round-off style charges, and invoice deductions here."
    />
  );
}
