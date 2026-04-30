import { Route } from "react-router";
import SignIn from "../pages/AuthPages/SignIn";
import SignUp from "../pages/AuthPages/SignUp";

export const authPageRoutes = (
  <>
    <Route path="/signin" element={<SignIn />} />
    <Route path="/signup" element={<SignUp />} />
  </>
);
