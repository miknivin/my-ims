import { useNavigate, useParams } from "react-router";
import { useGetCustomerByIdQuery } from "../../app/api/customerApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import CustomerForm from "../../components/page-components/masters/customer/CustomerForm";

export default function CustomerFormPage() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const isEdit = Boolean(customerId);
  const { data: customer, isLoading, isError } = useGetCustomerByIdQuery(customerId ?? "", {
    skip: !customerId,
  });

  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle={isEdit ? "Edit Customer" : "Add Customer"} />

      {isLoading ? (
        <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Loading customer details...
        </div>
      ) : isError ? (
        <div className="py-10 text-center text-sm text-red-600 dark:text-red-400">
          Unable to load customer details.
        </div>
      ) : (
        <CustomerForm customer={customer} onClose={() => navigate("/masters/customers")} />
      )}
    </div>
  );
}
