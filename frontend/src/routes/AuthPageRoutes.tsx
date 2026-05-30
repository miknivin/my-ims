import { Route } from "react-router";
import SignIn from "@/features/auth/pages/AuthPages/SignIn";
import SignUp from "@/features/auth/pages/AuthPages/SignUp";

export const authPageRoutes = (
  <>
    <Route path="/signin" element={<SignIn />} />
    <Route path="/signup" element={<SignUp />} />
  </>
);
