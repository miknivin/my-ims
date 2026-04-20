import { FormEvent, useEffect, useState } from "react";
import {
  Tax,
  TaxPayload,
  TaxStatus,
  TaxType,
  useCreateTaxMutation,
  useUpdateTaxMutation,
} from "../../../../app/api/taxApi";
import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Button from "../../../ui/button/Button";

interface TaxFormProps {
  tax?: Tax | null;
  onClose: () => void;
}

type TaxSlabDraft = {
  fromAmount: string;
  toAmount: string;
  rate: string;
};

const emptySlab = (): TaxSlabDraft => ({
  fromAmount: "",
  toAmount: "",
  rate: "",
});

export default function TaxForm({ tax, onClose }: TaxFormProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaxType>("percentage");
  const [rate, setRate] = useState("");
  const [slabs, setSlabs] = useState<TaxSlabDraft[]>([emptySlab()]);
  const [status, setStatus] = useState<TaxStatus>("Active");
  const [formError, setFormError] = useState("");
  const [createTax, { isLoading: isCreating }] = useCreateTaxMutation();
  const [updateTax, { isLoading: isUpdating }] = useUpdateTaxMutation();

  useEffect(() => {
    setName(tax?.name ?? "");
    setCode(tax?.code ?? "");
    setDescription(tax?.description ?? "");
    setType(tax?.type ?? "percentage");
    setRate(tax?.rate?.toString() ?? "");
    setSlabs(
      tax && tax.slabs.length > 0
        ? tax.slabs.map((slab) => ({
            fromAmount: slab.fromAmount.toString(),
            toAmount: slab.toAmount.toString(),
            rate: slab.rate.toString(),
          }))
        : [emptySlab()]
    );
    setStatus(tax?.status ?? "Active");
    setFormError("");
  }, [tax]);

  const isLoading = isCreating || isUpdating;

  const handleSlabChange = (
    index: number,
    field: keyof TaxSlabDraft,
    value: string
  ) => {
    setSlabs((current) =>
      current.map((slab, slabIndex) =>
        slabIndex === index ? { ...slab, [field]: value } : slab
      )
    );
  };

  const handleAddSlab = () => {
    setSlabs((current) => [...current, emptySlab()]);
  };

  const handleDeleteSlab = (index: number) => {
    setSlabs((current) =>
      current.length === 1 ? current : current.filter((_, slabIndex) => slabIndex !== index)
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!name.trim() || !code.trim()) {
      setFormError("Name and code are required.");
      return;
    }

    if (type !== "slab" && rate.trim() === "") {
      setFormError("Rate is required for percentage and fixed tax types.");
      return;
    }

    const normalizedSlabs = slabs
      .filter(
        (slab) =>
          slab.fromAmount.trim() !== "" ||
          slab.toAmount.trim() !== "" ||
          slab.rate.trim() !== ""
      )
      .map((slab) => ({
        fromAmount: Number(slab.fromAmount),
        toAmount: Number(slab.toAmount),
        rate: Number(slab.rate),
      }));

    if (type === "slab" && normalizedSlabs.length === 0) {
      setFormError("At least one slab is required for slab taxes.");
      return;
    }

    const payload: TaxPayload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      type,
      rate: type === "slab" ? null : Number(rate),
      slabs: type === "slab" ? normalizedSlabs : [],
      status,
    };

    try {
      if (tax) {
        await updateTax({ id: tax.id, ...payload }).unwrap();
      } else {
        await createTax(payload).unwrap();
      }

      onClose();
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to save tax.";

      setFormError(message ?? "Failed to save tax.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {tax ? "Edit Tax" : "Add Tax"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure tax code, calculation type, and slab rules if needed.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label>
            Name<span className="text-error-500">*</span>
          </Label>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="GST 18%" />
        </div>
        <div>
          <Label>
            Code<span className="text-error-500">*</span>
          </Label>
          <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="GST18" />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Optional tax description"
          className="min-h-24 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <Label>
            Type<span className="text-error-500">*</span>
          </Label>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as TaxType)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
            <option value="slab">Slab</option>
          </select>
        </div>
        <div>
          <Label>
            Status<span className="text-error-500">*</span>
          </Label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as TaxStatus)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
        <div>
          <Label>
            Rate{type !== "slab" ? <span className="text-error-500">*</span> : null}
          </Label>
          <Input
            type="number"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            placeholder={type === "fixed" ? "100" : "18"}
            disabled={type === "slab"}
          />
        </div>
      </div>

      {type === "slab" ? (
        <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Slabs
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Define amount ranges and the rate for each slab.
              </p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={handleAddSlab}>
              Add Slab
            </Button>
          </div>

          <div className="space-y-3">
            {slabs.map((slab, index) => (
              <div key={index} className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800 md:grid-cols-[1fr_1fr_1fr_auto]">
                <Input
                  type="number"
                  placeholder="From amount"
                  value={slab.fromAmount}
                  onChange={(event) => handleSlabChange(index, "fromAmount", event.target.value)}
                />
                <Input
                  type="number"
                  placeholder="To amount"
                  value={slab.toAmount}
                  onChange={(event) => handleSlabChange(index, "toAmount", event.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Rate"
                  value={slab.rate}
                  onChange={(event) => handleSlabChange(index, "rate", event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDeleteSlab(index)}
                  className="md:self-stretch"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {formError ? <p className="text-sm text-error-500">{formError}</p> : null}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button className="min-w-28" disabled={isLoading}>
          {isLoading ? "Saving..." : tax ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
