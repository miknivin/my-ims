export type AppNavLeaf = {
  name: string;
  path?: string;
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
          { name: "Purchase Order", path: "/operations/purchase-order" },
          { name: "Sales Order", path: "/operations/sales-order" },
        ],
      },
      {
        name: "Invoices",
        items: [
          { name: "Purchase Invoice", path: "/operations/purchase-invoice" },
          { name: "Sales Invoice", path: "/operations/sales-invoice" },
        ],
      },
      {
        name: "Payments",
        items: [
          { name: "Bill Wise Receipt", path: "/operations/customer-receipts" },
          { name: "Bill Wise Payment", path: "/operations/supplier-payments" },
        ],
      },
      {
        name: "Inventory",
        items: [
          {
            name: "Goods Receipt (GRN)",
            path: "/operations/goods-receipt-note",
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
              },
              {
                name: "Sales Debit Notes",
                path: "/operations/adjustments/sales-debit-notes",
              },
            ],
          },
          {
            name: "Purchase",
            items: [
              {
                name: "Purchase Credit Notes",
                path: "/operations/adjustments/purchase-credit-notes",
              },
              {
                name: "Purchase Debit Notes",
                path: "/operations/adjustments/purchase-debit-notes",
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
        name: "Bill-wise",
        items: [
          { name: "Bill-wise Report", path: "/reports/bill-wise-report" },
          { name: "Bill-wise Profit", path: "/reports/bill-wise-profit" },
        ],
      },
      {
        name: "Item-wise",
        items: [
          { name: "Item-wise Profit", path: "/reports/item-wise-profit" },
          { name: "Item-wise Movement", path: "/reports/item-wise-movement" },
        ],
      },
      { name: "Ledger-view", path: "/reports/ledger-wise" },
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
