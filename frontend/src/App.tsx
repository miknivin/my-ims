import { BrowserRouter as Router, Routes, Route } from "react-router";
import NotFound from "@/shared/pages/OtherPage/NotFound";
import AppLayout from "@/shared/layout/AppLayout";
import { ScrollToTop } from "@/shared/components/common/ScrollToTop";
import { ProtectedRoute, PublicOnlyRoute } from "@/features/auth/components/auth/AuthRoutes";
import { QuickAddProductProvider } from "@/shared/providers/QuickAddProductProvider";
import { appPageRoutes } from "./routes/AppPageRoutes";
import { authPageRoutes } from "./routes/AuthPageRoutes";
import { mastersRoutes } from "./routes/MastersRoutes";
import { operationsRoutes } from "./routes/OperationsRoutes";
import { reportsRoutes } from "./routes/ReportsRoutes";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <QuickAddProductProvider>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                {appPageRoutes}
                {mastersRoutes}
                {operationsRoutes}
                {reportsRoutes}
              </Route>
            </Route>

            <Route element={<PublicOnlyRoute />}>{authPageRoutes}</Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </QuickAddProductProvider>
      </Router>
    </>
  );
}
