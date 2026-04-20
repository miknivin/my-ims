import { Customer, useLazyGetCustomerByIdQuery } from "../../../../../app/api/customerApi";
import { useLazySearchLookupQuery } from "../../../../../app/api/lookupApi";
import { LookupOption } from "../../../../../types/filtering";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import TransactionSectionCard from "../../shared/TransactionSectionCard";
import { useSalesInvoiceForm } from "../SalesInvoiceFormContext";

const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";
const areaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

function formatBillingAddress(customer: Customer) {
  return [
    customer.billingAddress.street,
    customer.billingAddress.city,
    customer.billingAddress.state,
    customer.billingAddress.pincode,
    customer.billingAddress.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function CustomerInformationSection() {
  const { state, setCustomerInformation } = useSalesInvoiceForm();
  const [searchLookup] = useLazySearchLookupQuery();
  const [getCustomerById] = useLazyGetCustomerByIdQuery();

  return (
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
              })
            }
            onSelect={async (item: LookupOption | null) => {
              if (!item) {
                setCustomerInformation({
                  customerId: null,
                  customerName: "",
                  address: "",
                });
                return;
              }

              setCustomerInformation({
                customerId: item.id,
                customerName: item.label,
              });

              try {
                const customer = await getCustomerById(item.id).unwrap();
                setCustomerInformation({
                  customerId: customer.id,
                  customerName: customer.basicDetails.name,
                  address: formatBillingAddress(customer),
                });
              } catch {
                // Keep the selected customer label if detail hydration fails.
              }
            }}
          />
        </div>

        <div>
          <label className={labelClass}>Customer Address</label>
          <textarea
            rows={3}
            className={areaClass}
            value={state.customerInformation.address}
            onChange={(event) =>
              setCustomerInformation({ address: event.target.value })
            }
            placeholder="Customer billing address"
          />
        </div>
      </div>
    </TransactionSectionCard>
  );
}
