import { Route } from "react-router";
import UserProfiles from "@/features/user-profile/pages/UserProfiles";
import Home from "@/features/dashboard/pages/Dashboard/Home";
import SettingsPage from "@/features/settings/pages/Settings/SettingsPage";

export const appPageRoutes = (
  <>
    <Route index path="/" element={<Home />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/profile" element={<UserProfiles />} />
  </>
);
