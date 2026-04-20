import { useState } from "react";
import Button from "../../../../../ui/button/Button";
import Checkbox from "../../../../../form/input/Checkbox";
import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { PencilIcon, TrashBinIcon } from "../../../../../../icons";
import { useCustomerForm } from "../CustomerFormContext";
import SectionCard from "../SectionCard";
import { createEmptyTaxDocument, CustomerTaxDocumentFormState } from "../types";

export default function TaxDocumentsSection() {
  const { state, saveTaxDocument, removeTaxDocument } = useCustomerForm();
  const [form, setForm] = useState<CustomerTaxDocumentFormState>(
    createEmptyTaxDocument(),
  );
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddOrUpdate = () => {
    if (!form.number.trim()) {
      return;
    }

    saveTaxDocument({
      ...form,
      number: form.number.toUpperCase().trim(),
      state: form.state.trim(),
      effectiveFrom:
        form.effectiveFrom || new Date().toISOString().split("T")[0],
    });

    setForm(createEmptyTaxDocument());
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    const document = state.taxDocuments.find((item) => item.id === id);
    if (!document) {
      return;
    }

    setForm(document);
    setEditingId(id);
  };

  const handleRemove = (id: string) => {
    removeTaxDocument(id);
    if (editingId === id) {
      setEditingId(null);
      setForm(createEmptyTaxDocument());
    }
  };

  return (
    <SectionCard title="Tax Documents">
      <div className="space-y-5">
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-900/50">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label>Tax Type</Label>
              <select
                value={form.taxType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    taxType: event.target.value as "GST" | "TDS" | "TCS" | "Other",
                  }))
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="GST">GST</option>
                <option value="TDS">TDS</option>
                <option value="TCS">TCS</option>
                <option value="Other">Other (PAN, TAN, etc.)</option>
              </select>
            </div>

            <div>
              <Label>
                {form.taxType === "GST" ? "GSTIN" : "Number"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.number}
                onChange={(event) =>
                  setForm((current) => ({ ...current, number: event.target.value }))
                }
                placeholder={form.taxType === "GST" ? "27AABCU9603R1ZN" : "AABCU9603R"}
              />
            </div>

            {form.taxType === "GST" ? (
              <div>
                <Label>State</Label>
                <Input
                  value={form.state}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, state: event.target.value }))
                  }
                  placeholder="Maharashtra"
                />
              </div>
            ) : null}

            <div>
              <Label>Effective From</Label>
              <Input
                type="date"
                value={form.effectiveFrom}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    effectiveFrom: event.target.value,
                  }))
                }
              />
            </div>

            <div className="flex items-end">
              <Checkbox
                label="Verified"
                checked={form.verified}
                onChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    verified: checked,
                    verifiedAt: checked ? current.verifiedAt : "",
                  }))
                }
              />
            </div>

            <div>
              <Label>Verified At</Label>
              <Input
                type="date"
                value={form.verifiedAt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    verifiedAt: event.target.value,
                  }))
                }
                disabled={!form.verified}
              />
            </div>

            <div className="flex items-end gap-3 md:col-span-2">
              <Button
                type="button"
                onClick={handleAddOrUpdate}
                disabled={!form.number.trim()}
              >
                {editingId ? "Update Document" : "Add Document"}
              </Button>
              {editingId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(createEmptyTaxDocument());
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {state.taxDocuments.length > 0 ? (
          <div>
            <h3 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              Added Tax Documents
            </h3>
            <div className="-mx-1 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-3 px-1">
              {state.taxDocuments.map((document) => (
                <div key={document.id} className="w-[240px] shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        {document.taxType}
                      </p>
                      <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">
                        {document.number}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {document.state || "State not set"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(document.id)}
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                        aria-label="Edit tax document"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(document.id)}
                        className="rounded-lg border border-red-200 p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                        aria-label="Delete tax document"
                      >
                        <TrashBinIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No tax documents added yet
          </p>
        )}
      </div>
    </SectionCard>
  );
}
