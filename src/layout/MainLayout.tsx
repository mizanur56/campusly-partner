import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChatWidget } from "../components/chat/ChatWidget";
import { Backdrop, Header, Sidebar } from "../components/common/Layouts";
import { ChatProvider } from "../context/ChatContext";
import { PreviewModeProvider, usePreviewMode } from "../context/PreviewModeContext";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { StudentProfileProvider } from "../context/StudentProfileContext";
import { useGetPartnerProfileQuery } from "../redux/features/profile/partnerProfileApi";
// import { useRoutePermission } from "../hooks/useRoutePermission";

const ENTER_MS = 500;
const EXIT_MS = 500;
const DELAY_BETWEEN_MS = 220;

const LayoutContent: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const { previewMode, togglePreviewMode } = usePreviewMode();
  const [wipePhase, setWipePhase] = useState<"enter" | "exit" | null>(null);

  // Ensure partner profile loads immediately after login (or app load) so
  // sidebar/header have data without requiring a manual refresh.
  useGetPartnerProfileQuery(undefined);

  const handlePreviewSwitch = () => {
    if (wipePhase) return;
    setWipePhase("enter");
    setTimeout(() => {
      togglePreviewMode();
      navigate("/", { replace: true });
      window.scrollTo(0, 0);
      setWipePhase("exit");
      setTimeout(() => setWipePhase(null), EXIT_MS);
    }, ENTER_MS + DELAY_BETWEEN_MS);
  };

  // Always scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Automatically check permissions on every route change
  // useRoutePermission(); // Disabled for design migration

  return (
    <div className="min-h-screen lg:flex bg-[#fefefe] dark:bg-neutral-900 overflow-x-hidden">
      <div>
        <Sidebar />
        <Backdrop />
      </div>
      <div
        className={`flex min-h-screen flex-1 flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isExpanded ? "lg:ml-[280px]" : "lg:ml-[80px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <Header />
        <main className="flex-1 min-h-[calc(100vh-4rem)] pt-[4.5rem] bg-[#fefefe] dark:bg-neutral-900">
          <div className="p-4 md:p-6 lg:p-8 bg-[#fefefe] dark:bg-neutral-900">
            <Outlet key={location.key || location.pathname} />
          </div>
        </main>

        {/* Full-screen wipe: right → left, then left → right */}
        {wipePhase && (
          <div
            className={`preview-wipe-panel fixed inset-0 z-[100] ${wipePhase === "enter" ? "preview-wipe-enter" : "preview-wipe-exit"}`}
            aria-hidden="true"
          />
        )}

        {/* Preview switch button hidden for now */}
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  return (
    <PreviewModeProvider>
      <SidebarProvider>
        <StudentProfileProvider>
          <ChatProvider>
            <LayoutContent />
            <ChatWidget />
          </ChatProvider>
        </StudentProfileProvider>
      </SidebarProvider>
    </PreviewModeProvider>
  );
};

export default MainLayout;
