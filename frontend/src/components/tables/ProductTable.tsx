import { ProductListItem, useDeleteProductMutation } from "../../app/api/productApi";
import MasterTableActions from "./shared/MasterTableActions";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

export default function ProductTable({
  products,
  isLoading,
  isError,
  onEdit,
}: {
  products: ProductListItem[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (product: ProductListItem) => void;
}) {
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  if (isLoading) {
    return <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">Loading products...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-600 dark:text-red-400">Error loading products.</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1280px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Code</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Name</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Tax</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Base UOM</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Category</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Vendor</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">{product.basicInfo.code}</TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">{product.basicInfo.name}</TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">{product.basicInfo.taxName ?? "-"}</TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">{product.stockAndMeasurement.baseUomName}</TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">{product.categorization.groupCategoryName ?? "-"}</TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">{product.categorization.vendorName ?? "-"}</TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${product.status === "Active" ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>{product.status}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <MasterTableActions
                      isDeleting={isDeleting}
                      onEdit={() => onEdit(product)}
                      onDelete={() => {
                        if (window.confirm(`Delete product "${product.basicInfo.name}"?`)) {
                          void deleteProduct(product.id).unwrap();
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {products.length === 0 ? <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">No product records yet. Use "Add +" to create the first one.</div> : null}
    </div>
  );
}
