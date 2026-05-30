# Reporting Module Plan

## Context

My IMS is an inventory management application with double-entry accounting. The operations side now covers procurement and sales cycles, including purchase orders, GRNs, purchase invoices, sales orders, sales invoices, adjustment notes, bill-wise receipts/payments, journal posting, and inventory posting foundations.

The next phase is the reporting side. Reports should be divided into four clear sections:

- Financial Statements
- Receivables and Payables
- Inventory Reports
- Sales and Purchase Reports

The goal is to build reports from posted, auditable transaction data wherever possible. Entry screens can be operational, but report outputs must reconcile with accounting and inventory ledgers.

The first version should stay intentionally small. The reporting menu should look polished, useful, and easy to understand, not exhaustive. More reports can be added later based on client requirements.

## Current Starting Point

Existing report-related structure:

- Backend report area: `backend/Features/Reports`
- Existing financial report: `LedgerWise`
- Frontend report routes: `frontend/src/routes/ReportsRoutes.tsx`
- Current frontend report pages are placeholders
- Shared filtering/pagination infrastructure exists in `backend/Infrastructure/Filtering`
- Inventory posting structures exist for stock movement, balances, FIFO layers, and valuation snapshots
- Bill-wise allocation structures exist for customer/vendor outstanding tracking

## Reporting Principles

- Reports must read using `AsNoTracking()` and projection DTOs.
- Reports should not mutate operational or accounting data.
- Reports should use posted documents as the default source of truth.
- Financial reports should reconcile with journal entries.
- Inventory reports should reconcile with inventory entries and inventory balances.
- Sales/purchase registers should reconcile with their transaction tables and journal vouchers.
- Report filters should be URL-friendly and reusable across backend and frontend.
- Each report must have its own explicit filter/request class.
- Every report should have an export-ready DTO shape, even if export is implemented later.
- Totals must be returned by the backend, not recalculated only in the UI.
- Cancelled, draft, and posted statuses must be handled explicitly per report.

## Shared Report Infrastructure

### Backend

Create a common reporting foundation before building many individual reports.

- `backend/Features/Reports/Common`
- Thin shared base contracts only where they remove repetition, such as pagination
- Shared filter value objects only for reusable concepts like date ranges or ageing buckets
- Common report response wrapper
- Common money/quantity total DTOs
- Sort registries for each report family
- Optional export model later for CSV, Excel, and PDF

Do not create one large generic report filter. Every report should define a dedicated filter class that contains only the fields that report actually supports.

Examples:

- `SalesRegisterFilter`
- `PurchaseRegisterFilter`
- `ReceivablesAgeingFilter`
- `PayablesAgeingFilter`
- `BillWiseReceivablesFilter`
- `BillWisePayablesFilter`
- `StockSummaryFilter`
- `ItemWiseStockFilter`
- `StockMovementFilter`
- `InventoryValuationFilter`
- `TrialBalanceFilter`
- `ProfitAndLossFilter`
- `BalanceSheetFilter`
- `CashFlowFilter`
- `LedgerWiseFilter`

Common field names should stay consistent across report-specific filters:

- `FromDate`
- `ToDate`
- `Keyword`
- `PartyId`
- `ProductId`
- `WarehouseId`
- `Status`
- `Page`
- `Limit`
- `SortBy`

### Frontend

Create a reporting feature folder:

- `frontend/src/features/reporting`

Recommended structure:

- `api`
- `components`
- `financial-statements`
- `receivables-payables`
- `inventory`
- `sales-purchase`
- `pages`
- `types`

Shared UI should include:

- Report date range filter
- Party lookup filter
- Item lookup filter
- Warehouse lookup filter
- Status filter
- Report table shell
- Report summary strip
- Empty/loading/error states
- Export action placeholder

## Phase 1: Reporting Shell And Navigation

Build the reporting landing experience and route structure.

### Frontend Tasks

- Replace placeholders with a report index page.
- Split reports into Financial Statements, Receivables and Payables, Inventory Reports, and Sales and Purchase Reports.
- Add route groups for each report.
- Create shared report filter UI controls, but keep report-specific filter state/types per report.
- Create shared report table layout.
- Add report cards/list entries for planned reports.

