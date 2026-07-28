import type { PurchaseOrderFormState } from "../types/types";

export function validatePurchaseOrderForm(state: PurchaseOrderFormState): string | null {
  if (!state.orderDetails.no.trim()) {
    return "Purchase order number is required.";
  }
  if (!state.vendorInformation.vendorId) {
    return "Please select a vendor.";
  }
  if (!state.deliveryInformation.address.trim()) {
    return "Delivery address is required.";
  }
  const hasValidLine = state.items.some(
    (line) => line.itemId && Number.parseFloat(line.quantity) > 0,
  );
  if (!hasValidLine) {
    return "Add at least one line item with a product and quantity.";
  }
  return null;
}
