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

export default function StockAndMeasurementSection() {
  const { state, setSection } = useProductForm();
  const [searchLookup] = useLazySearchLookupQuery();

  const uomFields = useMemo(
    () =>
      [
        {
          label: "Base UOM",
          key: "baseUomId",
          value: state.stockAndMeasurement.baseUomId,
        },
        {
          label: "Purchase UOM",
          key: "purchaseUomId",
          value: state.stockAndMeasurement.purchaseUomId,
        },
        {
          label: "Sales UOM",
          key: "salesUomId",
          value: state.stockAndMeasurement.salesUomId,
        },
        {
          label: "Stock UOM",
          key: "stockUomId",
          value: state.stockAndMeasurement.stockUomId,
        },
      ] as const,
    [
      state.stockAndMeasurement.baseUomId,
      state.stockAndMeasurement.purchaseUomId,
      state.stockAndMeasurement.salesUomId,
      state.stockAndMeasurement.stockUomId,
    ],
  );

  const resolveItems = useMemo(
    () =>
      uomFields
        .filter((field) => field.value)
        .map((field) => ({
          source: "uoms" as const,
          ids: [field.value],
        })),
    [uomFields],
  );

  const { data: resolvedLookups = [] } = useResolveLookupsQuery(
    { items: resolveItems },
    { skip: resolveItems.length === 0 },
  );

  const resolvedLabelMap = useMemo(() => {
    const labels: Record<string, string> = {};

    uomFields.forEach((field, index) => {
      if (!field.value) {
        return;
      }

      labels[field.key] = resolvedLookups[index]?.options[0]?.label ?? "";
    });

    return labels;
  }, [resolvedLookups, uomFields]);

  const renderUomSelect = (
    label: string,
    key: "baseUomId" | "purchaseUomId" | "salesUomId" | "stockUomId",
  ) => (
    <div className="mb-2">
      <Label>{label}</Label>
      <AutocompleteSelect<LookupOption, LookupOption[]>
        value={resolvedLabelMap[key] ?? ""}
        placeholder="Search UOM"
        search={(keyword) =>
          searchLookup({
            source: "uoms",
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
            setSection("stockAndMeasurement", { [key]: "" });
          }
        }}
        onSelect={(item) =>
          setSection("stockAndMeasurement", { [key]: item?.id ?? "" })
        }
      />
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
