import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { useCustomerForm } from "../CustomerFormContext";
import SectionCard from "../SectionCard";

export default function FinancialsSection() {
  const { state, setSection } = useCustomerForm();

  return (
    <SectionCard title="Financials">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="mb-2">
          <Label>Credit Limit</Label>
          <Input type="number" value={state.financials.creditLimit} onChange={(event) => setSection("financials", { creditLimit: event.target.value })} placeholder="250000" />
        </div>
        <div className="mb-2">
          <Label>Credit Days</Label>
          <Input type="number" value={state.financials.creditDays} onChange={(event) => setSection("financials", { creditDays: event.target.value })} placeholder="30" />
        </div>
      </div>
    </SectionCard>
  );
}
