import { useEffect, useMemo, useState } from "react";
import { useGetSettingsQuery, useUpdateSettingsMutation, type AppSettings, type AppSettingsPayload, type InventoryValuationMethod } from "../../../app/api/settingsApi";
import { useGetWarehousesQuery } from "../../../app/api/warehouseApi";
import Button from "../../ui/button/Button";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const checkboxClass =
  "h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500";

type SettingsTabKey = "general" | "inventory";

type SettingsFormState = {
  general: {
    businessName: string;
    contactPerson: string;
    phone: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    gstin: string;
    pan: string;
  };
  inventorySettings: {
    stockControl: {
      allowNegativeStock: boolean;
      trackInventoryByWarehouse: boolean;
      defaultWarehouseId: string | null;
      blockSaleWhenStockUnavailable: boolean;
      autoUpdateStockOnInvoicePosting: boolean;
    };
    costing: {
      valuationMethod: InventoryValuationMethod;
      costPrecision: string;
      roundingPrecision: string;
      includeLandedCostInInventoryCost: boolean;
    };
    batchSerial: {
      enableBatchTracking: boolean;
      enableSerialTracking: boolean;
      requireExpiryForBatchItems: boolean;
    };
  };
};

function createFormState(settings?: AppSettings | null): SettingsFormState {
  return {
    general: {
      businessName: settings?.general.businessName ?? "",
      contactPerson: settings?.general.contactPerson ?? "",
      phone: settings?.general.phone ?? "",
      email: settings?.general.email ?? "",
      addressLine1: settings?.general.addressLine1 ?? "",
      addressLine2: settings?.general.addressLine2 ?? "",
      city: settings?.general.city ?? "",
      state: settings?.general.state ?? "",
      pincode: settings?.general.pincode ?? "",
      country: settings?.general.country ?? "",
      gstin: settings?.general.gstin ?? "",
      pan: settings?.general.pan ?? "",
    },
    inventorySettings: {
      stockControl: {
        allowNegativeStock:
          settings?.inventorySettings.stockControl.allowNegativeStock ?? false,
        trackInventoryByWarehouse:
          settings?.inventorySettings.stockControl.trackInventoryByWarehouse ?? true,
        defaultWarehouseId:
          settings?.inventorySettings.stockControl.defaultWarehouseId ?? null,
        blockSaleWhenStockUnavailable:
          settings?.inventorySettings.stockControl.blockSaleWhenStockUnavailable ?? true,
        autoUpdateStockOnInvoicePosting:
          settings?.inventorySettings.stockControl.autoUpdateStockOnInvoicePosting ?? true,
      },
      costing: {
        valuationMethod:
          settings?.inventorySettings.costing.valuationMethod ?? "Moving Average",
        costPrecision: String(settings?.inventorySettings.costing.costPrecision ?? 2),
        roundingPrecision: String(
          settings?.inventorySettings.costing.roundingPrecision ?? 2,
        ),
        includeLandedCostInInventoryCost:
          settings?.inventorySettings.costing.includeLandedCostInInventoryCost ?? true,
      },
      batchSerial: {
        enableBatchTracking:
          settings?.inventorySettings.batchSerial.enableBatchTracking ?? false,
        enableSerialTracking:
          settings?.inventorySettings.batchSerial.enableSerialTracking ?? false,
        requireExpiryForBatchItems:
          settings?.inventorySettings.batchSerial.requireExpiryForBatchItems ?? false,
      },
    },
  };
}

function normalizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseInteger(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toPayload(state: SettingsFormState): AppSettingsPayload {
  return {
    general: {
      businessName: state.general.businessName.trim(),
      contactPerson: normalizeOptional(state.general.contactPerson),
      phone: normalizeOptional(state.general.phone),
      email: normalizeOptional(state.general.email),
      addressLine1: normalizeOptional(state.general.addressLine1),
      addressLine2: normalizeOptional(state.general.addressLine2),
      city: normalizeOptional(state.general.city),
      state: normalizeOptional(state.general.state),
      pincode: normalizeOptional(state.general.pincode),
      country: normalizeOptional(state.general.country),
      gstin: normalizeOptional(state.general.gstin),
      pan: normalizeOptional(state.general.pan),
    },
    inventorySettings: {
      stockControl: {
        allowNegativeStock: state.inventorySettings.stockControl.allowNegativeStock,
        trackInventoryByWarehouse:
          state.inventorySettings.stockControl.trackInventoryByWarehouse,
        defaultWarehouseId: state.inventorySettings.stockControl.trackInventoryByWarehouse
          ? state.inventorySettings.stockControl.defaultWarehouseId
          : null,
        blockSaleWhenStockUnavailable:
          state.inventorySettings.stockControl.blockSaleWhenStockUnavailable,
        autoUpdateStockOnInvoicePosting:
          state.inventorySettings.stockControl.autoUpdateStockOnInvoicePosting,
      },
      costing: {
        valuationMethod: state.inventorySettings.costing.valuationMethod,
        costPrecision: parseInteger(state.inventorySettings.costing.costPrecision, 2),
        roundingPrecision: parseInteger(
          state.inventorySettings.costing.roundingPrecision,
          2,
        ),
        includeLandedCostInInventoryCost:
          state.inventorySettings.costing.includeLandedCostInInventoryCost,
      },
      batchSerial: {
        enableBatchTracking:
          state.inventorySettings.batchSerial.enableBatchTracking,
        enableSerialTracking:
          state.inventorySettings.batchSerial.enableSerialTracking,
        requireExpiryForBatchItems:
          state.inventorySettings.batchSerial.enableBatchTracking &&
          state.inventorySettings.batchSerial.requireExpiryForBatchItems,
      },
    },
  };
}

function ToggleField({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-start gap-3 rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800 ${disabled ? "opacity-60" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className={checkboxClass}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <span className="block text-sm font-medium text-gray-800 dark:text-white/90">{label}</span>
        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{description}</span>
      </span>
    </label>
  );
}

export default function SettingsForm() {
  const [activeTab, setActiveTab] = useState<SettingsTabKey>("general");
  const { data, isLoading, isFetching } = useGetSettingsQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const [state, setState] = useState<SettingsFormState>(() => createFormState(null));
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setState(createFormState(data));
    }
  }, [data]);

  const isDirty = useMemo(() => {
    if (!data) {
      return false;
    }

    return JSON.stringify(toPayload(state)) !== JSON.stringify(toPayload(createFormState(data)));
  }, [data, state]);

  async function handleSave() {
    setMessage(null);
    setErrorMessage(null);

    try {
      const saved = await updateSettings(toPayload(state)).unwrap();
      setState(createFormState(saved));
      setMessage("Settings saved successfully.");
    } catch (error) {
      const maybeError = error as { data?: { message?: string } };
      setErrorMessage(maybeError.data?.message ?? "Unable to save settings.");
    }
  }

  function handleReset() {
    if (data) {
      setState(createFormState(data));
      setMessage(null);
      setErrorMessage(null);
    }
  }

  if (isLoading) {
    return (
      <ComponentCard title="" className="p-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">Loading settings...</div>
      </ComponentCard>
    );
  }

  return (
    <div className="space-y-6">
      <ComponentCard title="" className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-4 py-4 dark:border-gray-800">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "general", label: "General" },
              { key: "inventory", label: "Inventory Settings" },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as SettingsTabKey)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-500 text-white shadow-theme-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isFetching ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">Refreshing...</span>
            ) : null}
            <Button type="button" variant="outline" onClick={handleReset} disabled={!isDirty || isSaving}>
              Reset
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving || !isDirty}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          {message ? <div className="mb-4 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700 dark:border-success-900/40 dark:bg-success-950/20 dark:text-success-400">{message}</div> : null}
          {errorMessage ? <div className="mb-4 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-950/20 dark:text-error-400">{errorMessage}</div> : null}

          {activeTab === "general" ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" value={state.general.businessName} onChange={(event) => setState((current) => ({ ...current, general: { ...current.general, businessName: event.target.value } }))} />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input id="contactPerson" value={state.general.contactPerson} onChange={(event) => setState((current) => ({ ...current, general: { ...current.general, contactPerson: event.target.value } }))} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={state.general.phone} onChange={(event) => setState((current) => ({ ...current, general: { ...current.general, phone: event.target.value } }))} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={state.general.email} onChange={(event) => setState((current) => ({ ...current, general: { ...current.general, email: event.target.value } }))} />
              </div>
              <div>
                <Label htmlFor="gstin">GSTIN</Label>
                <Input id="gstin" value={state.general.gstin} onChange={(event) => setState((current) => ({ ...current, general: { ...current.general, gstin: event.target.value } }))} />
              </div>
              <div>
                <Label htmlFor="pan">PAN</Label>
                <Input id="pan" value={state.general.pan} onChange={(event) => setState((current) => ({ ...current, general: { ...current.general, pan: event.target.value } }))} />
              </div>
              <div className="lg:col-span-2">
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input id="addressLine1" value={state.general.addressLine1} onChange={(event) => setState((current) => ({ ...current, general: { ...current.general, addressLine1: event.target.value } }))} />
              </div>
              <div className="lg:col-span-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input id="addressLine2" value={state.general.addressLine2} onChange={(event) => setState((current) => ({ ...current, general: { ...current.general, addressLine2: event.target.value } }))} />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={state.general.city} onChange={(event) => setState((current) => ({ ...current, general: { ...current.general, city: event.target.value } }))} />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" value={state.general.state} onChange={(event) => setState((current) => ({ ...current, general: { ...current.general, state: event.target.value } }))} />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" value={state.general.pincode} onChange={(event) => setState((current) => ({ ...current, general: { ...current.general, pincode: event.target.value } }))} />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={state.general.country} onChange={(event) => setState((current) => ({ ...current, general: { ...current.general, country: event.target.value } }))} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <ComponentCard title="" className="p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Stock Control</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Set how stock is validated, tracked, and updated during inventory-moving transactions.</p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <ToggleField checked={state.inventorySettings.stockControl.allowNegativeStock} onChange={(value) => setState((current) => ({ ...current, inventorySettings: { ...current.inventorySettings, stockControl: { ...current.inventorySettings.stockControl, allowNegativeStock: value } } }))} label="Allow Negative Stock" description="Permit stock-moving documents to continue even when on-hand quantity drops below zero." />
                    <ToggleField checked={state.inventorySettings.stockControl.trackInventoryByWarehouse} onChange={(value) => setState((current) => ({ ...current, inventorySettings: { ...current.inventorySettings, stockControl: { ...current.inventorySettings.stockControl, trackInventoryByWarehouse: value, defaultWarehouseId: value ? current.inventorySettings.stockControl.defaultWarehouseId : null } } }))} label="Track Inventory by Warehouse" description="Maintain and validate stock separately for each warehouse instead of globally." />
                    <ToggleField checked={state.inventorySettings.stockControl.blockSaleWhenStockUnavailable} onChange={(value) => setState((current) => ({ ...current, inventorySettings: { ...current.inventorySettings, stockControl: { ...current.inventorySettings.stockControl, blockSaleWhenStockUnavailable: value } } }))} label="Block Sale When Stock Is Unavailable" description="Prevent sales posting when available stock cannot cover the requested quantity." />
                    <ToggleField checked={state.inventorySettings.stockControl.autoUpdateStockOnInvoicePosting} onChange={(value) => setState((current) => ({ ...current, inventorySettings: { ...current.inventorySettings, stockControl: { ...current.inventorySettings.stockControl, autoUpdateStockOnInvoicePosting: value } } }))} label="Auto Update Stock on Invoice Posting" description="Automatically post stock outward when sales invoices are finalized." />
                  </div>
                  <div className="max-w-md">
                    <Label htmlFor="defaultWarehouse">Default Warehouse</Label>
                    <select
                      id="defaultWarehouse"
                      className={inputClass}
                      value={state.inventorySettings.stockControl.defaultWarehouseId ?? ""}
                      disabled={!state.inventorySettings.stockControl.trackInventoryByWarehouse}
                      onChange={(event) => setState((current) => ({ ...current, inventorySettings: { ...current.inventorySettings, stockControl: { ...current.inventorySettings.stockControl, defaultWarehouseId: event.target.value || null } } }))}
                    >
                      <option value="">No default warehouse</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="" className="p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Costing</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Control how inventory cost is valued and rounded across stock-driven transactions.</p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <div>
                      <Label htmlFor="valuationMethod">Valuation Method</Label>
                      <select id="valuationMethod" className={inputClass} value={state.inventorySettings.costing.valuationMethod} onChange={(event) => setState((current) => ({ ...current, inventorySettings: { ...current.inventorySettings, costing: { ...current.inventorySettings.costing, valuationMethod: event.target.value as InventoryValuationMethod } } }))}>
                        <option value="Moving Average">Moving Average</option>
                        <option value="FIFO">FIFO</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="costPrecision">Cost Precision</Label>
                      <Input id="costPrecision" type="number" min="0" max="6" value={state.inventorySettings.costing.costPrecision} onChange={(event) => setState((current) => ({ ...current, inventorySettings: { ...current.inventorySettings, costing: { ...current.inventorySettings.costing, costPrecision: event.target.value } } }))} />
                    </div>
                    <div>
                      <Label htmlFor="roundingPrecision">Rounding Precision</Label>
                      <Input id="roundingPrecision" type="number" min="0" max="6" value={state.inventorySettings.costing.roundingPrecision} onChange={(event) => setState((current) => ({ ...current, inventorySettings: { ...current.inventorySettings, costing: { ...current.inventorySettings.costing, roundingPrecision: event.target.value } } }))} />
                    </div>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <ToggleField checked={state.inventorySettings.costing.includeLandedCostInInventoryCost} onChange={(value) => setState((current) => ({ ...current, inventorySettings: { ...current.inventorySettings, costing: { ...current.inventorySettings.costing, includeLandedCostInInventoryCost: value } } }))} label="Include Landed Cost / Additions in Inventory Cost" description="Fold additional inward costs into inventory valuation instead of keeping them only as financial adjustments." />
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="" className="p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Batch / Serial</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enable item-level traceability controls for batch-managed and serial-managed inventory.</p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <ToggleField checked={state.inventorySettings.batchSerial.enableBatchTracking} onChange={(value) => setState((current) => ({ ...current, inventorySettings: { ...current.inventorySettings, batchSerial: { ...current.inventorySettings.batchSerial, enableBatchTracking: value, requireExpiryForBatchItems: value ? current.inventorySettings.batchSerial.requireExpiryForBatchItems : false } } }))} label="Enable Batch Tracking" description="Track lot or batch references for inventory items that need grouped traceability." />
                    <ToggleField checked={state.inventorySettings.batchSerial.enableSerialTracking} onChange={(value) => setState((current) => ({ ...current, inventorySettings: { ...current.inventorySettings, batchSerial: { ...current.inventorySettings.batchSerial, enableSerialTracking: value } } }))} label="Enable Serial Tracking" description="Track each unique serial number for controlled items through stock movement." />
                    <ToggleField checked={state.inventorySettings.batchSerial.requireExpiryForBatchItems} disabled={!state.inventorySettings.batchSerial.enableBatchTracking} onChange={(value) => setState((current) => ({ ...current, inventorySettings: { ...current.inventorySettings, batchSerial: { ...current.inventorySettings.batchSerial, requireExpiryForBatchItems: value } } }))} label="Require Expiry for Batch Items" description="Force expiry capture whenever a batch-tracked item is received or managed." />
                  </div>
                </div>
              </ComponentCard>
            </div>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}

