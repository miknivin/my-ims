import SharedAdditionsSection from "@/features/operations/shared/AdditionsSection";
import { useSalesOrderForm } from "./SalesOrderFormContext";

export default function AdditionsSection() {
  const { state, addAddition, updateAddition, removeAddition, setFooter } =
    useSalesOrderForm();

  return (
    <SharedAdditionsSection
      additions={state.additions}
      onAdd={addAddition}
      onUpdate={updateAddition}
      onRemove={removeAddition}
      description="Charges, deductions, and ledger-linked adjustments for the order."
      footerFields={[
        {
          label: "Freight",
          value: state.footer.freight,
          min: "0",
          onChange: (freight) => setFooter({ freight }),
        },
        {
          label: "Round Off",
          value: state.footer.roundOff,
          onChange: (roundOff) => setFooter({ roundOff }),
        },
      ]}
    />
  );
}
