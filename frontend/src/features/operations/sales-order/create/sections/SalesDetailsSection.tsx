import { useLazySearchLookupQuery } from "@/redux/api/lookupApi";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import TransactionSectionCard from "@/features/operations/shared/TransactionSectionCard";
import { useSalesOrderForm } from "../SalesOrderFormContext";

export default function SalesDetailsSection() {
  const { state, setSalesDetails } = useSalesOrderForm();
  const [searchSalespersons] = useLazySearchLookupQuery();

  return (
    <TransactionSectionCard title="Sales Details">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Salesman
        </label>
        <AutocompleteSelect
          value={state.salesDetails.salesMan}
          className="bg-transparent"
          placeholder="Search salesperson"
          search={(keyword) =>
            searchSalespersons({ source: "salespersons", keyword }).unwrap()
          }
          getItems={(result) => result}
          getOptionKey={(item) => item.id}
          getOptionLabel={(item) => item.label}
          onInputChange={(value) =>
            setSalesDetails({ salesManId: null, salesMan: value })
          }
          onSelect={(item) =>
            setSalesDetails({
              salesManId: item?.id ?? null,
              salesMan: item?.label ?? "",
            })
          }
        />
      </div>
    </TransactionSectionCard>
  );
}
