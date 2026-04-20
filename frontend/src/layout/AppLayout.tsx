import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const LayoutContent: React.FC = () => {
  const { isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div className={`flex min-h-screen flex-1 flex-col ${isMobileOpen ? "overflow-hidden" : ""}`}>
        <AppHeader />
        <div className="mx-auto w-full max-w-[1680px] px-4 py-4 md:px-6 md:py-6 2xl:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
