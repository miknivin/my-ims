import { useState } from "react";
import Button from "../../../../../ui/button/Button";
import Checkbox from "../../../../../form/input/Checkbox";
import Label from "../../../../../form/Label";
import Input from "../../../../../form/input/InputField";
import { PencilIcon, TrashBinIcon } from "../../../../../../icons";
import { useCustomerForm } from "../CustomerFormContext";
import SectionCard from "../SectionCard";
import {
  createEmptyShippingAddress,
  CustomerShippingAddressFormState,
} from "../types";

export default function ShippingAddressesSection() {
  const { state, saveShippingAddress, removeShippingAddress } = useCustomerForm();
  const [form, setForm] = useState<CustomerShippingAddressFormState>(
    createEmptyShippingAddress(),
  );
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = () => {
    if (!form.name.trim()) {
      return;
    }

    saveShippingAddress({
      ...form,
      name: form.name.trim(),
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      country: form.country.trim(),
    });

    setForm(createEmptyShippingAddress());
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    const address = state.shippingAddresses.find((item) => item.id === id);
    if (!address) {
      return;
    }

    setForm(address);
    setEditingId(id);
  };

  const handleRemove = (id: string) => {
    removeShippingAddress(id);
    if (editingId === id) {
      setEditingId(null);
      setForm(createEmptyShippingAddress());
    }
  };

  return (
    <SectionCard title="Shipping Addresses">
      <div className="space-y-5">
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-900/50">
          <h4 className="mb-5 text-base font-medium text-gray-800 dark:text-gray-200">
            {editingId ? "Edit Address" : "Add New Shipping Address"}
          </h4>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <Label>Location Name *</Label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Head Office, Delhi Warehouse"
              />
            </div>
            <div>
              <Label>Street / Building</Label>
              <Input
                value={form.street}
                onChange={(event) =>
                  setForm((current) => ({ ...current, street: event.target.value }))
                }
                placeholder="123 Industrial Area"
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                value={form.city}
                onChange={(event) =>
                  setForm((current) => ({ ...current, city: event.target.value }))
                }
                placeholder="Mumbai"
              />
            </div>
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
            <div>
              <Label>Pincode</Label>
              <Input
                value={form.pincode}
                onChange={(event) =>
                  setForm((current) => ({ ...current, pincode: event.target.value }))
                }
                placeholder="400069"
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                value={form.country}
                onChange={(event) =>
                  setForm((current) => ({ ...current, country: event.target.value }))
                }
                placeholder="India"
              />
            </div>
            <div className="flex items-end">
              <Checkbox
                label="Default shipping address"
                checked={form.isDefault}
                onChange={(checked) =>
                  setForm((current) => ({ ...current, isDefault: checked }))
                }
              />
            </div>
            <div className="flex items-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSave}
                disabled={!form.name.trim()}
              >
                {editingId ? "Update Address" : "Add Address"}
              </Button>
              {editingId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(createEmptyShippingAddress());
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {state.shippingAddresses.length > 0 ? (
          <div>
            <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              Saved Shipping Locations
            </p>
            <div className="-mx-1 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-4 px-1">
              {state.shippingAddresses.map((address) => (
                <div
                  key={address.id}
                  className={`w-[260px] shrink-0 rounded-lg border p-4 transition-all ${
                    address.isDefault
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {address.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(address.id)}
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                        aria-label="Edit shipping address"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(address.id)}
                        className="rounded-lg border border-red-200 p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                        aria-label="Delete shipping address"
                      >
                        <TrashBinIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p className="line-clamp-2">{address.street || "Street not set"}</p>
                    <p>
                      {[address.city, address.state].filter(Boolean).join(", ") || "Location not set"}
                      {address.pincode ? ` - ${address.pincode}` : ""}
                    </p>
                    <p>{address.country || "Country not set"}</p>
                  </div>
                  <div className="mt-4 border-t border-gray-200 pt-3 dark:border-white/[0.06]">
                    <Checkbox
                      label="Default shipping address"
                      checked={address.isDefault}
                      onChange={(checked) =>
                        saveShippingAddress({
                          ...address,
                          isDefault: checked,
                        })
                      }
                    />
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}
