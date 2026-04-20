import { Warehouse, useDeleteWarehouseMutation, useGetWarehousesQuery } from "../../app/api/warehouseApi";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

export default function WarehouseTable({ onEdit }: { onEdit: (warehouse: Warehouse) => void }) {
  const { data: warehouses = [], isLoading, isError } = useGetWarehousesQuery();
  const [deleteWarehouse, { isLoading: isDeleting }] = useDeleteWarehouseMutation();

  if (isLoading) {
    return <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">Loading warehouses...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-600 dark:text-red-400">Error loading warehouses.</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[980px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Code</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Name</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Contact</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Phone</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {warehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">{warehouse.code}</TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">{warehouse.name}</TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">{warehouse.contactPerson ?? "-"}</TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">{warehouse.phone ?? "-"}</TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${warehouse.status === "Active" ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>{warehouse.status}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onEdit(warehouse)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Edit</button>
                      <button
                        onClick={() => void deleteWarehouse(warehouse.id).unwrap()}
                        disabled={isDeleting}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {warehouses.length === 0 ? <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">No warehouse records yet. Use "Add +" to create the first one.</div> : null}
    </div>
  );
}
