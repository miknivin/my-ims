import {
  LedgerGroup,
  useDeleteLedgerGroupMutation,
  useGetLedgerGroupsQuery,
} from "../../app/api/ledgerGroupApi";
import MasterTableActions from "./shared/MasterTableActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface LedgerGroupTableProps {
  onEdit: (ledgerGroup: LedgerGroup) => void;
}

export default function LedgerGroupTable({ onEdit }: LedgerGroupTableProps) {
  const { data: ledgerGroups = [], isLoading, isError } = useGetLedgerGroupsQuery();
  const [deleteLedgerGroup, { isLoading: isDeleting }] = useDeleteLedgerGroupMutation();

  const handleDelete = async (ledgerGroup: LedgerGroup) => {
    const shouldDelete = window.confirm(`Delete ledger group "${ledgerGroup.name}"?`);
    if (!shouldDelete) {
      return;
    }

    await deleteLedgerGroup(ledgerGroup.id).unwrap();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">
        Loading ledger groups...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error loading ledger groups.
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
                  Code
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Nature
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Parent Group
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
              {ledgerGroups.map((ledgerGroup) => (
                <TableRow key={ledgerGroup.id}>
                  <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                    {ledgerGroup.code}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {ledgerGroup.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {ledgerGroup.nature}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {ledgerGroup.parentGroupName ?? "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        ledgerGroup.status === "Active"
                          ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {ledgerGroup.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <MasterTableActions
                      isDeleting={isDeleting || ledgerGroup.isSystem}
                      onEdit={() => {
                        if (!ledgerGroup.isSystem) {
                          onEdit(ledgerGroup);
                        }
                      }}
                      onDelete={() => {
                        if (!ledgerGroup.isSystem) {
                          void handleDelete(ledgerGroup);
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {ledgerGroups.length === 0 ? (
        <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
          No ledger groups yet. Use "Add +" to create the first one.
        </div>
      ) : null}
    </div>
  );
}
