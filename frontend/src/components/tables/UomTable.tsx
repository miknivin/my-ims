import {
  Uom,
  useDeleteUomMutation,
  useGetUomsQuery,
  useUpdateUomMutation,
} from "../../app/api/uomApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface UomTableProps {
  onEdit: (uom: Uom) => void;
}

export default function UomTable({ onEdit }: UomTableProps) {
  const { data: uoms = [], isLoading, isError } = useGetUomsQuery();
  const [updateUom, { isLoading: isUpdating }] = useUpdateUomMutation();
  const [deleteUom, { isLoading: isDeleting }] = useDeleteUomMutation();

  const handleToggle = async (uom: Uom) => {
    await updateUom({
      id: uom.id,
      code: uom.code,
      name: uom.name,
      status: uom.status === "Active" ? "Inactive" : "Active",
    }).unwrap();
  };

  const handleDelete = async (uom: Uom) => {
    const shouldDelete = window.confirm(`Delete UOM "${uom.name}"?`);
    if (!shouldDelete) {
      return;
    }

    await deleteUom(uom.id).unwrap();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">
        Loading UOMs...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error loading UOMs.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[760px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Code
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {uoms.map((uom) => (
                <TableRow key={uom.id}>
                  <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                    {uom.code}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    {uom.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={uom.status === "Active"}
                        onChange={() => void handleToggle(uom)}
                        className="peer sr-only"
                        disabled={isUpdating}
                      />
                      <div className="relative h-6 w-11 rounded-full bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800 dark:peer-checked:bg-blue-600 rtl:peer-checked:after:-translate-x-full" />
                      <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {uom.status}
                      </span>
                    </label>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(uom)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => void handleDelete(uom)}
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
      {uoms.length === 0 ? (
        <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
          No UOM records yet. Use "Add +" to create the first one.
        </div>
      ) : null}
    </div>
  );
}
