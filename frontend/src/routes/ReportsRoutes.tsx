import { Route } from "react-router";
import MastersPlaceholder from "../pages/Masters/MastersPlaceholder";

export const reportsRoutes = (
  <Route path="/reports">
    <Route
      path="bill-wise-report"
      element={
        <MastersPlaceholder
          title="Bill-wise Report"
          description="Report placeholder is ready for later integration."
        />
      }
    />
    <Route
      path="bill-wise-profit"
      element={
        <MastersPlaceholder
          title="Bill-wise Profit"
          description="Report placeholder is ready for later integration."
        />
      }
    />
    <Route
      path="item-wise-profit"
      element={
        <MastersPlaceholder
          title="Item-wise Profit"
          description="Report placeholder is ready for later integration."
        />
      }
    />
    <Route
      path="item-wise-movement"
      element={
        <MastersPlaceholder
          title="Item-wise Movement"
          description="Report placeholder is ready for later integration."
        />
      }
    />
    <Route
      path="ledger-wise"
      element={
        <MastersPlaceholder
          title="Ledger-view"
          description="Ledger report placeholder is ready for later integration."
        />
      }
    />
  </Route>
);
