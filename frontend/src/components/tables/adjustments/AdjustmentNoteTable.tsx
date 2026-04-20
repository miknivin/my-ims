import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

export interface AdjustmentNoteTableRow {
  id: string;
  no: string;
  date: string;
  counterpartyName: string;
  noteNature: string;
  inventoryEffect: string;
  netTotal: number;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

interface AdjustmentNoteTableProps {
  notes: AdjustmentNoteTableRow[];
  isLoading: boolean;
  isError: boolean;
  documentLabel: string;
  counterpartyLabel: string;
  emptyMessage: string;
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

function getStatusClass(status: string) {
  if (status === "Draft" || status === "Pending") {
    return "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400";
  }

  if (status === "Submitted" || status === "Completed") {
    return "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400";
  }

  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

export default function AdjustmentNoteTable({
  notes,
  isLoading,
  isError,
  documentLabel,
  counterpartyLabel,
  emptyMessage,
}: AdjustmentNoteTableProps) {
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
        <div className="min-w-[1160px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  {documentLabel}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Date
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  {counterpartyLabel}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Nature
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Inventory
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
              {notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="px-5 py-4 text-start text-theme-sm font-medium text-gray-800 dark:text-white/90">
                    {note.no}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {formatDate(note.date)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {note.counterpartyName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {note.noteNature}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {note.inventoryEffect}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {note.netTotal.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(note.status)}`}
                    >
                      {note.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {formatDate(note.createdAtUtc, true)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {formatDate(note.updatedAtUtc, true)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
          {emptyMessage}
        </div>
      ) : null}
    </div>
  );
}
