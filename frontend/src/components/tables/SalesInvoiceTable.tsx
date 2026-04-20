import { SalesInvoiceListItem } from "../../app/api/salesInvoiceApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface SalesInvoiceTableProps {
  salesInvoices: SalesInvoiceListItem[];
  isLoading: boolean;
  isError: boolean;
}

function formatDate(value: string, includeTime = false) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  });
}

export default function SalesInvoiceTable({
  salesInvoices,
  isLoading,
  isError,
}: SalesInvoiceTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">
        Loading sales invoices...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error loading sales invoices.
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
                  SI No
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Date
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Customer
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Net Total
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Created
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Updated
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {salesInvoices.map((salesInvoice) => (
                <TableRow key={salesInvoice.id}>
                  <TableCell className="px-5 py-4 text-start text-theme-sm font-medium text-gray-800 dark:text-white/90">
                    {salesInvoice.no}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {formatDate(salesInvoice.date)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {salesInvoice.customerName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {salesInvoice.netTotal.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        salesInvoice.status === "Draft"
                          ? "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400"
                          : salesInvoice.status === "Submitted"
                            ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {salesInvoice.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {formatDate(salesInvoice.createdAtUtc, true)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {formatDate(salesInvoice.updatedAtUtc, true)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {salesInvoices.length === 0 ? (
        <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
          No sales invoices yet. Use "Add +" to create the first one.
        </div>
      ) : null}
    </div>
  );
}