### Backend Tasks

- Keep existing `LedgerWise` report working.
- Introduce common report request/response DTOs.
- Document endpoint naming convention.

Recommended endpoint convention:

- `/api/reports/financial-statements/...`
- `/api/reports/receivables-payables/...`
- `/api/reports/inventory/...`
- `/api/reports/sales-purchase/...`

## Report Category Catalog

These are the main report categories to show in the product. The UI can present these sections from the start, while individual reports can be enabled in a controlled rollout. This keeps the reporting area polished without making it feel overloaded.

### Financial Statements

1. Trial Balance
   - Summary of all ledger balances.
   - Useful as the first accounting health check.

2. Profit and Loss
   - Income, COGS, gross profit, expenses, and net profit.
   - Add after sales/purchase posting and COGS reconciliation are stable.

3. Balance Sheet
   - Assets, liabilities, and equity as of a date.
   - Add after trial balance reconciliation is stable.

4. Cash Flow
   - Cash and bank movement grouped into operating, investing, and financing sections.
   - Keep for later unless a client requires it early.

### Receivables And Payables

1. Receivables Ageing
   - Customer outstanding grouped by ageing buckets.
   - Useful for collection follow-up.

2. Payables Ageing
   - Vendor outstanding grouped by ageing buckets.
   - Useful for payment planning.

3. Bill-wise Receivables
   - Customer invoice-wise outstanding.
   - Useful when users need document-level collection follow-up.

4. Bill-wise Payables
   - Vendor bill-wise outstanding.
   - Useful when users need document-level payment planning.

### Inventory Reports

1. Stock Summary
   - Product/warehouse stock quantity and value.
   - This should be the primary inventory report.

2. Item-wise Stock
   - Product-level quantity/value view.
   - Useful for quick item review without opening stock movement detail.

3. Stock Movement
   - Inward, outward, and balance movement by product/warehouse.
   - Add when users need audit-level inventory tracing.

4. Inventory Valuation
   - Stock value by item/warehouse and valuation rate.
   - Add once inventory valuation reconciliation is stable.

### Sales And Purchase Reports

1. Sales Register
   - All sales invoices with date, party, amount, outstanding amount, and status.
   - This should be the primary sales report.

2. Purchase Register
   - All purchase bills with date, party, amount, outstanding amount, and status.
   - This should be the primary purchase report.

### Reports To Keep For Later

These are useful, but should not be part of the first reporting menu unless a client specifically asks for them:

- Sales by party
- Sales by item
- Sales return register
- Purchase by party
- Purchase by item
- Purchase return register
- Low stock / reorder report
- FIFO layer report
- Day book
- Cash/bank book
- Journal register
- Tax summary
- Customer statement
- Vendor statement

## Phase 2: Financial Statements

Financial reports should come from `JournalVouchers`, `JournalEntries`, ledgers, sub-ledgers, and bill-wise allocations.

### Core Financial Statement Reports

1. Trial Balance
   - Source: journal entries grouped by ledger.
   - Filters: date range, ledger group.
   - Output: opening debit/credit, period debit/credit, closing debit/credit.

2. Profit and Loss
   - Source: income, expense, sales, purchase, and COGS ledgers.
   - Filters: date range.
   - Output: income, cost of goods sold, gross profit, expenses, net profit.
   - Should be added after register totals and COGS posting are stable.

3. Balance Sheet
   - Source: asset, liability, and equity ledgers.
   - Filters: as-of date.
   - Output: assets, liabilities, equity, and balance difference check.
   - Should be added after trial balance reconciliation is stable.

4. Cash Flow
   - Source: cash/bank journal movements and mapped ledger groups.
   - Filters: date range.
   - Output: operating, investing, financing, net cash movement, opening cash, closing cash.
   - Keep as a later report unless specifically required early.

### Ledger Detail Report

Ledger-wise is still important, but it should live as a drill-down/detail report rather than the main section headline.

1. Ledger-wise Report
   - Existing backend implementation can be refined.
   - Add frontend page or drill-down from trial balance.
   - Filters: ledger, date range, sub-ledger type, sub-ledger.
   - Output: opening balance, debit, credit, running balance, closing balance.

