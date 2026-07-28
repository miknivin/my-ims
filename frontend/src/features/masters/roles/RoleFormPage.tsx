import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useGetRoleByIdQuery,
} from "@/redux/api/roleApi";
import type { RolePermissions } from "@/redux/api/roleApi";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import Button from "@/shared/components/ui/button/Button";
import {
  PERMISSION_SCHEMA,
  PERMISSION_TEMPLATES,
  PERMISSION_ACTIONS,
} from "./permissionSchema";

const ACTION_LABELS: Record<string, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
};

function hasAction(perms: RolePermissions, key: string, action: string) {
  return perms[key]?.includes(action) ?? false;
}

function toggleAction(
  perms: RolePermissions,
  key: string,
  action: string,
): RolePermissions {
  const current = perms[key] ?? [];
  const next = current.includes(action)
    ? current.filter((a) => a !== action)
    : [...current, action];
  return { ...perms, [key]: next };
}

function setRowActions(
  perms: RolePermissions,
  key: string,
  actions: string[],
): RolePermissions {
  return { ...perms, [key]: actions };
}

export default function RoleFormPage() {
  const { roleId } = useParams<{ roleId: string }>();
  const isEdit = Boolean(roleId);
  const navigate = useNavigate();

  const { data: existing, isLoading: isLoadingExisting } = useGetRoleByIdQuery(
    roleId!,
    {
      skip: !isEdit,
    },
  );

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<RolePermissions>({});
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setPermissions(existing.permissions ?? {});
    }
  }, [existing]);

  const applyTemplate = (templateName: string) => {
    setSelectedTemplate(templateName);
    if (templateName && PERMISSION_TEMPLATES[templateName]) {
      setPermissions(PERMISSION_TEMPLATES[templateName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Role name is required.");
      return;
    }
    setError("");

    try {
      if (isEdit && roleId) {
        await updateRole({
          id: roleId,
          name: name.trim(),
          permissions,
        }).unwrap();
      } else {
        await createRole({ name: name.trim(), permissions }).unwrap();
      }
      navigate("/masters/roles");
    } catch {
      setError("Failed to save role. Please try again.");
    }
  };

  const isSaving = isCreating || isUpdating;

  if (isEdit && isLoadingExisting) {
    return (
      <div className="p-8 text-sm text-gray-500 dark:text-gray-400">
        Loading role...
      </div>
    );
  }

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle={isEdit ? "Edit Role" : "New Role"} />

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-6">
        {/* Header card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role Name <span className="text-error-500">*</span>
              </label>
              <input
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sales Person"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Apply Template
              </label>
              <select
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                value={selectedTemplate}
                onChange={(e) => applyTemplate(e.target.value)}
              >
                <option value="">— select a template —</option>
                {Object.keys(PERMISSION_TEMPLATES).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Selecting a template will overwrite current checkboxes.
              </p>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-500 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Permission matrix */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="border-b border-gray-100 px-6 py-4 dark:border-white/[0.05]">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Access Permissions
            </h2>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              Check the actions each role is allowed to perform per module.
            </p>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[80vh]">
            <table className="w-full min-w-[600px]">
              <thead className="sticky top-0 z-10 bg-white dark:bg-gray-900">
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 w-64">
                    Module
                  </th>
                  {PERMISSION_ACTIONS.map((action) => (
                    <th
                      key={action}
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 w-24"
                    >
                      {ACTION_LABELS[action]}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 w-24">
                    All
                  </th>
                </tr>
              </thead>
              <tbody>
                {PERMISSION_SCHEMA.map((group) => (
                  <>
                    {/* Group header */}
                    <tr
                      key={group.group}
                      className="bg-gray-50 dark:bg-white/[0.02]"
                    >
                      <td
                        colSpan={PERMISSION_ACTIONS.length + 2}
                        className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        {group.group}
                      </td>
                    </tr>

                    {group.modules.map((mod) => {
                      const moduleActions = mod.actions;
                      const checkedActions = permissions[mod.key] ?? [];
                      const allChecked = moduleActions.every((a) =>
                        checkedActions.includes(a),
                      );

                      return (
                        <tr
                          key={mod.key}
                          className="border-t border-gray-100 transition hover:bg-gray-50 dark:border-white/[0.04] dark:hover:bg-white/[0.02]"
                        >
                          <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {mod.label}
                          </td>
                          {PERMISSION_ACTIONS.map((action) => {
                            const isAvailable = moduleActions.includes(action);
                            const isChecked =
                              isAvailable &&
                              hasAction(permissions, mod.key, action);

                            return (
                              <td
                                key={action}
                                className="px-4 py-3 text-center"
                              >
                                {isAvailable ? (
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() =>
                                      setPermissions((p) =>
                                        toggleAction(p, mod.key, action),
                                      )
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600"
                                  />
                                ) : (
                                  <span className="text-gray-200 dark:text-gray-700">
                                    —
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          {/* Select All toggle for this row */}
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={allChecked}
                              onChange={() =>
                                setPermissions((p) =>
                                  setRowActions(
                                    p,
                                    mod.key,
                                    allChecked ? [] : [...moduleActions],
                                  ),
                                )
                              }
                              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/masters/roles")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? "Saving..." : isEdit ? "Update Role" : "Create Role"}
          </Button>
        </div>
      </form>
    </div>
  );
}
