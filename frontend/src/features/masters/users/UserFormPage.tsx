import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} from "@/redux/api/userApi";
import { useGetRolesQuery } from "@/redux/api/roleApi";
import type { RoleListItem } from "@/redux/api/roleApi";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import Button from "@/shared/components/ui/button/Button";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import CodeInput from "@/shared/components/form/CodeInput";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";

interface FormState {
  employeeCode: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: string;
  department: string;
  designation: string;
  isActive: boolean;
  changePassword: boolean;
}

const empty: FormState = {
  employeeCode: "",
  name: "",
  email: "",
  mobile: "",
  password: "",
  role: "",
  department: "",
  designation: "",
  isActive: true,
  changePassword: false,
};

export default function UserFormPage() {
  const { userId } = useParams<{ userId: string }>();
  const isEdit = Boolean(userId);
  const navigate = useNavigate();

  const { data: users = [] } = useGetUsersQuery();
  const { data: roles = [] } = useGetRolesQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [form, setForm] = useState<FormState>(empty);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit && userId) {
      const existing = users.find((u) => u.id === userId);
      if (existing) {
        setForm({
          employeeCode: existing.employeeCode,
          name: existing.name,
          email: existing.email,
          mobile: existing.mobile,
          password: "",
          role: existing.role,
          department: existing.department,
          designation: existing.designation,
          isActive: existing.isActive,
          changePassword: false,
        });
      }
    }
  }, [isEdit, userId, users]);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.mobile.trim() || !form.role) {
      setError("Name, email, mobile, and role are required.");
      return;
    }
    if (!isEdit && !form.password) {
      setError("Password is required.");
      return;
    }
    if (!isEdit && !form.employeeCode.trim()) {
      setError("Employee code is required.");
      return;
    }
    if ((isEdit ? form.changePassword : true) && form.password && form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      if (isEdit && userId) {
        await updateUser({
          id: userId,
          name: form.name,
          email: form.email,
          mobile: form.mobile,
          role: form.role,
          department: form.department,
          designation: form.designation,
          isActive: form.isActive,
          password: form.changePassword && form.password ? form.password : undefined,
        }).unwrap();
      } else {
        await createUser({
          employeeCode: form.employeeCode,
          name: form.name,
          email: form.email,
          mobile: form.mobile,
          password: form.password,
          role: form.role,
          department: form.department,
          designation: form.designation,
          isActive: form.isActive,
        }).unwrap();
      }
      navigate("/masters/users");
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message;
      setError(msg ?? "Failed to save user. Please try again.");
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle={isEdit ? "Edit User" : "New User"} />

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {!isEdit && (
              <div>
                <CodeInput
                  entity="user"
                  label="Employee Code"
                  required
                  value={form.employeeCode}
                  onChange={(value) => set({ employeeCode: value })}
                  placeholder="e.g. EMP001"
                />
              </div>
            )}

            <div>
              <label className={labelClass}>
                Name <span className="text-error-500">*</span>
              </label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="Full name"
                autoFocus={isEdit}
              />
            </div>

            <div>
              <label className={labelClass}>
                Email <span className="text-error-500">*</span>
              </label>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => set({ email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className={labelClass}>
                Mobile <span className="text-error-500">*</span>
              </label>
              <input
                className={inputClass}
                value={form.mobile}
                onChange={(e) => set({ mobile: e.target.value })}
                placeholder="Mobile number"
              />
            </div>

            <div>
              <label className={labelClass}>
                Role <span className="text-error-500">*</span>
              </label>
              <AutocompleteSelect<RoleListItem, RoleListItem[]>
                value={form.role}
                className="bg-transparent"
                placeholder="Search role"
                search={(keyword) => {
                  const kw = keyword.toLowerCase();
                  return Promise.resolve(
                    roles.filter((r) => r.name.toLowerCase().includes(kw)),
                  );
                }}
                getItems={(result) => result}
                getOptionKey={(r) => r.id}
                getOptionLabel={(r) => r.name}
                onInputChange={(value) => set({ role: value })}
                onSelect={(r) => set({ role: r?.name ?? "" })}
              />
            </div>

            <div>
              <label className={labelClass}>Department</label>
              <input
                className={inputClass}
                value={form.department}
                onChange={(e) => set({ department: e.target.value })}
                placeholder="e.g. Sales"
              />
            </div>

            <div>
              <label className={labelClass}>Designation</label>
              <input
                className={inputClass}
                value={form.designation}
                onChange={(e) => set({ designation: e.target.value })}
                placeholder="e.g. Senior Sales Executive"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                onClick={() => set({ isActive: !form.isActive })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  form.isActive ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    form.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {form.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {!isEdit ? (
              <div>
                <label className={labelClass}>
                  Password <span className="text-error-500">*</span>
                </label>
                <input
                  type="password"
                  className={inputClass}
                  value={form.password}
                  onChange={(e) => set({ password: e.target.value })}
                  placeholder="Min 6 characters"
                />
              </div>
            ) : (
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.changePassword}
                    onChange={(e) => set({ changePassword: e.target.checked, password: "" })}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Change password</span>
                </label>
                {form.changePassword && (
                  <div className="mt-3">
                    <input
                      type="password"
                      className={inputClass}
                      value={form.password}
                      onChange={(e) => set({ password: e.target.value })}
                      placeholder="New password (min 6 characters)"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-500 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pb-8">
          <Button type="button" variant="outline" onClick={() => navigate("/masters/users")}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? "Saving..." : isEdit ? "Update User" : "Create User"}
          </Button>
        </div>
      </form>
    </div>
  );
}
