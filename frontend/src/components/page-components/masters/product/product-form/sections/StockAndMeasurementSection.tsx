import { useGetUomsQuery } from "../../../../../../app/api/uomApi";
import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { useProductForm } from "../ProductFormContext";
import SectionCard from "../SectionCard";

export default function StockAndMeasurementSection() {
  const { state, setSection } = useProductForm();
  const { data: uoms = [] } = useGetUomsQuery();

  const renderUomSelect = (label: string, key: "baseUomId" | "purchaseUomId" | "salesUomId" | "stockUomId") => (
    <div className="mb-2">
      <Label>{label}</Label>
      <select value={state.stockAndMeasurement[key]} onChange={(event) => setSection("stockAndMeasurement", { [key]: event.target.value })} className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
        <option value="">Select UOM</option>
        {uoms.map((uom) => <option key={uom.id} value={uom.id}>{uom.name}</option>)}
      </select>
    </div>
  );

  return (
    <SectionCard title="Stock & Measurement">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="mb-2">
          <Label>HSN</Label>
          <Input value={state.stockAndMeasurement.hsn} onChange={(event) => setSection("stockAndMeasurement", { hsn: event.target.value })} placeholder="HSN code" />
        </div>
        {renderUomSelect("Base UOM", "baseUomId")}
        {renderUomSelect("Purchase UOM", "purchaseUomId")}
        {renderUomSelect("Sales UOM", "salesUomId")}
        {renderUomSelect("Stock UOM", "stockUomId")}
        <div className="mb-2">
          <Label>Minimum Stock</Label>
          <Input value={state.stockAndMeasurement.minimumStock} onChange={(event) => setSection("stockAndMeasurement", { minimumStock: event.target.value })} type="number" />
        </div>
        <div className="mb-2">
          <Label>Maximum Stock</Label>
          <Input value={state.stockAndMeasurement.maximumStock} onChange={(event) => setSection("stockAndMeasurement", { maximumStock: event.target.value })} type="number" />
        </div>
        <div className="mb-2">
          <Label>Reorder Level</Label>
          <Input value={state.stockAndMeasurement.reOrderLevel} onChange={(event) => setSection("stockAndMeasurement", { reOrderLevel: event.target.value })} type="number" />
        </div>
        <div className="mb-2">
          <Label>Reorder Quantity</Label>
          <Input value={state.stockAndMeasurement.reOrderQuantity} onChange={(event) => setSection("stockAndMeasurement", { reOrderQuantity: event.target.value })} type="number" />
        </div>
      </div>
    </SectionCard>
  );
}
