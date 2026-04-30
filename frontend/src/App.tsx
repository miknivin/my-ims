import { BrowserRouter as Router, Routes, Route } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { ProtectedRoute, PublicOnlyRoute } from "./components/auth/AuthRoutes";
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
      </Router>
    </>
  );
}
