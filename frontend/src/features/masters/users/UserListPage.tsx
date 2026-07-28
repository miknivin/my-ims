import { useState } from "react";
import { useNavigate } from "react-router";
import { useGetUsersQuery, useDeleteUserMutation } from "@/redux/api/userApi";
import { useGetSessionQuery } from "@/redux/api/authApi";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import ComponentCard from "@/shared/components/common/ComponentCard";
import Button from "@/shared/components/ui/button/Button";
import ConfirmAlert from "@/shared/components/ui/alert/ConfirmAlert";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/shared/components/ui/table";

export default function UserListPage() {
  const navigate = useNavigate();
  const { data: users = [], isLoading, isError } = useGetUsersQuery();
  const { data: session } = useGetSessionQuery();
  const currentUserId = session?.user.id;
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmUser = users.find((u) => u.id === confirmId);

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await deleteUser(confirmId).unwrap();
      setConfirmId(null);
    } catch {
      setError("Cannot delete this user.");
      setConfirmId(null);
    }
  };

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Users" />

      <div className="my-5 flex w-full items-center justify-end">
        <Button size="sm" variant="primary" onClick={() => navigate("/masters/users/new")}>
          Add +
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
          <button type="button" className="ml-2 underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      <ComponentCard title="Users" desc="">
        {isLoading ? (
          <div className="p-6 text-sm text-gray-500 dark:text-gray-400">Loading users...</div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-500">Error loading users.</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Role
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Department
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="px-5 py-4">
                      <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {user.employeeCode}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.role}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.department}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.isActive
                            ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                            : "bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-gray-400"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => navigate(`/masters/users/${user.id}/edit`)}
                          className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        {user.id !== currentUserId && (
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => setConfirmId(user.id)}
                            className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-sm text-gray-400 dark:text-gray-500">
                      No users yet. Click "Add +" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </ComponentCard>

      {confirmId && confirmUser && (
        <ConfirmAlert
          open
          title="Delete user?"
          message={`Delete "${confirmUser.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          isConfirming={isDeleting}
          onConfirm={() => void handleDelete()}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
