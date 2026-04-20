import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../ui/table";
import { formatDate, getStatusClass } from "./types";

interface BillWiseDocumentListBase {
  id: string;
  no: string;
  date: string;
  amount: number;
  totalAllocated: number;
  totalDiscount: number;
  advance: number;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

interface BillWiseDocumentTableProps<TRow extends BillWiseDocumentListBase> {
  rows: TRow[];
  isLoading: boolean;
  isError: boolean;
  documentLabel: string;
  partyLabel: string;
  emptyMessage: string;
  getPartyName: (row: TRow) => string;
}

export default function BillWiseDocumentTable<
  TRow extends BillWiseDocumentListBase,
>({
  rows,
  isLoading,
  isError,
  documentLabel,
  partyLabel,
  emptyMessage,
  getPartyName,
}: BillWiseDocumentTableProps<TRow>) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">
        Loading records...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error loading records.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1120px]">
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
                  {partyLabel}
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Amount
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Allocated
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Discount
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Advance
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Updated
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="px-5 py-4 text-start text-theme-sm font-medium text-gray-800 dark:text-white/90">
                    {row.no}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {formatDate(row.date)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {getPartyName(row)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-end text-theme-sm text-gray-500 dark:text-gray-400">
                    {row.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-end text-theme-sm text-gray-500 dark:text-gray-400">
                    {row.totalAllocated.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-end text-theme-sm text-gray-500 dark:text-gray-400">
                    {row.totalDiscount.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-end text-theme-sm text-gray-500 dark:text-gray-400">
                    {row.advance.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(row.status)}`}
                    >
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {formatDate(row.updatedAtUtc, true)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
          {emptyMessage}
        </div>
      ) : null}
    </div>
  );
}
