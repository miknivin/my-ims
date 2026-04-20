import { useGetTaxesQuery } from "../../../../../../app/api/taxApi";
import Label from "../../../../../form/Label";
import TextArea from "../../../../../form/input/TextArea";
import { useCustomerForm } from "../CustomerFormContext";
import SectionCard from "../SectionCard";

export default function SalesAndPricingSection() {
  const { state, setSection } = useCustomerForm();
  const { data: taxes = [] } = useGetTaxesQuery();

  return (
    <SectionCard title="Sales & Pricing">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="mb-2">
          <Label>Default Tax</Label>
          <select value={state.salesAndPricing.defaultTaxId} onChange={(event) => setSection("salesAndPricing", { defaultTaxId: event.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
            <option value="">Select a tax</option>
            {taxes.map((item) => (
              <option key={item.id} value={item.id}>{item.name} ({item.code})</option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <Label>Price Level</Label>
          <select value={state.salesAndPricing.priceLevel} onChange={(event) => setSection("salesAndPricing", { priceLevel: event.target.value as "WRATE" | "RRATE" | "MRATE" | "Special" })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
            <option value="WRATE">WRATE</option>
            <option value="RRATE">RRATE</option>
            <option value="MRATE">MRATE</option>
            <option value="Special">Special</option>
          </select>
        </div>
        <div className="mb-2 sm:col-span-2">
          <Label>Remarks</Label>
          <TextArea value={state.salesAndPricing.remarks} onChange={(value) => setSection("salesAndPricing", { remarks: value })} rows={3} />
        </div>
      </div>
    </SectionCard>
  );
}
