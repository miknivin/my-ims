export type AppNavLeaf = {
  name: string;
  path?: string;
  createPath?: string;
  items?: AppNavLeaf[];
};

export type AppNavGroup = {
  name: string;
  path?: string;
  items?: AppNavLeaf[];
};

export type AppNavItem = {
  name: string;
  path?: string;
  groups?: AppNavGroup[];
};

export const isNavLeafActive = (
  leaf: AppNavLeaf,
  isPathActive: (path: string) => boolean,
): boolean =>
  leaf.path
    ? isPathActive(leaf.path)
    : (leaf.items?.some((item) => isNavLeafActive(item, isPathActive)) ??
      false);

export const isNavGroupActive = (
  group: AppNavGroup,
  isPathActive: (path: string) => boolean,
): boolean =>
  group.path
    ? isPathActive(group.path)
    : (group.items?.some((item) => isNavLeafActive(item, isPathActive)) ??
      false);

export const isNavItemActive = (
  item: AppNavItem,
  isPathActive: (path: string) => boolean,
): boolean =>
  item.path
    ? isPathActive(item.path)
    : (item.groups?.some((group) => isNavGroupActive(group, isPathActive)) ??
      false);

export type MasterCard = {
  title: string;
  desc: string;
  path: string;
  ready?: boolean;
};