## Phase 3: Receivables And Payables

Receivables and payables reports should come from sales invoices, purchase invoices, bill-wise receipts/payments, and allocation details.

### Core Receivables And Payables Reports

1. Receivables Ageing
   - Source: sales invoices and bill-wise receipt allocations.
   - Filters: as-of date, customer, ageing buckets.
   - Output: invoice amount, settled amount, outstanding, bucket.

2. Payables Ageing
   - Source: purchase invoices and bill-wise payment allocations.
   - Filters: as-of date, vendor, ageing buckets.
   - Output: invoice amount, settled amount, outstanding, bucket.

3. Bill-wise Receivables
   - Source: sales invoices and bill-wise receipt allocations.
   - Filters: date range, customer, status.
   - Output: customer, invoice no, invoice date, due date, original amount, settled amount, outstanding amount.

4. Bill-wise Payables
   - Source: purchase invoices and bill-wise payment allocations.
   - Filters: date range, vendor, status.
   - Output: vendor, bill no, bill date, due date, original amount, settled amount, outstanding amount.

### Later Financial/Accounting Reports

- Day book
- Cash/bank book
- Journal register
- Tax summary
- Customer statement
- Vendor statement

## Phase 4: Sales And Purchase Reports

Sales and purchase reports should come from sales invoices, purchase invoices, invoice lines, adjustment notes, and related customer/vendor/product masters.

### Sales Register

Purpose: all sales invoices with date, party, amount, and status.

Filters:

- Date range
- Customer
- Status
- Keyword

Columns:

- Invoice date
- Invoice no
- Customer
- Reference no
- Gross amount
- Discount
- Taxable amount
- Tax amount
- Net amount
- Outstanding amount
- Status

Totals:

- Gross amount
- Discount
- Taxable amount
- Tax amount
- Net amount
- Outstanding amount

### Later Sales Reports

Keep these out of the first reporting menu unless a client asks for them.

#### Sales By Party

Purpose: customer-wise sales summary.

Filters:

- Date range
- Customer
- Status

Columns:

- Customer code
- Customer name
- Invoice count
- Gross amount
- Discount
- Taxable amount
- Tax amount
- Net amount
- Receipts allocated
- Outstanding amount

#### Sales By Item

Purpose: item-wise sales quantity, revenue, COGS, and gross profit.

Filters:

- Date range
- Product
- Customer
- Warehouse
- Status

Columns:

- Product code
- Product name
- Quantity sold
- Gross sales
- Discount
- Net sales before tax
- Tax amount
- COGS amount
- Gross profit
- Gross profit %

#### Sales Return Register

Purpose: all sales returns/credit notes.

Filters:

- Date range
- Customer
- Product
- Status

Columns:

- Credit note date
- Credit note no
- Source invoice no
- Customer
- Amount
- Tax amount
- Net amount
- Status

### Purchase Register

Purpose: all purchase bills with date, party, amount, and status.

Filters:

- Date range
- Vendor
- Status
- Keyword

Columns:

- Bill date
- Bill no
- Vendor
- Vendor invoice/reference no
- Gross amount
- Discount
- Taxable amount
- Tax amount
- Net amount
- Outstanding amount
- Status

Totals:

- Gross amount
- Discount
- Taxable amount
- Tax amount
- Net amount
- Outstanding amount

### Later Purchase Reports

Keep these out of the first reporting menu unless a client asks for them.

#### Purchase By Party

Purpose: vendor-wise purchase summary.

Filters:

- Date range
- Vendor
- Status

Columns:

- Vendor code
- Vendor name
- Bill count
- Gross amount
- Discount
- Taxable amount
- Tax amount
- Net amount
- Payments allocated
- Outstanding amount

#### Purchase By Item

Purpose: item-wise purchase quantity and value.

Filters:

- Date range
- Product
- Vendor
- Warehouse
- Status

Columns:

- Product code
- Product name
- Purchased quantity
- FOC quantity
- Gross amount
- Discount
- Taxable amount
- Tax amount
- Landing/cost amount
- Average cost

#### Purchase Return Register

Purpose: all purchase returns/debit notes.

Filters:

