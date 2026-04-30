import { FormEvent, useMemo, useState } from "react";
import { Product, useCreateProductMutation } from "../../../../../app/api/productApi";
import { Uom, useGetUomsQuery } from "../../../../../app/api/uomApi";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import Label from "../../../../form/Label";
import Input from "../../../../form/input/InputField";
import Button from "../../../../ui/button/Button";

interface QuickCreateProductFormProps {
  initialName?: string;
  onCreated: (product: Product) => void;
  onCancel: () => void;
}

function filterUoms(uoms: Uom[], keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  return uoms
    .filter((uom) => {
      if (uom.status !== "Active") {
        return false;
      }

      if (!normalizedKeyword) {
        return true;
      }

      return (
        uom.code.toLowerCase().includes(normalizedKeyword) ||
        uom.name.toLowerCase().includes(normalizedKeyword)
      );
    })
    .slice(0, 10);
}

export default function QuickCreateProductForm({
  initialName = "",
  onCreated,
  onCancel,
}: QuickCreateProductFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState(initialName);
  const [uomId, setUomId] = useState("");
  const [formError, setFormError] = useState("");
  const { data: uoms = [] } = useGetUomsQuery();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const selectedUomLabel = useMemo(() => {
    const selectedUom = uoms.find((item) => item.id === uomId);
    return selectedUom ? `${selectedUom.code} - ${selectedUom.name}` : "";
  }, [uomId, uoms]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!code.trim() || !name.trim() || !uomId) {
      setFormError("Code, name, and UOM are required.");
      return;
    }

    try {
      const product = await createProduct({
        basicInfo: {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          otherLanguage: null,
          taxId: null,
        },
        pricingAndRates: {
          profitPercentage: null,
          purchaseRate: null,
          cost: null,
          salesRate: null,
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

      onCreated(product);
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to create product.";

      setFormError(message ?? "Failed to create product.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-5 dark:bg-gray-900 sm:p-6">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Quick Add Product
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add a missing product and drop straight back into the transaction.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>
            Product Code<span className="text-error-500">*</span>
          </Label>
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="PRD-001"
          />
        </div>
        <div>
          <Label>
            Product Name<span className="text-error-500">*</span>
          </Label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="USB Keyboard"
          />
        </div>
        <div className="md:col-span-2">
          <Label>
            UOM<span className="text-error-500">*</span>
          </Label>
          <AutocompleteSelect<Uom, Uom[]>
            value={selectedUomLabel}
            placeholder="Search UOM"
            search={(keyword) => filterUoms(uoms, keyword)}
            getItems={(result) => result}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) => `${item.code} - ${item.name}`}
            onInputChange={(value) => {
              if (!value.trim()) {
                setUomId("");
              }
            }}
            onSelect={(item) => setUomId(item?.id ?? "")}
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            The selected UOM will be used for base, purchase, sales, and stock.
          </p>
        </div>
      </div>

      {formError ? <p className="text-sm text-error-500">{formError}</p> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
