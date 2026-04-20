import { FormEvent, useEffect, useState } from "react";
import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Button from "../../../ui/button/Button";
import {
  Uom,
  UomStatus,
  useCreateUomMutation,
  useUpdateUomMutation,
} from "../../../../app/api/uomApi";

interface UomFormProps {
  uom?: Uom | null;
  onClose: () => void;
}

export default function UomForm({ uom, onClose }: UomFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<UomStatus>("Active");
  const [formError, setFormError] = useState("");
  const [createUom, { isLoading: isCreating }] = useCreateUomMutation();
  const [updateUom, { isLoading: isUpdating }] = useUpdateUomMutation();

  useEffect(() => {
    setCode(uom?.code ?? "");
    setName(uom?.name ?? "");
    setStatus(uom?.status ?? "Active");
    setFormError("");
  }, [uom]);

  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!code.trim() || !name.trim()) {
      setFormError("Code and name are required.");
      return;
    }

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        status,
      };

      if (uom) {
        await updateUom({ id: uom.id, ...payload }).unwrap();
      } else {
        await createUom(payload).unwrap();
      }

      onClose();
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to save UOM.";

      setFormError(message ?? "Failed to save UOM.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {uom ? "Edit UOM" : "Add UOM"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Capture the unit code, display name, and current status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label>
            Code<span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            placeholder="PCS"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </div>
        <div>
          <Label>
            Status<span className="text-error-500">*</span>
          </Label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as UomStatus)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div>
        <Label>
          Name<span className="text-error-500">*</span>
        </Label>
        <Input
          type="text"
          placeholder="Pieces"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      {formError ? (
        <p className="text-sm text-error-500">{formError}</p>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button className="min-w-28" disabled={isLoading}>
          {isLoading ? "Saving..." : uom ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