- Date range
- Vendor
- Product
- Status

Columns:

- Debit note date
- Debit note no
- Source bill no
- Vendor
- Amount
- Tax amount
- Net amount
- Status

## Phase 5: Inventory Reports

Inventory reports should come from inventory entries, inventory balances, FIFO layers, product masters, warehouse masters, and transaction snapshots.

### Stock Summary

- Product
- Warehouse
- Opening quantity
- Inward quantity
- Outward quantity
- Closing quantity
- Closing value
- Valuation rate

### Item-wise Stock

- Product
- Opening quantity
- Inward quantity
- Outward quantity
- Closing quantity
- Closing value
- Valuation rate

### Stock Movement

- Product
- Warehouse
- Date
- Voucher type
- Voucher no
- Inward quantity/value
- Outward quantity/value
- Balance quantity/value

### Inventory Valuation

- Product
- Warehouse
- Quantity on hand
- Valuation rate
- Stock value
- Valuation method/source

### Later Inventory Reports

Keep these out of the first reporting menu unless a client asks for them.

#### Low Stock / Reorder Report

- Product
- Warehouse
- Current stock
- Minimum stock
- Reorder level
- Reorder quantity

#### FIFO Layer Report

- Product
- Warehouse
- Layer date
- Source voucher
- Original quantity
- Remaining quantity
- Rate
- Remaining value

## Phase 6: Testing And Reconciliation

Reporting depends on trustworthy operational posting. Before expanding reports too far, test the procurement and sales cycles end to end.

### Procurement Test Flow

- Create vendor, product, warehouse, tax, ledgers.
- Create purchase order.
- Create GRN.
- Create purchase invoice from GRN.
- Verify inventory inward posting.
- Verify journal posting.
- Create payment allocation.
- Verify payable outstanding.
- Create purchase return/debit note.
- Verify stock and ledger reversal/adjustment.

### Sales Test Flow

- Create customer, product, warehouse, tax, ledgers.
- Ensure stock exists.
- Create sales order.
- Create sales invoice.
- Verify inventory outward posting.
- Verify COGS and gross profit snapshots.
- Verify journal posting.
- Create receipt allocation.
- Verify receivable outstanding.
- Create sales return/credit note.
- Verify stock and ledger reversal/adjustment.

### Reconciliation Checks

- Sales register net total equals sales invoice journal totals.
- Purchase register net total equals purchase invoice journal totals.
- Receivables outstanding equals customer control ledger balance by sub-ledger.
- Payables outstanding equals vendor control ledger balance by sub-ledger.
- Stock summary value equals inventory valuation ledger where applicable.
- Later item-wise reports should reconcile with invoice line totals when they are added.

## Recommended Implementation Order

1. Reporting shell and navigation.
2. Shared report filter controls, report-specific filter classes, and table shell.
3. Sales register.
4. Purchase register.
5. Stock summary.
6. Receivables ageing.
7. Payables ageing.
8. Bill-wise receivables and payables.
9. Trial balance.
10. Ledger-wise detail/drill-down.
11. Profit and loss.
12. Balance sheet.
13. Cash flow.

This order gives operational visibility first, then adds the most important financial controls without making the reporting area feel heavy.

## Open Decisions

- Whether reports should include draft documents by default or only posted documents.
- Whether cancelled/reversed documents should appear as separate rows or be hidden behind status filters.
- Whether ageing buckets are fixed or user-configurable.
- Whether export should be CSV first or Excel first.
- Whether inventory reports should show quantities only first, then valuation once reconciliation is confirmed.
- Whether cash flow should be included in the first release or kept for later client-specific rollout.

## First Milestone Definition Of Done

- Reporting home page has Financial Statements, Receivables and Payables, Inventory Reports, and Sales and Purchase Reports sections.
- Existing placeholder report routes are replaced or mapped into the new structure.
- Ledger-wise report has a working frontend connected to the existing backend endpoint.
- Sales register backend endpoint returns filtered rows and backend totals.
- Purchase register backend endpoint returns filtered rows and backend totals.
- Reports use dedicated filter classes with shared UI controls and consistent pagination.
- Basic reconciliation test notes are documented for sales and purchase register totals.
