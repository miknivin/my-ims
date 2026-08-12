import type { RolePermissions } from "@/redux/api/roleApi";

export const PERMISSION_ACTIONS = ["view", "create", "edit", "delete"] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export interface PermissionModule {
  key: string;
  label: string;
  actions: PermissionAction[];
}

export interface PermissionGroup {
  group: string;
  modules: PermissionModule[];
}

export const PERMISSION_SCHEMA: PermissionGroup[] = [
  {
    group: "Masters",
    modules: [
      { key: "masters.categories",   label: "Categories",      actions: ["view", "create", "edit", "delete"] },
      { key: "masters.products",     label: "Products",        actions: ["view", "create", "edit", "delete"] },
      { key: "masters.vendors",      label: "Vendors",         actions: ["view", "create", "edit", "delete"] },
      { key: "masters.customers",    label: "Customers",       actions: ["view", "create", "edit", "delete"] },
      { key: "masters.ledger-groups",label: "Ledger Groups",   actions: ["view", "create", "edit", "delete"] },
      { key: "masters.ledgers",      label: "Ledgers",         actions: ["view", "create", "edit", "delete"] },
      { key: "masters.uoms",         label: "Units of Measure",actions: ["view", "create", "edit", "delete"] },
      { key: "masters.warehouses",   label: "Warehouses",      actions: ["view", "create", "edit", "delete"] },
      { key: "masters.currencies",   label: "Currencies",      actions: ["view", "create", "edit", "delete"] },
      { key: "masters.taxes",        label: "Taxes",           actions: ["view", "create", "edit", "delete"] },
      { key: "masters.discounts",    label: "Price Discounts", actions: ["view", "create", "edit", "delete"] },
    ],
  },
  {
    group: "Purchase",
    modules: [
      { key: "ops.purchase-orders",        label: "Purchase Orders",        actions: ["view", "create", "edit", "delete"] },
      { key: "ops.goods-receipt-notes",    label: "Goods Receipt Notes",    actions: ["view", "create", "edit", "delete"] },
      { key: "ops.purchase-invoices",      label: "Purchase Invoices",      actions: ["view", "create", "edit", "delete"] },
      { key: "ops.purchase-credit-notes",  label: "Purchase Credit Notes",  actions: ["view", "create", "edit", "delete"] },
      { key: "ops.purchase-debit-notes",   label: "Purchase Debit Notes",   actions: ["view", "create", "edit", "delete"] },
    ],
  },
  {
    group: "Sales",
    modules: [
      { key: "ops.sales-orders",       label: "Sales Orders",       actions: ["view", "create", "edit", "delete"] },
      { key: "ops.sales-invoices",     label: "Sales Invoices",     actions: ["view", "create", "edit", "delete"] },
      { key: "ops.delivery-notes",     label: "Delivery Notes",     actions: ["view", "create", "edit", "delete"] },
      { key: "ops.sales-credit-notes", label: "Sales Credit Notes", actions: ["view", "create", "edit", "delete"] },
      { key: "ops.sales-debit-notes",  label: "Sales Debit Notes",  actions: ["view", "create", "edit", "delete"] },
    ],
  },
  {
    group: "Payments & Receipts",
    modules: [
      { key: "ops.customer-receipts",  label: "Customer Receipts",  actions: ["view", "create", "delete"] },
      { key: "ops.supplier-payments",  label: "Supplier Payments",  actions: ["view", "create", "delete"] },
    ],
  },
  {
    group: "Accounting",
    modules: [
      { key: "accounting.journal-vouchers", label: "Journal Vouchers", actions: ["view", "create", "delete"] },
    ],
  },
  {
    group: "Reports",
    modules: [
      { key: "reports.sales-register",      label: "Sales Register",         actions: ["view"] },
      { key: "reports.purchase-register",   label: "Purchase Register",      actions: ["view"] },
      { key: "reports.financial-statements",label: "Financial Statements",   actions: ["view"] },
      { key: "reports.receivables-payables",label: "Receivables & Payables", actions: ["view"] },
      { key: "reports.inventory",           label: "Inventory Reports",      actions: ["view"] },
    ],
  },
  {
    group: "Settings",
    modules: [
      { key: "settings.company", label: "Company Settings",  actions: ["view", "edit"] },
      { key: "settings.users",   label: "User Management",   actions: ["view", "create", "edit", "delete"] },
      { key: "settings.roles",   label: "Role Management",   actions: ["view", "create", "edit", "delete"] },
    ],
  },
];

function allPermissions(): RolePermissions {
  return Object.fromEntries(
    PERMISSION_SCHEMA.flatMap((g) => g.modules).map((m) => [m.key, [...m.actions]]),
  );
}

export const PERMISSION_TEMPLATES: Record<string, RolePermissions> = {
  "Sales Person": {
    "masters.products":        ["view"],
    "masters.customers":       ["view", "create", "edit"],
    "ops.sales-orders":        ["view", "create"],
    "ops.sales-invoices":      ["view", "create"],
    "ops.delivery-notes":      ["view", "create"],
    "reports.sales-register":  ["view"],
  },
  "Purchase Manager": {
    "masters.products":              ["view", "create", "edit"],
    "masters.vendors":               ["view", "create", "edit"],
    "masters.warehouses":            ["view"],
    "ops.purchase-orders":           ["view", "create", "edit", "delete"],
    "ops.goods-receipt-notes":       ["view", "create", "edit", "delete"],
    "ops.purchase-invoices":         ["view", "create", "edit"],
    "ops.purchase-credit-notes":     ["view", "create"],
    "ops.purchase-debit-notes":      ["view", "create"],
    "reports.purchase-register":     ["view"],
    "reports.inventory":             ["view"],
  },
  "Accountant": {
    "masters.ledger-groups":          ["view", "create", "edit"],
    "masters.ledgers":                ["view", "create", "edit"],
    "ops.customer-receipts":          ["view", "create"],
    "ops.supplier-payments":          ["view", "create"],
    "accounting.journal-vouchers":    ["view", "create", "delete"],
    "reports.sales-register":         ["view"],
    "reports.purchase-register":      ["view"],
    "reports.financial-statements":   ["view"],
    "reports.receivables-payables":   ["view"],
    "reports.inventory":              ["view"],
  },
  Manager: allPermissions(),
};
