import { Outlet } from "react-router-dom";
import { Backdrop, Header, Sidebar } from "../components/common/Layouts";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
// import { useRoutePermission } from "../hooks/useRoutePermission";

const LayoutContent: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();

  // Automatically check permissions on every route change
  // useRoutePermission(); // Disabled for design migration

  return (
    <div className="min-h-screen lg:flex bg-white dark:bg-neutral-900">
      <div>
        <Sidebar />
        <Backdrop />
      </div>
      <div
        className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ease-in-out ${
          isExpanded ? "lg:ml-[280px]" : "lg:ml-[80px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <Header />
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="p-4 md:p-6 lg:p-8">
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
