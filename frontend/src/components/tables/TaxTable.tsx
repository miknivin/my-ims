import {
  Tax,
  useDeleteTaxMutation,
  useGetTaxesQuery,
} from "../../app/api/taxApi";
import MasterTableActions from "./shared/MasterTableActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface TaxTableProps {
  onEdit: (tax: Tax) => void;
}

const statusClasses: Record<Tax["status"], string> = {
  Active: "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400",
  Inactive: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Draft: "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400",
};

export default function TaxTable({ onEdit }: TaxTableProps) {
  const { data: taxes = [], isLoading, isError } = useGetTaxesQuery();
  const [deleteTax, { isLoading: isDeleting }] = useDeleteTaxMutation();

  const handleDelete = async (tax: Tax) => {
    const shouldDelete = window.confirm(`Delete tax "${tax.name}"?`);
    if (!shouldDelete) {
      return;
    }

    await deleteTax(tax.id).unwrap();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">
        Loading taxes...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error loading taxes.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[980px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Code
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Type
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Rate / Slabs
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
              {taxes.map((tax) => (
                <TableRow key={tax.id}>
                  <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                    <div className="font-medium">{tax.name}</div>
                    {tax.description ? (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {tax.description}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {tax.code}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm capitalize text-gray-500 dark:text-gray-400">
                    {tax.type}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {tax.type === "slab"
                      ? `${tax.slabs.length} slab${tax.slabs.length === 1 ? "" : "s"}`
                      : tax.rate ?? "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[tax.status]}`}
                    >
                      {tax.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <MasterTableActions
                      isDeleting={isDeleting}
                      onEdit={() => onEdit(tax)}
                      onDelete={() => void handleDelete(tax)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {taxes.length === 0 ? (
        <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
          No tax records yet. Use "Add +" to create the first one.
        </div>
      ) : null}
    </div>
  );
}
