# Transaction Pattern And Mental Model

This folder uses `purchase-order` as the reference implementation for transaction forms.
`sales-order` now follows the same structure and should be treated as the second example of the pattern.

## Mental model

Think about every transaction screen as three layers:

1. Domain state
   `types/types.ts` owns the transaction shape, empty-state factories, recalculation rules, and API payload mapping.

2. Form orchestration
   `*FormContext.tsx` owns in-memory state and exposes semantic actions such as `setOrderDetails`, `updateLine`, `addLine`, and `setFooter`.

3. UI composition
   `*Form.tsx`, `sections/*`, `LineItemsSection.tsx`, and `SummaryFooterSection.tsx` render the form by consuming the context actions and state.

This keeps business rules out of the JSX-heavy files and keeps the UI focused on rendering and user interaction.

## Recommended folder shape

Use this structure for each new transaction module:

```text
transaction-name/
  hooks/
    useTransactionLineColumns.tsx
  sections/
    ...
  types/
    types.ts
  Form.tsx
  FormContext.tsx
  LineItemsSection.tsx
  SummaryFooterSection.tsx
  lineItemColumns.ts
  types.ts
```

Notes:

- `types.ts` at the module root can be a barrel that re-exports from `types/types.ts`.
- `lineItemColumns.ts` defines column metadata only.
- `hooks/useTransactionLineColumns.tsx` turns metadata into renderers and sort accessors.
- `LineItemsSection.tsx` is the transaction-specific wrapper that feeds state and column definitions into the shared line-item grid.
- `shared/TransactionLineItemsSection.tsx` owns the reusable row shell, column selection, resizing, sorting, and modal state.

## Section responsibilities

- `*Form.tsx`
  Validates submit requirements, calls the mutation, shows form-level errors, and wires the sticky action bar.
- `*FormContext.tsx`
  Applies state patches and runs recalculation when a patch affects totals.
- `sections/*`
  Render grouped header data only. They should not duplicate derived calculations.
- `LineItemsSection.tsx`
  Is the interactive grid shell for line-level work.
- `SummaryFooterSection.tsx`
  Uses the shared 2-column summary layout: left-side tabs for editable transaction details and right-side read-only summary metrics.

## Summary tab pattern

Transaction summaries now follow a shared mental model:

- Left column
  Tabbed editing surface.
- Right column
  Read-only financial summary for that transaction.

Recommended tabs:

- `General`
  Transaction-specific fields only.
- `Additions`
  Common adjustment area across transactions.
- `Remarks`
  Common free-text remarks area.

Examples:

- Purchase order general tab
  Notes and taxable toggle.
- Sales order general tab
  Vehicle/shipping reference and tax application.

## Line item pattern

The line-item area is intentionally split into four parts:

1. Line state fields live in `types/types.ts`.
2. Column metadata lives in `lineItemColumns.ts`.
3. Cell renderers and sort logic live in `hooks/use...LineColumns.tsx`.
4. The transaction wrapper lives in `LineItemsSection.tsx`.
5. The reusable grid shell and row rendering live in `shared/TransactionLineItemsSection.tsx`.

This separation makes it easy to:

- hide or reveal optional columns
- resize columns without touching business logic
- sort rows by visible fields
- keep product lookup logic close to the related cell renderer

## Recalculation rules

Derived amounts should always be recomputed in `types/types.ts`.
Do not spread calculation logic across sections or row components.

Good examples:

- gross, discount, tax, net, and balance calculations
- line reindexing
- transaction payload shaping

## Shared components

Use the shared transaction shell components whenever possible:

- `shared/TransactionHeaderGrid.tsx`
- `shared/TransactionLineItemsSection.tsx`
- `shared/TransactionSectionCard.tsx`
- `shared/TransactionStickyActionBar.tsx`
- `shared/TransactionSummarySection.tsx`

These keep header sections visually consistent across transaction screens.

## Checklist for a new transaction

When building another transaction module, follow this order:

1. Define state, factories, recalc functions, and payload mapping in `types/types.ts`.
2. Create the context with semantic setters and line actions.
3. Build header sections inside `sections/`.
4. Define line column metadata in `lineItemColumns.ts`.
5. Build the line-column hook for cell renderers and sorting.
6. Assemble `LineItemsSection.tsx` as a thin wrapper around `shared/TransactionLineItemsSection.tsx`.
7. Add the summary/footer section.
8. Compose everything in `*Form.tsx`.

## Current reference modules

- `purchase-order`
  Primary reference for the transaction pattern.
- `sales-order`
  Same pattern adapted for customer-facing pricing, tax, warehouse, and additions workflows.
