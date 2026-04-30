import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  type AppSettings,
  type AppSettingsPayload,
  type InventoryValuationMethod,
} from "../../../app/api/settingsApi";
import { useGetLedgersQuery, type Ledger } from "../../../app/api/ledgerApi";
import { useGetWarehousesQuery, type Warehouse } from "../../../app/api/warehouseApi";

export type SettingsTabKey = "general" | "inventory" | "accounting";

export type SettingsFormState = {
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
  accountingSettings: {
    discountAllowedLedgerId: string | null;
    discountAllowedLedgerName: string;
    discountReceivedLedgerId: string | null;
    discountReceivedLedgerName: string;
    inventoryLedgerId: string | null;
    inventoryLedgerName: string;
    salesLedgerId: string | null;
    salesLedgerName: string;
    costOfGoodsSoldLedgerId: string | null;
    costOfGoodsSoldLedgerName: string;
    grnClearingLedgerId: string | null;
    grnClearingLedgerName: string;
    purchaseTaxLedgerId: string | null;
    purchaseTaxLedgerName: string;
    salesTaxLedgerId: string | null;
    salesTaxLedgerName: string;
    defaultCashLedgerId: string | null;
    defaultCashLedgerName: string;
    grnAdditionLedgerId: string | null;
    grnAdditionLedgerName: string;
    grnDiscountLedgerId: string | null;
    grnDiscountLedgerName: string;
    roundOffLedgerId: string | null;
    roundOffLedgerName: string;
  };
};

type SettingsFormContextValue = {
  activeTab: SettingsTabKey;
  setActiveTab: (tab: SettingsTabKey) => void;
  state: SettingsFormState;
  setGeneral: (patch: Partial<SettingsFormState["general"]>) => void;
  setInventoryStockControl: (
    patch: Partial<SettingsFormState["inventorySettings"]["stockControl"]>
  ) => void;
  setInventoryCosting: (
    patch: Partial<SettingsFormState["inventorySettings"]["costing"]>
  ) => void;
  setInventoryBatchSerial: (
    patch: Partial<SettingsFormState["inventorySettings"]["batchSerial"]>
  ) => void;
  setAccountingSettings: (
    patch: Partial<SettingsFormState["accountingSettings"]>
  ) => void;
  warehouses: Warehouse[];
  postingLedgers: Ledger[];
  searchPostingLedgers: (keyword: string) => Ledger[];
  isLoading: boolean;
  isFetching: boolean;
  isSaving: boolean;
  isDirty: boolean;
  message: string | null;
  errorMessage: string | null;
  handleSave: () => Promise<void>;
  handleReset: () => void;
};

const SettingsFormContext = createContext<SettingsFormContextValue | undefined>(
  undefined
);

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
          settings?.inventorySettings.stockControl.blockSaleWhenStockUnavailable ??
          true,
        autoUpdateStockOnInvoicePosting:
          settings?.inventorySettings.stockControl.autoUpdateStockOnInvoicePosting ??
          true,
      },
      costing: {
        valuationMethod:
          settings?.inventorySettings.costing.valuationMethod ?? "Moving Average",
        costPrecision: String(
          settings?.inventorySettings.costing.costPrecision ?? 2
        ),
        roundingPrecision: String(
          settings?.inventorySettings.costing.roundingPrecision ?? 2
        ),
        includeLandedCostInInventoryCost:
          settings?.inventorySettings.costing.includeLandedCostInInventoryCost ??
          true,
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
    accountingSettings: {
      discountAllowedLedgerId:
        settings?.accountingSettings.discountAllowedLedgerId ?? null,
      discountAllowedLedgerName:
        settings?.accountingSettings.discountAllowedLedgerName ?? "",
      discountReceivedLedgerId:
        settings?.accountingSettings.discountReceivedLedgerId ?? null,
      discountReceivedLedgerName:
        settings?.accountingSettings.discountReceivedLedgerName ?? "",
      inventoryLedgerId: settings?.accountingSettings.inventoryLedgerId ?? null,
      inventoryLedgerName: settings?.accountingSettings.inventoryLedgerName ?? "",
      salesLedgerId: settings?.accountingSettings.salesLedgerId ?? null,
      salesLedgerName: settings?.accountingSettings.salesLedgerName ?? "",
      costOfGoodsSoldLedgerId:
        settings?.accountingSettings.costOfGoodsSoldLedgerId ?? null,
      costOfGoodsSoldLedgerName:
        settings?.accountingSettings.costOfGoodsSoldLedgerName ?? "",
      grnClearingLedgerId:
        settings?.accountingSettings.grnClearingLedgerId ?? null,
      grnClearingLedgerName:
        settings?.accountingSettings.grnClearingLedgerName ?? "",
      purchaseTaxLedgerId:
        settings?.accountingSettings.purchaseTaxLedgerId ?? null,
      purchaseTaxLedgerName:
        settings?.accountingSettings.purchaseTaxLedgerName ?? "",
      salesTaxLedgerId: settings?.accountingSettings.salesTaxLedgerId ?? null,
      salesTaxLedgerName:
        settings?.accountingSettings.salesTaxLedgerName ?? "",
      defaultCashLedgerId:
        settings?.accountingSettings.defaultCashLedgerId ?? null,
      defaultCashLedgerName:
        settings?.accountingSettings.defaultCashLedgerName ?? "",
      grnAdditionLedgerId:
        settings?.accountingSettings.grnAdditionLedgerId ?? null,
      grnAdditionLedgerName:
        settings?.accountingSettings.grnAdditionLedgerName ?? "",
      grnDiscountLedgerId:
        settings?.accountingSettings.grnDiscountLedgerId ?? null,
      grnDiscountLedgerName:
        settings?.accountingSettings.grnDiscountLedgerName ?? "",
      roundOffLedgerId: settings?.accountingSettings.roundOffLedgerId ?? null,
      roundOffLedgerName: settings?.accountingSettings.roundOffLedgerName ?? "",
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
        defaultWarehouseId:
          state.inventorySettings.stockControl.trackInventoryByWarehouse
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
          2
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
    accountingSettings: {
      discountAllowedLedgerId: state.accountingSettings.discountAllowedLedgerId,
      discountReceivedLedgerId: state.accountingSettings.discountReceivedLedgerId,
      inventoryLedgerId: state.accountingSettings.inventoryLedgerId,
      salesLedgerId: state.accountingSettings.salesLedgerId,
      costOfGoodsSoldLedgerId:
        state.accountingSettings.costOfGoodsSoldLedgerId,
      grnClearingLedgerId: state.accountingSettings.grnClearingLedgerId,
      purchaseTaxLedgerId: state.accountingSettings.purchaseTaxLedgerId,
      salesTaxLedgerId: state.accountingSettings.salesTaxLedgerId,
      defaultCashLedgerId: state.accountingSettings.defaultCashLedgerId,
      grnAdditionLedgerId: state.accountingSettings.grnAdditionLedgerId,
      grnDiscountLedgerId: state.accountingSettings.grnDiscountLedgerId,
      roundOffLedgerId: state.accountingSettings.roundOffLedgerId,
    },
  };
}

