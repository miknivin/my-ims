import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { BalanceType } from "../../../../../../app/api/vendorApi";
import { useCustomerForm } from "../CustomerFormContext";
import SectionCard from "../SectionCard";

export default function OpeningBalanceSection() {
  const { state, setSection } = useCustomerForm();

  return (
    <SectionCard title="Opening Balance">
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Opening balance is stored separately from the customer master and linked during save.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="mb-2">
          <Label>Amount</Label>
          <Input type="number" value={state.openingBalance.amount} onChange={(event) => setSection("openingBalance", { amount: event.target.value })} placeholder="0.00" />
        </div>
        <div className="mb-2">
          <Label>Balance Type</Label>
          <select value={state.openingBalance.balanceType} onChange={(event) => setSection("openingBalance", { balanceType: event.target.value as BalanceType })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
            <option value="Dr">Dr</option>
            <option value="Cr">Cr</option>
          </select>
        </div>
        <div className="mb-2">
          <Label>As Of Date</Label>
          <Input type="date" value={state.openingBalance.asOfDate} onChange={(event) => setSection("openingBalance", { asOfDate: event.target.value })} />
        </div>
      </div>
    </SectionCard>
  );
}
