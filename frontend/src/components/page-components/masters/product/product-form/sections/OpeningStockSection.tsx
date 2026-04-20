import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { useProductForm } from "../ProductFormContext";
import SectionCard from "../SectionCard";

export default function OpeningStockSection() {
  const { state, setSection } = useProductForm();
  return (
    <SectionCard title="Opening Stock">
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Opening stock is stored separately from the product master for consistency with future inventory postings.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="mb-2">
            <Label>Quantity</Label>
            <Input value={state.openingStock.quantity} onChange={(event) => setSection("openingStock", { quantity: event.target.value })} type="number" placeholder="0.00" />
          </div>
          <div className="mb-2">
            <Label>As Of Date</Label>
            <input type="date" value={state.openingStock.asOfDate} onChange={(event) => setSection("openingStock", { asOfDate: event.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