export const appNavItems: AppNavItem[] = [
  { name: "Dashboard", path: "/" },
  {
    name: "Masters",
    groups: [
      { name: "Ledger Group Master", path: "/masters/ledger-groups" },
      { name: "Ledger Master", path: "/masters/ledger" },
      { name: "Category Master", path: "/masters/category" },
      { name: "Product Master", path: "/masters/product" },
      { name: "Vendor Master", path: "/masters/vendor" },
      { name: "Customer Master", path: "/masters/customers" },
      { name: "Currency Master", path: "/masters/currency" },
      { name: "Warehouse Master", path: "/masters/warehouse" },
      { name: "UOM Master", path: "/masters/uom" },
      { name: "Tax Master", path: "/masters/tax" },
      { name: "Discount Master", path: "/masters/price-discount" },
      { name: "User / Role Master", path: "/masters/users" },
    ],
  },
  {
    name: "Operations",
    groups: [
      {
        name: "Orders",
        items: [
          { name: "Purchase Order", path: "/operations/purchase-order", createPath: "/operations/purchase-order/new" },
          { name: "Sales Order", path: "/operations/sales-order", createPath: "/operations/sales-order/new" },
        ],
      },
      {
        name: "Invoices",
        items: [
          { name: "Purchase Invoice", path: "/operations/purchase-invoice", createPath: "/operations/purchase-invoice/new" },
          { name: "Sales Invoice", path: "/operations/sales-invoice", createPath: "/operations/sales-invoice/new" },
        ],
      },
      {
        name: "Payments",
        items: [
          { name: "Bill Wise Receipt", path: "/operations/customer-receipts", createPath: "/operations/customer-receipts/new" },
          { name: "Bill Wise Payment", path: "/operations/supplier-payments", createPath: "/operations/supplier-payments/new" },
        ],
      },
      {
        name: "Accounting",
        items: [
          {
            name: "Journal Vouchers",
            path: "/operations/accounting/journal-vouchers",
          },
          {
            name: "Journal Entries",
            path: "/operations/accounting/journal-entries",
          },
        ],
      },
      {
        name: "Inventory",
        items: [
          {
            name: "Goods Receipt (GRN)",
            path: "/operations/goods-receipt-note",
            createPath: "/operations/goods-receipt-note/new",
          },
          { name: "Stock Adjustment", path: "/operations/stock-adjustment" },
          { name: "Stock Transfer", path: "/operations/stock-transfer" },
        ],
      },
      {
        name: "Adjustments",
        items: [
          {
            name: "Sales",
            items: [
              {
                name: "Sales Credit Notes",
                path: "/operations/adjustments/sales-credit-notes",
                createPath: "/operations/adjustments/sales-credit-notes/new",
              },
              {
                name: "Sales Debit Notes",
                path: "/operations/adjustments/sales-debit-notes",
                createPath: "/operations/adjustments/sales-debit-notes/new",
              },
            ],
          },
          {
            name: "Purchase",
            items: [
              {
                name: "Purchase Credit Notes",
                path: "/operations/adjustments/purchase-credit-notes",
                createPath: "/operations/adjustments/purchase-credit-notes/new",
              },
              {
                name: "Purchase Debit Notes",
                path: "/operations/adjustments/purchase-debit-notes",
                createPath: "/operations/adjustments/purchase-debit-notes/new",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Reports",
    groups: [
      {
        name: "Financial Statements",
        items: [
          { name: "Trial Balance", path: "/reports/financial-statements/trial-balance" },
          { name: "Profit and Loss", path: "/reports/financial-statements/profit-and-loss" },
          { name: "Balance Sheet", path: "/reports/financial-statements/balance-sheet" },
          { name: "Cash Flow", path: "/reports/financial-statements/cash-flow" },
        ],
      },
      {
        name: "Receivables and Payables",
        items: [
          { name: "Receivables Ageing", path: "/reports/receivables-payables/receivables-ageing" },
          { name: "Payables Ageing", path: "/reports/receivables-payables/payables-ageing" },
          { name: "Bill-wise Receivables", path: "/reports/receivables-payables/bill-wise-receivables" },
          { name: "Bill-wise Payables", path: "/reports/receivables-payables/bill-wise-payables" },
        ],
      },
      {
        name: "Inventory Reports",
        items: [
          { name: "Stock Summary", path: "/reports/inventory/stock-summary" },
          { name: "Item-wise Stock", path: "/reports/inventory/item-wise-stock" },
          { name: "Stock Movement", path: "/reports/inventory/stock-movement" },
          { name: "Inventory Valuation", path: "/reports/inventory/inventory-valuation" },
        ],
      },
      {
        name: "Sales and Purchase Reports",
        items: [
          { name: "Sales Register", path: "/reports/sales-purchase/sales-register" },
          { name: "Purchase Register", path: "/reports/sales-purchase/purchase-register" },
        ],
      },
    ],
  },
];

export const masterCards: MasterCard[] = [
  {
    title: "Ledger Group Master",
    desc: "Build the chart of account groups and reporting hierarchy.",
    path: "/masters/ledger-groups",
    ready: true,
  },
  {
    title: "Ledger Master",
    desc: "Manage accounting ledgers and link them to ledger groups.",
    path: "/masters/ledger",
    ready: true,
  },
  {
    title: "Product Master",
    desc: "Manage items, categories, units, prices, SKUs, and barcodes.",
    path: "/masters/product",
    ready: true,
  },
  {
    title: "Vendor Master",
    desc: "Maintain supplier details, GST info, and payment terms.",
    path: "/masters/vendor",
    ready: true,
  },
  {
    title: "Customer Master",
    desc: "Store customer details like codes, contacts, and addresses.",
    path: "/masters/customers",
    ready: true,
  },
  {
    title: "Currency Master",
    desc: "Maintain supported currencies, exchange rates, and symbols.",
    path: "/masters/currency",
  },
  {
    title: "Warehouse Master",
    desc: "Define warehouses, bins, racks, and storage locations.",
    path: "/masters/warehouse",
    ready: true,
  },
  {
    title: "Category Master",
    desc: "Classify products into categories and groups.",
    path: "/masters/category",
  },
  {
    title: "Unit of Measurement (UOM) Master",
    desc: "Define units and conversion factors (e.g., Box = 12 Pieces).",
    path: "/masters/uom",
    ready: true,
  },
  {
    title: "Tax Master",
    desc: "Configure tax types, rates, and applicability.",
    path: "/masters/tax",
  },
  {
    title: "Discount Master",
    desc: "Define reusable fixed and percentage discount rules.",
    path: "/masters/price-discount",
    ready: true,
  },
  {
    title: "User / Role Master",
    desc: "Manage user accounts, roles, and access permissions.",
    path: "/masters/users",
  },
];
