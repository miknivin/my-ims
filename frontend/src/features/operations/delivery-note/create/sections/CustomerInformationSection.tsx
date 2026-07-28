import { useState } from "react";
import { Customer, useLazyGetCustomerByIdQuery } from "@/redux/api/customerApi";
import { useLazySearchLookupQuery } from "@/redux/api/lookupApi";
import { LookupOption } from "@/shared/types/filtering";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import TransactionSectionCard from "@/features/operations/shared/TransactionSectionCard";
import QuickAddCustomerModal from "@/shared/components/quick-add/QuickAddCustomerModal";
import { useDeliveryNoteForm } from "../DeliveryNoteFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";
const areaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function CustomerInformationSection() {
  const { state, setCustomerInformation } = useDeliveryNoteForm();
  const [searchLookup] = useLazySearchLookupQuery();
  const [getCustomerById] = useLazyGetCustomerByIdQuery();
  const [quickAdd, setQuickAdd] = useState({ open: false, keyword: "" });

  const hydrateCustomer = (customer: Customer) => {
    const formatAddr = (parts: (string | null | undefined)[]) =>
      parts.filter(Boolean).join(", ");
    const billing = customer.billingAddress;
    const ship = customer.shippingAddresses?.[0];
    setCustomerInformation({
      customerId: customer.id,
      customerLabel: customer.basicDetails.name,
      address: formatAddr([billing.street, billing.city, billing.state, billing.pincode, billing.country]),
      shippingAddress: ship ? formatAddr([ship.street, ship.city, ship.state, ship.pincode, ship.country]) : "",
      attention: "",
      phone: customer.contact?.phone ?? "",
    });
  };

  return (
    <>
    <TransactionSectionCard title="Customer Information">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Customer <span className="text-error-500">*</span></label>
          <AutocompleteSelect
            value={state.customerInformation.customerLabel}
            className="bg-transparent"
            placeholder="Search customer"
            search={(keyword) =>
              searchLookup({ source: "customers", keyword, limit: 10 }).unwrap()
            }
            getItems={(result) => result}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) => item.label}
            onInputChange={(value) =>
              setCustomerInformation({ customerLabel: value, customerId: null })
            }
            onSelect={async (item: LookupOption | null) => {
              if (!item) return;

              setCustomerInformation({
                customerId: item.id,
                customerLabel: item.label,
              });

              try {
                const customer = await getCustomerById(item.id).unwrap();
                hydrateCustomer(customer);
              } catch {
                // Keep the selected customer label if detail hydration fails.
              }
            }}
            onNoMatchClick={(kw) => setQuickAdd({ open: true, keyword: kw })}
          />
        </div>

        <div>
          <label className={labelClass}>Attention</label>
          <input
            className={inputClass}
            value={state.customerInformation.attention}
            onChange={(event) =>
              setCustomerInformation({ attention: event.target.value })
            }
            placeholder="Contact person"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Billing Address</label>
          <textarea
            rows={2}
            className={areaClass}
            value={state.customerInformation.address}
            onChange={(event) =>
              setCustomerInformation({ address: event.target.value })
            }
            placeholder="Customer billing address"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Shipping Address</label>
          <textarea
            rows={2}
            className={areaClass}
            value={state.customerInformation.shippingAddress}
            onChange={(event) =>
              setCustomerInformation({ shippingAddress: event.target.value })
            }
            placeholder="Delivery / shipping address (if different)"
          />
        </div>

        <div>
          <label className={labelClass}>Customer Phone</label>
          <input
            className={inputClass}
            value={state.customerInformation.phone}
            onChange={(event) =>
              setCustomerInformation({ phone: event.target.value })
            }
            placeholder="Phone"
          />
        </div>
      </div>
    </TransactionSectionCard>
    <QuickAddCustomerModal
      open={quickAdd.open}
      keyword={quickAdd.keyword}
      onClose={() => setQuickAdd({ open: false, keyword: "" })}
      onSuccess={(customer) => {
        hydrateCustomer(customer);
        setQuickAdd({ open: false, keyword: "" });
      }}
    />
    </>
  );
}