export function SettingsFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<SettingsTabKey>("general");
  const { data, isLoading, isFetching } = useGetSettingsQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();
  const { data: ledgers = [] } = useGetLedgersQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const [state, setState] = useState<SettingsFormState>(() => createFormState(null));
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setState(createFormState(data));
    }
  }, [data]);

  const postingLedgers = useMemo(
    () => {
      const selectedLedgerIds = new Set(
        Object.entries(state.accountingSettings)
          .filter(([key, value]) => key.endsWith("LedgerId") && typeof value === "string")
          .map(([, value]) => value as string)
      );

      return ledgers.filter(
        (ledger) =>
          (ledger.status === "Active" && ledger.allowManualPosting) ||
          selectedLedgerIds.has(ledger.id)
      );
    },
    [
      ledgers,
      state.accountingSettings.discountAllowedLedgerId,
      state.accountingSettings.discountReceivedLedgerId,
      state.accountingSettings.inventoryLedgerId,
      state.accountingSettings.salesLedgerId,
      state.accountingSettings.costOfGoodsSoldLedgerId,
      state.accountingSettings.grnClearingLedgerId,
      state.accountingSettings.purchaseTaxLedgerId,
      state.accountingSettings.salesTaxLedgerId,
      state.accountingSettings.defaultCashLedgerId,
      state.accountingSettings.grnAdditionLedgerId,
      state.accountingSettings.grnDiscountLedgerId,
      state.accountingSettings.roundOffLedgerId,
    ]
  );

  const isDirty = useMemo(() => {
    if (!data) {
      return false;
    }

    return (
      JSON.stringify(toPayload(state)) !==
      JSON.stringify(toPayload(createFormState(data)))
    );
  }, [data, state]);

  const value = useMemo<SettingsFormContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      state,
      setGeneral: (patch) =>
        setState((current) => ({
          ...current,
          general: { ...current.general, ...patch },
        })),
      setInventoryStockControl: (patch) =>
        setState((current) => ({
          ...current,
          inventorySettings: {
            ...current.inventorySettings,
            stockControl: {
              ...current.inventorySettings.stockControl,
              ...patch,
            },
          },
        })),
      setInventoryCosting: (patch) =>
        setState((current) => ({
          ...current,
          inventorySettings: {
            ...current.inventorySettings,
            costing: {
              ...current.inventorySettings.costing,
              ...patch,
            },
          },
        })),
      setInventoryBatchSerial: (patch) =>
        setState((current) => ({
          ...current,
          inventorySettings: {
            ...current.inventorySettings,
            batchSerial: {
              ...current.inventorySettings.batchSerial,
              ...patch,
            },
          },
        })),
      setAccountingSettings: (patch) =>
        setState((current) => ({
          ...current,
          accountingSettings: { ...current.accountingSettings, ...patch },
        })),
      warehouses,
      postingLedgers,
      searchPostingLedgers: (keyword) => {
        const normalizedKeyword = keyword.trim().toLowerCase();
        if (!normalizedKeyword) {
          return postingLedgers;
        }

        return postingLedgers.filter((ledger) =>
          [ledger.name, ledger.code, ledger.alias]
            .filter((value): value is string => Boolean(value))
            .some((value) => value.toLowerCase().includes(normalizedKeyword))
        );
      },
      isLoading,
      isFetching,
      isSaving,
      isDirty,
      message,
      errorMessage,
      handleSave: async () => {
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
      },
      handleReset: () => {
        if (data) {
          setState(createFormState(data));
          setMessage(null);
          setErrorMessage(null);
        }
      },
    }),
    [
      activeTab,
      data,
      errorMessage,
      isDirty,
      isFetching,
      isLoading,
      isSaving,
      message,
      postingLedgers,
      state,
      updateSettings,
      warehouses,
    ]
  );

  return (
    <SettingsFormContext.Provider value={value}>
      {children}
    </SettingsFormContext.Provider>
  );
}

export function useSettingsForm() {
  const context = useContext(SettingsFormContext);
  if (!context) {
    throw new Error("useSettingsForm must be used within SettingsFormProvider");
  }

  return context;
}
