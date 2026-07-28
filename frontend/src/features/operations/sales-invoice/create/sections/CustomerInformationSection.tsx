import { useState } from "react";
import { Customer, CustomerShippingAddress, useLazyGetCustomerByIdQuery } from "@/redux/api/customerApi";
import { useLazySearchLookupQuery } from "@/redux/api/lookupApi";
import { LookupOption } from "@/shared/types/filtering";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import TransactionSectionCard from "@/features/operations/shared/TransactionSectionCard";
import QuickAddCustomerModal from "@/shared/components/quick-add/QuickAddCustomerModal";
import { useSalesInvoiceForm } from "../SalesInvoiceFormContext";

const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";
const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const areaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

function formatParts(parts: (string | null | undefined)[]) {
  return parts.filter(Boolean).join(", ");
}

function formatBillingAddress(customer: Customer) {
  return formatParts([
    customer.billingAddress.street,
    customer.billingAddress.city,
    customer.billingAddress.state,
    customer.billingAddress.pincode,
    customer.billingAddress.country,
  ]);
}

function formatShippingAddress(addr: CustomerShippingAddress) {
  return formatParts([
    addr.name,
    addr.street,
    addr.city,
    addr.state,
    addr.pincode,
    addr.country,
  ]);
}

export default function CustomerInformationSection() {
  const { state, setCustomerInformation } = useSalesInvoiceForm();
  const [searchLookup] = useLazySearchLookupQuery();
  const [getCustomerById] = useLazyGetCustomerByIdQuery();
  const [quickAdd, setQuickAdd] = useState({ open: false, keyword: "" });

  const hydrateCustomer = (customer: Customer) => {
    const gstinDoc = customer.taxDocuments.find((td) => td.taxType === "GST");
    const defaultShipping = customer.shippingAddresses[0];
    setCustomerInformation({
      customerId: customer.id,
      customerName: customer.basicDetails.name,
      address: formatBillingAddress(customer),
      customerGstinSnapshot: gstinDoc?.number ?? "",
      shippingAddress: defaultShipping ? formatShippingAddress(defaultShipping) : "",
    });
  };

  return (
    <>
    <TransactionSectionCard title="Customer Information">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className={labelClass}>Customer</label>
          <AutocompleteSelect
            value={state.customerInformation.customerName}
            className="bg-transparent"
            placeholder="Search customer"
            search={(keyword) =>
              searchLookup({ source: "customers", keyword, limit: 10 }).unwrap()
            }
            getItems={(result) => result}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) => item.label}
            onInputChange={(value) =>
              setCustomerInformation({
                customerId: null,
                customerName: value,
                address: "",
                customerGstinSnapshot: "",
                shippingAddress: "",
              })
            }
            onSelect={async (item: LookupOption | null) => {
              if (!item) {
                setCustomerInformation({
                  customerId: null,
                  customerName: "",
                  address: "",
                  customerGstinSnapshot: "",
                  shippingAddress: "",
                });
                return;
              }

              setCustomerInformation({ customerId: item.id, customerName: item.label });

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
          <label className={labelClass}>GSTIN</label>
          <input
            className={inputClass}
            value={state.customerInformation.customerGstinSnapshot}
            onChange={(event) =>
              setCustomerInformation({ customerGstinSnapshot: event.target.value })
            }
            placeholder="Customer GST registration number"
            maxLength={15}
          />
        </div>

        <div>
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

        <div>
          <label className={labelClass}>Shipping / Delivery Address</label>
          <textarea
            rows={2}
            className={areaClass}
            value={state.customerInformation.shippingAddress}
            onChange={(event) =>
              setCustomerInformation({ shippingAddress: event.target.value })
            }
            placeholder="Leave blank if same as billing address"
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
