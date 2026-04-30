import {
  Discount,
  useDeleteDiscountMutation,
  useGetDiscountsQuery,
} from "../../app/api/discountApi";
import MasterTableActions from "./shared/MasterTableActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface DiscountTableProps {
  onEdit: (discount: Discount) => void;
}

export default function DiscountTable({ onEdit }: DiscountTableProps) {
  const { data: discounts = [], isLoading, isError } = useGetDiscountsQuery();
  const [deleteDiscount, { isLoading: isDeleting }] = useDeleteDiscountMutation();

  const handleDelete = async (discount: Discount) => {
    const shouldDelete = window.confirm(`Delete discount "${discount.name}"?`);
    if (!shouldDelete) {
      return;
    }

    await deleteDiscount(discount.id).unwrap();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">
        Loading discounts...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error loading discounts.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[920px]">
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
                  Type
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Value
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
              {discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                    {discount.code}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    <div className="font-medium text-gray-800 dark:text-white/90">{discount.name}</div>
                    {discount.description ? (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {discount.description}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm capitalize text-gray-500 dark:text-gray-400">
                    {discount.type}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {discount.type === "percentage" ? `${discount.value}%` : discount.value}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        discount.status === "Active"
                          ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {discount.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <MasterTableActions
                      isDeleting={isDeleting}
                      onEdit={() => onEdit(discount)}
                      onDelete={() => void handleDelete(discount)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {discounts.length === 0 ? (
        <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
          No discount records yet. Use "Add +" to create the first one.
        </div>
      ) : null}
    </div>
  );
}
