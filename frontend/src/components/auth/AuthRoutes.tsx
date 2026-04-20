import { Navigate, Outlet, useLocation } from "react-router";
import { useGetSessionQuery } from "../../app/api/authApi";

const FullPageMessage = ({ message }: { message: string }) => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 text-sm text-gray-600 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
      {message}
    </div>
  </div>
);

export function ProtectedRoute() {
  const location = useLocation();
  const { data, isLoading, isFetching, error } = useGetSessionQuery();

  if (isLoading || isFetching) {
    return <FullPageMessage message="Checking your session..." />;
  }

  if (!data?.success || error) {
    const redirectTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/signin?redirect=${encodeURIComponent(redirectTo)}`} replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { data, isLoading, isFetching } = useGetSessionQuery();

  if (isLoading || isFetching) {
    return <FullPageMessage message="Checking your session..." />;
  }

  if (data?.success) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
