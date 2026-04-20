import { FormEvent, useEffect, useState } from "react";
import { Warehouse, WarehouseStatus, useCreateWarehouseMutation, useUpdateWarehouseMutation } from "../../../../app/api/warehouseApi";
import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import TextArea from "../../../form/input/TextArea";
import Button from "../../../ui/button/Button";

export default function WarehouseForm({
  warehouse,
  onClose,
}: {
  warehouse?: Warehouse | null;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<WarehouseStatus>("Active");
  const [formError, setFormError] = useState("");
  const [createWarehouse, { isLoading: isCreating }] = useCreateWarehouseMutation();
  const [updateWarehouse, { isLoading: isUpdating }] = useUpdateWarehouseMutation();

  useEffect(() => {
    setCode(warehouse?.code ?? "");
    setName(warehouse?.name ?? "");
    setContactPerson(warehouse?.contactPerson ?? "");
    setPhone(warehouse?.phone ?? "");
    setEmail(warehouse?.email ?? "");
    setAddress(warehouse?.address ?? "");
    setStatus(warehouse?.status ?? "Active");
    setFormError("");
  }, [warehouse]);

  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!code.trim() || !name.trim()) {
      setFormError("Code and name are required.");
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      contactPerson: contactPerson.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
      status,
    };

    try {
      if (warehouse) {
        await updateWarehouse({ id: warehouse.id, ...payload }).unwrap();
      } else {
        await createWarehouse(payload).unwrap();
      }

      onClose();
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to save warehouse.";
      setFormError(message ?? "Failed to save warehouse.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {warehouse ? "Edit Warehouse" : "Add Warehouse"}
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label>Code</Label>
          <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="WH001" />
        </div>
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Main Warehouse" />
        </div>
        <div>
          <Label>Contact Person</Label>
          <Input value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} placeholder="Manager" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 9876543210" />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="warehouse@ims.local" />
        </div>
        <div>
          <Label>Status</Label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as WarehouseStatus)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div>
        <Label>Address</Label>
        <TextArea value={address} onChange={setAddress} rows={4} />
      </div>
      {formError ? <p className="text-sm text-error-500">{formError}</p> : null}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="min-w-28" disabled={isLoading}>{isLoading ? "Saving..." : warehouse ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
