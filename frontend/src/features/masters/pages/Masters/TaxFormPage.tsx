import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  TaxPayload,
  TaxStatus,
  TaxType,
  useCreateTaxMutation,
  useGetTaxByIdQuery,
  useUpdateTaxMutation,
} from "@/redux/api/taxApi";
import SlabModal, { SlabDraft } from "@/features/masters/components/masters/tax/SlabModal";
import CodeInput from "@/shared/components/form/CodeInput";
import Label from "@/shared/components/form/Label";
import Input from "@/shared/components/form/input/InputField";
import Button from "@/shared/components/ui/button/Button";
import ComponentCard from "@/shared/components/common/ComponentCard";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";

const selectClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800";

export default function TaxFormPage() {
  const navigate = useNavigate();
  const { taxId } = useParams();
  const isEdit = Boolean(taxId);

  const { data: tax, isLoading, isError } = useGetTaxByIdQuery(taxId ?? "", { skip: !taxId });

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaxType>("percentage");
  const [rate, setRate] = useState("");
  const [slabs, setSlabs] = useState<SlabDraft[]>([]);
  const [status, setStatus] = useState<TaxStatus>("Active");
  const [formError, setFormError] = useState("");

  const [slabModalOpen, setSlabModalOpen] = useState(false);
  const [editingSlabIndex, setEditingSlabIndex] = useState<number | null>(null);

  const [createTax, { isLoading: isCreating }] = useCreateTaxMutation();
  const [updateTax, { isLoading: isUpdating }] = useUpdateTaxMutation();
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (tax) {
      setName(tax.name);
      setCode(tax.code);
      setDescription(tax.description ?? "");
      setType(tax.type);
      setRate(tax.rate?.toString() ?? "");
      setSlabs(
        tax.slabs.map((s) => ({
          fromAmount: s.fromAmount.toString(),
          toAmount: s.toAmount.toString(),
          rate: s.rate.toString(),
        }))
      );
      setStatus(tax.status);
    }
  }, [tax]);

  const openAddSlab = () => {
    setEditingSlabIndex(null);
    setSlabModalOpen(true);
  };

  const openEditSlab = (index: number) => {
    setEditingSlabIndex(index);
    setSlabModalOpen(true);
  };

  const handleSlabSave = (slab: SlabDraft) => {
    if (editingSlabIndex !== null) {
      setSlabs((prev) => prev.map((s, i) => (i === editingSlabIndex ? slab : s)));
    } else {
      setSlabs((prev) => [...prev, slab]);
    }
    setSlabModalOpen(false);
  };

  const handleSlabDelete = (index: number) => {
    setSlabs((prev) => prev.filter((_, i) => i !== index));
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
    if (type === "slab" && slabs.length === 0) {
      setFormError("At least one slab is required for slab taxes.");
      return;
    }

    const payload: TaxPayload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      type,
      rate: type === "slab" ? null : Number(rate),
      slabs:
        type === "slab"
          ? slabs.map((s) => ({
              fromAmount: Number(s.fromAmount),
              toAmount: Number(s.toAmount),
              rate: Number(s.rate),
            }))
          : [],
      status,
    };

    try {
      if (isEdit && taxId) {
        await updateTax({ id: taxId, ...payload }).unwrap();
      } else {
        await createTax(payload).unwrap();
      }
      navigate("/masters/tax");
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : "Failed to save tax.";
      setFormError(message ?? "Failed to save tax.");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <PageBreadcrumb pageTitle={isEdit ? "Edit Tax" : "Add Tax"} />
        <div className="mx-auto max-w-3xl">
          <ComponentCard title={isEdit ? "Edit Tax" : "Add Tax"}>
            <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Loading tax details...</div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full space-y-6">
        <PageBreadcrumb pageTitle="Edit Tax" />
        <div className="mx-auto max-w-3xl">
          <ComponentCard title="Edit Tax">
            <div className="py-10 text-center text-sm text-red-600 dark:text-red-400">Unable to load tax details.</div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle={isEdit ? "Edit Tax" : "Add Tax"} />
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
        <ComponentCard title={isEdit ? "Edit Tax" : "Add Tax"} desc="Configure tax code, calculation type, and slab rules.">
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>Name<span className="text-error-500">*</span></Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="GST 18%" />
              </div>
              <div>
                <CodeInput entity="tax" label="Code" required value={code} onChange={setCode} placeholder="TAX-001" />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional tax description"
                className="min-h-20 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <Label>Type<span className="text-error-500">*</span></Label>
                <select value={type} onChange={(e) => setType(e.target.value as TaxType)} className={selectClass}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                  <option value="slab">Slab</option>
                </select>
              </div>
              <div>
                <Label>Status<span className="text-error-500">*</span></Label>
                <select value={status} onChange={(e) => setStatus(e.target.value as TaxStatus)} className={selectClass}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <div>
                <Label>Rate{type !== "slab" ? <span className="text-error-500">*</span> : null}</Label>
                <Input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder={type === "fixed" ? "100" : "18"}
                  disabled={type === "slab"}
                />
              </div>
            </div>

            {type === "slab" ? (
              <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">Slabs</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Define amount ranges and the applicable rate for each band.
                    </p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={openAddSlab}>
                    Add Slab
                  </Button>
                </div>

                {slabs.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
                    No slabs added yet. Click "Add Slab" to define ranges.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {slabs.map((slab, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{Number(slab.fromAmount).toLocaleString()}</span>
                          <span className="mx-1 text-gray-400">–</span>
                          <span className="font-medium">{Number(slab.toAmount).toLocaleString()}</span>
                          <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                            {slab.rate}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditSlab(index)}
                            className="rounded p-1 text-gray-400 hover:text-brand-500 dark:hover:text-brand-400"
                            title="Edit slab"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSlabDelete(index)}
                            className="rounded p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            title="Remove slab"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {formError ? <p className="text-sm text-error-500">{formError}</p> : null}

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/masters/tax")}>
                Cancel
              </Button>
              <Button className="min-w-28" disabled={isSaving}>
                {isSaving ? "Saving..." : isEdit ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </ComponentCard>
      </form>

      <SlabModal
        open={slabModalOpen}
        initial={editingSlabIndex !== null ? slabs[editingSlabIndex] : null}
        existingSlabs={slabs}
        editingIndex={editingSlabIndex}
        onSave={handleSlabSave}
        onClose={() => setSlabModalOpen(false)}
      />
    </div>
  );
}
