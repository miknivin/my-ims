import { Route } from "react-router";
import CategoryMaster from "@/features/masters/pages/Masters/CategoryMaster";
import CustomerFormPage from "@/features/masters/pages/Masters/CustomerFormPage";
import CustomerMaster from "@/features/masters/pages/Masters/CustomerMaster";
import CurrencyMaster from "@/features/masters/pages/Masters/CurrencyMaster";
import DiscountMaster from "@/features/masters/pages/Masters/DiscountMaster";
import LedgerGroupMaster from "@/features/masters/pages/Masters/LedgerGroupMaster";
import LedgerMaster from "@/features/masters/pages/Masters/LedgerMaster";
import Masters from "@/features/masters/pages/Masters/Masters";
import MastersPlaceholder from "@/features/masters/pages/Masters/MastersPlaceholder";
import ProductFormPage from "@/features/masters/pages/Masters/ProductFormPage";
import ProductMaster from "@/features/masters/pages/Masters/ProductMaster";
import TaxMaster from "@/features/masters/pages/Masters/TaxMaster";
import UomMaster from "@/features/masters/pages/Masters/UomMaster";
import VendorMaster from "@/features/masters/pages/Masters/VendorMaster";
import VendorFormPage from "@/features/masters/pages/Masters/VendorFormPage";
import WarehouseMaster from "@/features/masters/pages/Masters/WarehouseMaster";

export const mastersRoutes = (
  <Route path="/masters">
    <Route index element={<Masters />} />
    <Route path="ledger-groups" element={<LedgerGroupMaster />} />
    <Route path="ledger" element={<LedgerMaster />} />
    <Route path="product" element={<ProductMaster />} />
    <Route path="product/new" element={<ProductFormPage />} />
    <Route path="product/:productId/edit" element={<ProductFormPage />} />
    <Route path="uom" element={<UomMaster />} />
    <Route path="vendor" element={<VendorMaster />} />
    <Route path="vendor/new" element={<VendorFormPage />} />
    <Route path="vendor/:vendorId/edit" element={<VendorFormPage />} />
    <Route path="customers" element={<CustomerMaster />} />
    <Route path="customers/new" element={<CustomerFormPage />} />
    <Route path="customers/:customerId/edit" element={<CustomerFormPage />} />
    <Route path="currency" element={<CurrencyMaster />} />
    <Route path="warehouse" element={<WarehouseMaster />} />
    <Route path="category" element={<CategoryMaster />} />
    <Route path="tax" element={<TaxMaster />} />
    <Route path="price-discount" element={<DiscountMaster />} />
    <Route
      path="users"
      element={
        <MastersPlaceholder
          title="User / Role Master"
          description="User and role master page placeholder is ready for later integration."
        />
      }
    />
  </Route>
);
