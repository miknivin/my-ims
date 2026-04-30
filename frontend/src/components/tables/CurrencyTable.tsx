import {
  Currency,
  useDeleteCurrencyMutation,
  useGetCurrenciesQuery,
} from "../../app/api/currencyApi";
import MasterTableActions from "./shared/MasterTableActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface CurrencyTableProps {
  onEdit: (currency: Currency) => void;
}

export default function CurrencyTable({ onEdit }: CurrencyTableProps) {
  const { data: currencies = [], isLoading, isError } = useGetCurrenciesQuery();
  const [deleteCurrency, { isLoading: isDeleting }] = useDeleteCurrencyMutation();

  const handleDelete = async (currency: Currency) => {
    const shouldDelete = window.confirm(`Delete currency "${currency.name}"?`);
    if (!shouldDelete) {
      return;
    }

    await deleteCurrency(currency.id).unwrap();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">
        Loading currencies...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error loading currencies.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[860px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Code
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Symbol
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {currencies.map((currency) => (
                <TableRow key={currency.id}>
                  <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                    {currency.code}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {currency.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {currency.symbol}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        currency.status === "Active"
                          ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {currency.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <MasterTableActions
                      isDeleting={isDeleting}
                      onEdit={() => onEdit(currency)}
                      onDelete={() => void handleDelete(currency)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {currencies.length === 0 ? (
        <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
          No currency records yet. Use "Add +" to create the first one.
        </div>
      ) : null}
    </div>
  );
}
