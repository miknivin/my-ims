import { useMemo } from "react";
import { ProductStatus } from "../../../../../../app/api/productApi";
import {
  useLazySearchLookupQuery,
  useResolveLookupsQuery,
} from "../../../../../../app/api/lookupApi";
import { LookupOption } from "../../../../../../types/filtering";
import AutocompleteSelect from "../../../../../form/AutocompleteSelect";
import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { useProductForm } from "../ProductFormContext";
import SectionCard from "../SectionCard";

export default function BasicInfoSection() {
  const { state, setSection } = useProductForm();
  const [searchLookup] = useLazySearchLookupQuery();
  const resolveItems = useMemo(
    () =>
      state.basicInfo.taxId
        ? [{ source: "taxes" as const, ids: [state.basicInfo.taxId] }]
        : [],
    [state.basicInfo.taxId],
  );
  const { data: resolvedLookups = [] } = useResolveLookupsQuery(
    { items: resolveItems },
    { skip: resolveItems.length === 0 },
  );
  const resolvedTaxLabel = resolvedLookups[0]?.options[0]?.label ?? "";

  return (
    <SectionCard title="Basic Product Info">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="mb-2">
          <Label>Code</Label>
          <Input value={state.basicInfo.code} onChange={(event) => setSection("basicInfo", { code: event.target.value })} placeholder="PRD001" />
        </div>
        <div className="mb-2">
          <Label>Name</Label>
          <Input value={state.basicInfo.name} onChange={(event) => setSection("basicInfo", { name: event.target.value })} placeholder="Sample Product" />
        </div>
        <div className="mb-2">
          <Label>Other Language</Label>
          <Input value={state.basicInfo.otherLanguage} onChange={(event) => setSection("basicInfo", { otherLanguage: event.target.value })} placeholder="Localized name" />
        </div>
        <div className="mb-2">
          <Label>Tax Group</Label>
          <AutocompleteSelect<LookupOption, LookupOption[]>
            value={resolvedTaxLabel}
            placeholder="Search tax group"
            search={(keyword) =>
              searchLookup({
                source: "taxes",
                keyword,
                limit: 10,
              })
            }
            getItems={(result) => result}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) =>
              item.secondaryLabel ? `${item.label} (${item.secondaryLabel})` : item.label
            }
            onInputChange={(value) => {
              if (!value.trim()) {
                setSection("basicInfo", { taxId: "" });
              }
            }}
            onSelect={(item) => setSection("basicInfo", { taxId: item?.id ?? "" })}
          />
        </div>
        <div className="mb-2">
          <Label>Status</Label>
          <select value={state.basicInfo.status} onChange={(event) => setSection("basicInfo", { status: event.target.value as ProductStatus })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
    </SectionCard>
  );
}
