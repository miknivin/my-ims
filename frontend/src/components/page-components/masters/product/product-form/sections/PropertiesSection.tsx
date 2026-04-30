import { useMemo } from "react";
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

const toggles = [
  ["inactive", "Inactive"],
  ["lessProfit", "Less Profit"],
  ["counterItem", "Counter Item"],
  ["autoEntry", "Auto Entry"],
  ["hideFromDevice", "Hide From Device"],
  ["taxInclusive", "Tax Inclusive"],
  ["serialNo", "Serial No"],
] as const;

export default function PropertiesSection() {
  const { state, setSection } = useProductForm();
  const [searchLookup] = useLazySearchLookupQuery();

  const resolveItems = useMemo(
    () =>
      [
        state.categorization.groupCategoryId
          ? {
              source: "categories" as const,
              ids: [state.categorization.groupCategoryId],
            }
          : null,
        state.categorization.subGroupCategoryId
          ? {
              source: "categories" as const,
              ids: [state.categorization.subGroupCategoryId],
            }
          : null,
        state.categorization.vendorId
          ? {
              source: "vendors" as const,
              ids: [state.categorization.vendorId],
            }
          : null,
      ].filter(Boolean) as Array<{ source: "categories" | "vendors"; ids: string[] }>,
    [
      state.categorization.groupCategoryId,
      state.categorization.subGroupCategoryId,
      state.categorization.vendorId,
    ],
  );

  const { data: resolvedLookups = [] } = useResolveLookupsQuery(
    { items: resolveItems },
    { skip: resolveItems.length === 0 },
  );

  const resolvedLabels = useMemo(() => {
    const labels = {
      groupCategoryId: "",
      subGroupCategoryId: "",
      vendorId: "",
    };

    let resultIndex = 0;

    if (state.categorization.groupCategoryId) {
      labels.groupCategoryId = resolvedLookups[resultIndex]?.options[0]?.label ?? "";
      resultIndex += 1;
    }

    if (state.categorization.subGroupCategoryId) {
      labels.subGroupCategoryId =
        resolvedLookups[resultIndex]?.options[0]?.label ?? "";
      resultIndex += 1;
    }

    if (state.categorization.vendorId) {
      labels.vendorId = resolvedLookups[resultIndex]?.options[0]?.label ?? "";
    }

    return labels;
  }, [
    resolvedLookups,
    state.categorization.groupCategoryId,
    state.categorization.subGroupCategoryId,
    state.categorization.vendorId,
  ]);

  return (
    <SectionCard title="Product Properties">
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {toggles.map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={state.generalSettings[key]} onChange={(event) => setSection("generalSettings", { [key]: event.target.checked })} className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20" />
              <span>{label}</span>
            </label>
          ))}
          <div className="mb-2">
            <Label>Expiry Days</Label>
            <Input value={state.generalSettings.expiryDays} onChange={(event) => setSection("generalSettings", { expiryDays: event.target.value })} type="number" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="mb-2">
            <Label>Group</Label>
            <AutocompleteSelect<LookupOption, LookupOption[]>
              value={resolvedLabels.groupCategoryId}
              placeholder="Search category"
              search={(keyword) =>
                searchLookup({
                  source: "categories",
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
                  setSection("categorization", { groupCategoryId: "" });
                }
              }}
              onSelect={(item) =>
                setSection("categorization", { groupCategoryId: item?.id ?? "" })
              }
            />
          </div>
          <div className="mb-2">
            <Label>Sub Group</Label>
            <AutocompleteSelect<LookupOption, LookupOption[]>
              value={resolvedLabels.subGroupCategoryId}
              placeholder="Search sub-group"
              search={(keyword) =>
                searchLookup({
                  source: "categories",
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
                  setSection("categorization", { subGroupCategoryId: "" });
                }
              }}
              onSelect={(item) =>
                setSection("categorization", { subGroupCategoryId: item?.id ?? "" })
              }
            />
          </div>
          <div className="mb-2">
            <Label>Vendor</Label>
            <AutocompleteSelect<LookupOption, LookupOption[]>
              value={resolvedLabels.vendorId}
              placeholder="Search vendor"
              search={(keyword) =>
                searchLookup({
                  source: "vendors",
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
                  setSection("categorization", { vendorId: "" });
                }
              }}
              onSelect={(item) =>
                setSection("categorization", { vendorId: item?.id ?? "" })
              }
            />
          </div>
          <div className="mb-2">
            <Label>Brand</Label>
            <Input value={state.categorization.brand} onChange={(event) => setSection("categorization", { brand: event.target.value })} placeholder="Brand" />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
