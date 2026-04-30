# AI Purchase Invoice Workflow

## Flow
1. User clicks `Add with AI` on Purchase Invoice.
2. User uploads a purchase invoice PDF.
3. Backend sends the PDF to the AI provider and gets structured invoice data.
4. Backend builds an AI draft for the Purchase Invoice form.
5. Frontend calls the AI master-match API.
6. Server checks exact name matches for:
   - vendor
   - each product
   - each UOM
7. If all matches exist, the AI Purchase Invoice page opens with fields prefilled.
8. If vendor, product, or UOM is missing, frontend shows stepper actions for manual creation or mapping.
9. User reviews the draft, fixes remaining gaps, and saves the invoice normally.

## Important Rules
- AI only prefills the form. It does not auto-save the invoice.
- Master checking is done by server API, not frontend-only matching.
- Vendor, product, and UOM checks are kept in separate AI matching files/services to avoid coupling with normal invoice logic.

## Main Parts
- AI extraction: `PurchaseInvoiceAiMappingService`
- Master match API: `PurchaseInvoiceAiMasterMatchService`
- Frontend match client: `purchaseInvoiceAiMasterMatcher.ts`
- Manual fallback forms:
  - `QuickCreateVendorForm.tsx`
  - `QuickCreateProductForm.tsx`
