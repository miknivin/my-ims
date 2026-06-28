import { useLazySearchLookupQuery, useResolveLookupsQuery } from "@/redux/api/lookupApi";
import { LookupOption } from "@/shared/types/filtering";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import Label from "@/shared/components/form/Label";
import TextArea from "@/shared/components/form/input/TextArea";
import { useCustomerForm } from "../CustomerFormContext";
import SectionCard from "../SectionCard";

export default function SalesAndPricingSection() {
  const { state, setSection } = useCustomerForm();
  const [searchLookup] = useLazySearchLookupQuery();

  const resolveItems = state.salesAndPricing.defaultTaxId
    ? [{ source: "taxes" as const, ids: [state.salesAndPricing.defaultTaxId] }]
    : [];
  const { data: resolvedLookups = [] } = useResolveLookupsQuery(
    { items: resolveItems },
    { skip: resolveItems.length === 0 }
  );
  const selectedTaxLabel = resolvedLookups[0]?.options[0]?.label ?? "";

  return (
    <SectionCard title="Sales & Pricing">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="mb-2">
          <Label>Default Tax</Label>
          <AutocompleteSelect<LookupOption, LookupOption[]>
            value={selectedTaxLabel}
            placeholder="Search tax"
            search={(keyword) =>
              searchLookup({ source: "taxes", keyword, limit: 10 })
            }
            getItems={(result) => result}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) =>
              item.secondaryLabel ? `${item.label} (${item.secondaryLabel})` : item.label
            }
            onInputChange={(value) => {
              if (!value.trim()) setSection("salesAndPricing", { defaultTaxId: "" });
            }}
            onSelect={(item) => setSection("salesAndPricing", { defaultTaxId: item?.id ?? "" })}
          />
        </div>
        <div className="mb-2">
          <Label>Price Level</Label>
          <select value={state.salesAndPricing.priceLevel} onChange={(event) => setSection("salesAndPricing", { priceLevel: event.target.value as "WRATE" | "RRATE" | "MRATE" | "Special" })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
            <option value="WRATE">Wholesale</option>
            <option value="RRATE">Retail</option>
            <option value="MRATE">MRP</option>
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
