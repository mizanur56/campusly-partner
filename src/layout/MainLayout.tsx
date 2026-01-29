import { Outlet } from "react-router-dom";
import { Backdrop, Header, Sidebar } from "../components/common/Layouts";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
// import { useRoutePermission } from "../hooks/useRoutePermission";

const LayoutContent: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();

  // Automatically check permissions on every route change
  // useRoutePermission(); // Disabled for design migration

  return (
    <div className="min-h-screen lg:flex bg-gray-50/50 dark:bg-gray-900">
      <div>
        <Sidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out flex-col ${
          isExpanded ? "lg:ml-[280px]" : "lg:ml-[80px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <Header />
        <main className="min-h-[calc(100vh-64px)]">
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default MainLayout;
