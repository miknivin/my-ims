import { FormEvent, useEffect, useState } from "react";
import {
  Discount,
  DiscountPayload,
  DiscountStatus,
  DiscountType,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
} from "../../../../app/api/discountApi";
import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Button from "../../../ui/button/Button";

interface DiscountFormProps {
  discount?: Discount | null;
  onClose: () => void;
}

export default function DiscountForm({ discount, onClose }: DiscountFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<DiscountType>("percentage");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<DiscountStatus>("Active");
  const [formError, setFormError] = useState("");
  const [createDiscount, { isLoading: isCreating }] = useCreateDiscountMutation();
  const [updateDiscount, { isLoading: isUpdating }] = useUpdateDiscountMutation();

  useEffect(() => {
    setCode(discount?.code ?? "");
    setName(discount?.name ?? "");
    setDescription(discount?.description ?? "");
    setType(discount?.type ?? "percentage");
    setValue(discount?.value?.toString() ?? "");
    setStatus(discount?.status ?? "Active");
    setFormError("");
  }, [discount]);

  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!code.trim() || !name.trim() || value.trim() === "") {
      setFormError("Code, name, type, and value are required.");
      return;
    }

    const normalizedValue = Number(value);
    if (Number.isNaN(normalizedValue) || normalizedValue < 0) {
      setFormError("Discount value must be a valid non-negative number.");
      return;
    }

    if (type === "percentage" && normalizedValue > 100) {
      setFormError("Percentage discount cannot exceed 100.");
      return;
    }

    const payload: DiscountPayload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      type,
      value: normalizedValue,
      status,
    };

    try {
      if (discount) {
        await updateDiscount({ id: discount.id, ...payload }).unwrap();
      } else {
        await createDiscount(payload).unwrap();
      }

      onClose();
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to save discount.";

      setFormError(message ?? "Failed to save discount.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {discount ? "Edit Discount" : "Add Discount"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Capture reusable discount rules for pricing and transactional flows.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label>
            Code<span className="text-error-500">*</span>
          </Label>
          <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="DISC10" />
        </div>
        <div>
          <Label>
            Name<span className="text-error-500">*</span>
          </Label>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Festival Discount" />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Optional short description"
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
            onChange={(event) => setType(event.target.value as DiscountType)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>
        <div>
          <Label>
            Value<span className="text-error-500">*</span>
          </Label>
          <Input
            type="number"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={type === "percentage" ? "10" : "100"}
          />
        </div>
        <div>
          <Label>
            Status<span className="text-error-500">*</span>
          </Label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as DiscountStatus)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {formError ? <p className="text-sm text-error-500">{formError}</p> : null}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button className="min-w-28" disabled={isLoading}>
          {isLoading ? "Saving..." : discount ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
