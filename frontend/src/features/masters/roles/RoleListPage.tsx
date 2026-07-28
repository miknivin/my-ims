import { useState } from "react";
import { useNavigate } from "react-router";
import { useGetRolesQuery, useDeleteRoleMutation } from "@/redux/api/roleApi";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import ComponentCard from "@/shared/components/common/ComponentCard";
import Button from "@/shared/components/ui/button/Button";
import ConfirmAlert from "@/shared/components/ui/alert/ConfirmAlert";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/shared/components/ui/table";

export default function RoleListPage() {
  const navigate = useNavigate();
  const { data: roles = [], isLoading, isError } = useGetRolesQuery();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmRole = roles.find((r) => r.id === confirmId);

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await deleteRole(confirmId).unwrap();
      setConfirmId(null);
    } catch {
      setError("Cannot delete — role may be assigned to users.");
      setConfirmId(null);
    }
  };

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Roles" />

      <div className="my-5 flex w-full items-center justify-end">
        <Button size="sm" variant="primary" onClick={() => navigate("/masters/roles/new")}>
          Add +
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
          <button type="button" className="ml-2 underline" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <ComponentCard title="Roles" desc="">
        {isLoading ? (
          <div className="p-6 text-sm text-gray-500 dark:text-gray-400">Loading roles...</div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-500">Error loading roles.</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Role Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {role.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => navigate(`/masters/roles/${role.id}/edit`)}
                          className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => setConfirmId(role.id)}
                          className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                          </svg>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {roles.length === 0 && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-sm text-gray-400 dark:text-gray-500">
                      No roles yet. Click "Add +" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </ComponentCard>

      {confirmId && confirmRole && (
        <ConfirmAlert
          open
          title="Delete role?"
          message={`Delete "${confirmRole.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          isConfirming={isDeleting}
          onConfirm={() => void handleDelete()}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
