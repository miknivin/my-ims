import { useGetCategoriesQuery } from "../../../../../../app/api/categoryApi";
import { useSearchLookupQuery } from "../../../../../../app/api/lookupApi";
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
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: vendors = [] } = useSearchLookupQuery({
    source: "vendors",
    keyword: "",
    limit: 100,
  });

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
            <select value={state.categorization.groupCategoryId} onChange={(event) => setSection("categorization", { groupCategoryId: event.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
              <option value="">Select category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="mb-2">
            <Label>Sub Group</Label>
            <select value={state.categorization.subGroupCategoryId} onChange={(event) => setSection("categorization", { subGroupCategoryId: event.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
              <option value="">Select category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="mb-2">
            <Label>Vendor</Label>
            <select value={state.categorization.vendorId} onChange={(event) => setSection("categorization", { vendorId: event.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
              <option value="">Select vendor</option>
              {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.label}</option>)}
            </select>
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
