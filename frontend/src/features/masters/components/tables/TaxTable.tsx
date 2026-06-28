import { useState } from "react";
import {
  Tax,
  useDeleteTaxMutation,
  useGetTaxesQuery,
} from "@/redux/api/taxApi";
import DeleteAlert from "@/shared/components/ui/alert/DeleteAlert";
import MasterTableActions from "./shared/MasterTableActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

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
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
              {taxes.map((tax) => {
                const isExpanded = expandedId === tax.id;
                const hasSlab = tax.type === "slab" && tax.slabs.length > 0;

                return (
                  <>
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
                        {hasSlab ? (
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : tax.id)}
                            className="flex items-center gap-1 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                          >
                            <span>{tax.slabs.length} slab{tax.slabs.length === 1 ? "" : "s"}</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        ) : (
                          tax.rate ?? "-"
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[tax.status]}`}>
                          {tax.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm">
                        <MasterTableActions
                          isDeleting={isDeleting}
                          onEdit={() => onEdit(tax)}
                          onDelete={() => setDeleteTarget({ id: tax.id, name: tax.name })}
                        />
                      </TableCell>
                    </TableRow>

                    {hasSlab && isExpanded ? (
                      <TableRow key={`${tax.id}-slabs`}>
                        <TableCell
                          colSpan={6}
                          className="bg-gray-50 px-5 py-3 dark:bg-white/[0.02]"
                        >
                          <div className="flex flex-wrap gap-2">
                            {tax.slabs
                              .slice()
                              .sort((a, b) => a.fromAmount - b.fromAmount)
                              .map((slab) => (
                                <div
                                  key={slab.id}
                                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800"
                                >
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {slab.fromAmount.toLocaleString()}
                                    <span className="mx-1">–</span>
                                    {slab.toAmount.toLocaleString()}
                                  </span>
                                  <span className="rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                                    {slab.rate}%
                                  </span>
                                </div>
                              ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      {taxes.length === 0 ? (
        <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
          No tax records yet. Use "Add +" to create the first one.
        </div>
      ) : null}
      <DeleteAlert
        open={!!deleteTarget}
        name={deleteTarget?.name ?? ""}
        onConfirm={async () => { await deleteTax(deleteTarget!.id).unwrap(); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
