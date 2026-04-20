import { useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import VendorForm from "../../components/page-components/masters/vendor/VendorForm";
import { useGetVendorByIdQuery } from "../../app/api/vendorApi";

export default function VendorFormPage() {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const isEdit = Boolean(vendorId);
  const {
    data: vendor,
    isLoading,
    isError,
  } = useGetVendorByIdQuery(vendorId ?? "", {
    skip: !vendorId,
  });

  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle={isEdit ? "Edit Vendor" : "Add Vendor"} />

      {isLoading ? (
        <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Loading vendor details...
        </div>
      ) : isError ? (
        <div className="py-10 text-center text-sm text-red-600 dark:text-red-400">
          Unable to load vendor details.
        </div>
      ) : (
        <VendorForm
          vendor={vendor}
          onClose={() => navigate("/masters/vendor")}
        />
      )}
    </div>
  );
}
