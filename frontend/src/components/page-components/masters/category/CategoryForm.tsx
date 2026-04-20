import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Category,
  CategoryStatus,
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "../../../../app/api/categoryApi";
import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Button from "../../../ui/button/Button";

interface CategoryFormProps {
  category?: Category | null;
  onClose: () => void;
}

export default function CategoryForm({ category, onClose }: CategoryFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [status, setStatus] = useState<CategoryStatus>("Active");
  const [formError, setFormError] = useState("");
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  useEffect(() => {
    setCode(category?.code ?? "");
    setName(category?.name ?? "");
    setParentCategoryId(category?.parentCategoryId ?? "");
    setStatus(category?.status ?? "Active");
    setFormError("");
  }, [category]);

  const availableParents = useMemo(
    () => categories.filter((item) => item.id !== category?.id),
    [categories, category?.id]
  );

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
        parentCategoryId: parentCategoryId || null,
        status,
      };

      if (category) {
        await updateCategory({ id: category.id, ...payload }).unwrap();
      } else {
        await createCategory(payload).unwrap();
      }

      onClose();
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to save category.";

      setFormError(message ?? "Failed to save category.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {category ? "Edit Category" : "Add Category"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Capture category details and optionally link it to a parent category.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label>
            Code<span className="text-error-500">*</span>
          </Label>
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="RAW"
          />
        </div>
        <div>
          <Label>
            Status<span className="text-error-500">*</span>
          </Label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as CategoryStatus)}
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
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Raw Materials"
        />
      </div>

      <div>
        <Label>Parent Category</Label>
        <select
          value={parentCategoryId}
          onChange={(event) => setParentCategoryId(event.target.value)}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="">Select a parent category</option>
          {availableParents.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {formError ? <p className="text-sm text-error-500">{formError}</p> : null}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button className="min-w-28" disabled={isLoading}>
          {isLoading ? "Saving..." : category ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
