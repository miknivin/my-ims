import { useEffect, useState } from "react";
import { useLazySearchLookupQuery } from "@/redux/api/lookupApi";
import { LookupOption } from "@/shared/types/filtering";
import { Product, useCreateProductMutation } from "@/redux/api/productApi";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import CodeInput from "@/shared/components/form/CodeInput";
import { Modal } from "@/shared/components/ui/modal";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";
const errorClass = "text-sm text-red-500 dark:text-red-400";

interface Props {
  open: boolean;
  keyword: string;
  onClose: () => void;
  onSuccess: (product: Product) => void;
}

export default function QuickAddProductModal({ open, keyword, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [uomId, setUomId] = useState<string | null>(null);
  const [uomLabel, setUomLabel] = useState("");
  const [purchaseRate, setPurchaseRate] = useState("");
  const [salesRate, setSalesRate] = useState("");
  const [error, setError] = useState("");

  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [searchLookup] = useLazySearchLookupQuery();

  useEffect(() => {
    if (open) {
      setName(keyword);
      setCode("");
      setUomId(null);
      setUomLabel("");
      setPurchaseRate("");
      setSalesRate("");
      setError("");
    }
  }, [open, keyword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required."); return; }
    if (!code.trim()) { setError("Code is required."); return; }
    if (!uomId) { setError("Unit of measure is required."); return; }
    setError("");

    try {
      const product = await createProduct({
        basicInfo: { code: code.trim(), name: name.trim(), otherLanguage: null, taxId: null },
        pricingAndRates: {
          profitPercentage: null,
          purchaseRate: purchaseRate ? parseFloat(purchaseRate) : null,
          cost: null,
          salesRate: salesRate ? parseFloat(salesRate) : null,
          normalRate: null,
          mrp: null,
          wholesaleRate: null,
        },
        stockAndMeasurement: {
          hsn: null,
          baseUomId: uomId,
          purchaseUomId: uomId,
          salesUomId: uomId,
          stockUomId: uomId,
          minimumStock: null,
          maximumStock: null,
          reOrderLevel: null,
          reOrderQuantity: null,
        },
        properties: {
          generalSettings: {
            inactive: false,
            lessProfit: false,
            counterItem: false,
            autoEntry: false,
            hideFromDevice: false,
            expiryDays: 0,
            taxInclusive: false,
            serialNo: false,
          },
          categorization: {
            groupCategoryId: null,
            subGroupCategoryId: null,
            vendorId: null,
            brand: null,
          },
        },
        additionalDetails: {
          packUnit: null,
          additionPercentage: null,
          addition: null,
          company: null,
          warehouseStock: null,
          document: null,
          barcode: null,
          purchaseHistory: null,
          salesHistory: null,
          companyStock: null,
        },
        status: "Active",
        openingStock: null,
      }).unwrap();

      onSuccess(product);
    } catch {
      setError("Failed to create product. Please try again.");
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} className="w-full max-w-md">
      <div className="p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white">
          Quick Add Product
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>
              Name<span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product name"
              autoFocus
            />
          </div>

          <CodeInput
            entity="product"
            label="Code"
            required
            value={code}
            onChange={setCode}
            placeholder="PROD-001"
          />

          <div>
            <label className={labelClass}>
              Unit of Measure<span className="text-red-500">*</span>
            </label>
            <AutocompleteSelect<LookupOption, LookupOption[]>
              value={uomLabel}
              selectedKey={uomId}
              placeholder="Search UOM"
              search={(kw) =>
                searchLookup({ source: "uoms", keyword: kw, limit: 10 })
              }
              getItems={(result) => result}
              getOptionKey={(item) => item.id}
              getOptionLabel={(item) => item.label}
              onInputChange={(v) => {
                if (!v.trim()) {
                  setUomId(null);
                  setUomLabel("");
                } else {
                  setUomLabel(v);
                }
              }}
              onSelect={(item) => {
                setUomId(item?.id ?? null);
                setUomLabel(item?.label ?? "");
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Purchase Rate</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={purchaseRate}
                onChange={(e) => setPurchaseRate(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={labelClass}>Sales Rate</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={salesRate}
                onChange={(e) => setSalesRate(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {error && <p className={errorClass}>{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
