import { Route } from "react-router";
import UserProfiles from "../pages/UserProfiles";
import Alerts from "../pages/UiElements/Alerts";
import Avatars from "../pages/UiElements/Avatars";
import Badges from "../pages/UiElements/Badges";
import Buttons from "../pages/UiElements/Buttons";
import Images from "../pages/UiElements/Images";
import Videos from "../pages/UiElements/Videos";
import LineChart from "../pages/Charts/LineChart";
import BarChart from "../pages/Charts/BarChart";
import Calendar from "../pages/Calendar";
import BasicTables from "../pages/Tables/BasicTables";
import FormElements from "../pages/Forms/FormElements";
import Blank from "../pages/Blank";
import Home from "../pages/Dashboard/Home";
import SettingsPage from "../pages/Settings/SettingsPage";

export const appPageRoutes = (
  <>
    <Route index path="/" element={<Home />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/profile" element={<UserProfiles />} />
    <Route path="/calendar" element={<Calendar />} />
    <Route path="/blank" element={<Blank />} />
    <Route path="/form-elements" element={<FormElements />} />
    <Route path="/basic-tables" element={<BasicTables />} />
    <Route path="/alerts" element={<Alerts />} />
    <Route path="/avatars" element={<Avatars />} />
    <Route path="/badge" element={<Badges />} />
    <Route path="/buttons" element={<Buttons />} />
    <Route path="/images" element={<Images />} />
    <Route path="/videos" element={<Videos />} />
    <Route path="/line-chart" element={<LineChart />} />
    <Route path="/bar-chart" element={<BarChart />} />
  </>
);
