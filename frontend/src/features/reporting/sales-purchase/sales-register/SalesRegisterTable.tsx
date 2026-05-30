import {
  SalesRegisterRow,
  SalesRegisterTotals,
} from "@/redux/api/salesRegisterReportApi";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

interface SalesRegisterTableProps {
  rows: SalesRegisterRow[];
  totals?: SalesRegisterTotals;
  isLoading: boolean;
  isError: boolean;
}

const money = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function SalesRegisterTable({
  rows,
  totals,
  isLoading,
  isError,
}: SalesRegisterTableProps) {
  if (isLoading) {
    return (
      <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
        Loading sales register...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-5 py-10 text-center text-sm text-error-500">
        Unable to load sales register.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.02]">
        <TableRow>
          {[
            "Date",
            "Invoice No",
            "Customer",
            "Reference",
            "Gross",
            "Discount",
            "Taxable",
            "Tax",
            "Net",
            "Outstanding",
            "Status",
          ].map((header) => (
            <TableCell
              key={header}
              isHeader
              className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400"
            >
              {header}
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
        {rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={11}
              className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
            >
              No sales invoices found for the selected filters.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                {row.invoiceDate}
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                {row.invoiceNo}
              </TableCell>
              <TableCell className="min-w-48 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                {row.customerName}
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {row.referenceNo || "-"}
              </TableCell>
              <AmountCell value={row.grossAmount} />
              <AmountCell value={row.discountAmount} />
              <AmountCell value={row.taxableAmount} />
              <AmountCell value={row.taxAmount} />
              <AmountCell value={row.netAmount} />
              <AmountCell value={row.outstandingAmount} />
              <TableCell className="whitespace-nowrap px-4 py-3 text-sm">
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {row.status}
                </span>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
      <TableFooter className="border-t border-gray-200 bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.03]">
        <TableRow>
          <TableCell className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-white/90">
            Total
          </TableCell>
          <TableCell className="px-4 py-3">{null}</TableCell>
          <TableCell className="px-4 py-3">{null}</TableCell>
          <TableCell className="px-4 py-3">{null}</TableCell>
          <AmountCell value={totals?.grossAmount ?? 0} isTotal />
          <AmountCell value={totals?.discountAmount ?? 0} isTotal />
          <AmountCell value={totals?.taxableAmount ?? 0} isTotal />
          <AmountCell value={totals?.taxAmount ?? 0} isTotal />
          <AmountCell value={totals?.netAmount ?? 0} isTotal />
          <AmountCell value={totals?.outstandingAmount ?? 0} isTotal />
          <TableCell className="px-4 py-3">{null}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

function AmountCell({
  value,
  isTotal = false,
}: {
  value: number;
  isTotal?: boolean;
}) {
  return (
    <TableCell
      className={`whitespace-nowrap px-4 py-3 text-right text-sm ${
        isTotal
          ? "font-semibold text-gray-900 dark:text-white"
          : "text-gray-700 dark:text-gray-300"
      }`}
    >
      {money.format(value)}
    </TableCell>
  );
}
