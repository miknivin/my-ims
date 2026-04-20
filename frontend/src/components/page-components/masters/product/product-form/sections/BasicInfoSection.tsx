import { ProductStatus } from "../../../../../../app/api/productApi";
import { useGetTaxesQuery } from "../../../../../../app/api/taxApi";
import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { useProductForm } from "../ProductFormContext";
import SectionCard from "../SectionCard";

export default function BasicInfoSection() {
  const { state, setSection } = useProductForm();
  const { data: taxes = [] } = useGetTaxesQuery();

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
          <select value={state.basicInfo.taxId} onChange={(event) => setSection("basicInfo", { taxId: event.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
            <option value="">Select a tax</option>
            {taxes.map((tax) => <option key={tax.id} value={tax.id}>{tax.name}</option>)}
          </select>
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
