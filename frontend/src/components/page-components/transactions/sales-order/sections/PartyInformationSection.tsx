import {
  CustomerListItem,
  useLazyGetCustomerByIdQuery,
  useLazyGetCustomersQuery,
} from "../../../../../app/api/customerApi";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import TransactionSectionCard from "../../shared/TransactionSectionCard";
import { useSalesOrderForm } from "../SalesOrderFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";
const areaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

function formatCustomerAddress(customer: {
  billingAddress: {
    street: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    country: string | null;
  };
}) {
  const parts = [
    customer.billingAddress.street,
    customer.billingAddress.city,
    customer.billingAddress.state,
    customer.billingAddress.pincode,
    customer.billingAddress.country,
  ].filter(Boolean);

  return parts.join(", ");
}

export default function PartyInformationSection() {
  const { state, setPartyInformation, setCommercialDetails } = useSalesOrderForm();
  const [searchCustomers] = useLazyGetCustomersQuery();
  const [getCustomerById] = useLazyGetCustomerByIdQuery();

  return (
    <TransactionSectionCard title="Party Information">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Customer</label>
          <AutocompleteSelect
            value={state.partyInformation.customerName}
            className="bg-transparent"
            placeholder="Search customer"
            search={(keyword) =>
              searchCustomers({ keyword, page: 1, limit: 10 }).unwrap()
            }
            getItems={(result) => result.items}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) =>
              `${item.basicDetails.name} (${item.basicDetails.code})`
            }
            onInputChange={(value) =>
              setPartyInformation({
                customerId: null,
                customerName: value,
                customerCode: "",
                address: "",
              })
            }
            onSelect={async (customer: CustomerListItem | null) => {
              if (!customer) {
                setPartyInformation({ customerId: null, customerCode: "" });
                return;
              }

              setPartyInformation({
                customerId: customer.id,
                customerName: customer.basicDetails.name,
                customerCode: customer.basicDetails.code,
                address: "",
                attention: "",
              });

              if (customer.salesAndPricing.priceLevel !== "Special") {
                setCommercialDetails({
                  rateLevel: customer.salesAndPricing.priceLevel,
                });
              }

              setCommercialDetails({
                creditLimit: `${customer.financials.creditLimit ?? 0}`,
              });

              try {
                const customerDetail = await getCustomerById(customer.id).unwrap();
                setPartyInformation({
                  address: formatCustomerAddress(customerDetail),
                });
              } catch {
                // Keep the selected customer even if detail hydration fails.
              }
            }}
          />
        </div>

        <div>
          <label className={labelClass}>Attention</label>
          <input
            className={inputClass}
            value={state.partyInformation.attention}
            onChange={(event) =>
              setPartyInformation({ attention: event.target.value })
            }
            placeholder="Contact person"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Address</label>
          <textarea
            rows={3}
            className={areaClass}
            value={state.partyInformation.address}
            onChange={(event) =>
              setPartyInformation({ address: event.target.value })
            }
            placeholder="Customer billing or delivery address"
          />
        </div>
      </div>
    </TransactionSectionCard>
  );
}
