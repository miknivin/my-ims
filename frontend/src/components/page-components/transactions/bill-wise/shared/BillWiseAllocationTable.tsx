import TransactionSectionCard from "../../shared/TransactionSectionCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../ui/table";
import {
  BillWiseAllocationRow,
  formatDate,
  getOutstandingAfter,
} from "./types";

const inputClass =
  "h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

interface BillWiseAllocationTableProps {
  title: string;
  documentLabel: string;
  rows: BillWiseAllocationRow[];
  isLoading: boolean;
  emptyMessage: string;
  onPaidAmountChange: (sourceId: string, value: string) => void;
  onDiscountAmountChange: (sourceId: string, value: string) => void;
}

export default function BillWiseAllocationTable({
  title,
  documentLabel,
  rows,
  isLoading,
  emptyMessage,
  onPaidAmountChange,
  onDiscountAmountChange,
}: BillWiseAllocationTableProps) {
  return (
    <TransactionSectionCard title={title}>
      {isLoading ? (
        <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">
          Loading allocations...
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.08] dark:text-gray-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1240px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      {documentLabel}
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      Date
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      Due Date
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      Reference
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      Original
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      Outstanding
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      Paid
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      Discount
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      Balance After
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {rows.map((row) => (
                    <TableRow key={row.sourceId}>
                      <TableCell className="px-5 py-4 text-start text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {row.sourceNo}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {formatDate(row.sourceDate)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {row.sourceDueDate ? formatDate(row.sourceDueDate) : "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {row.sourceReferenceNo || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {row.description || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-end text-theme-sm text-gray-500 dark:text-gray-400">
                        {row.originalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-end text-theme-sm text-gray-500 dark:text-gray-400">
                        {row.outstandingBalance.toFixed(2)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={inputClass}
                          value={row.paidAmount}
                          onChange={(event) =>
                            onPaidAmountChange(row.sourceId, event.target.value)
                          }
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={inputClass}
                          value={row.discountAmount}
                          onChange={(event) =>
                            onDiscountAmountChange(
                              row.sourceId,
                              event.target.value,
                            )
                          }
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-end text-theme-sm text-gray-500 dark:text-gray-400">
                        {getOutstandingAfter(row).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </TransactionSectionCard>
  );
}
