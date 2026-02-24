import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Backdrop, Header, Sidebar } from "../components/common/Layouts";
import { usePreviewMode } from "../context/PreviewModeContext";
import { PreviewModeProvider } from "../context/PreviewModeContext";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
// import { useRoutePermission } from "../hooks/useRoutePermission";

const ENTER_MS = 500;
const EXIT_MS = 500;
const DELAY_BETWEEN_MS = 220;

const LayoutContent: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { previewMode, togglePreviewMode } = usePreviewMode();
  const [wipePhase, setWipePhase] = useState<"enter" | "exit" | null>(null);

  const handlePreviewSwitch = () => {
    if (wipePhase) return;
    setWipePhase("enter");
    setTimeout(() => {
      togglePreviewMode();
      navigate("/", { replace: true });
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
    <div className="min-h-screen lg:flex bg-white dark:bg-neutral-900">
      <div>
        <Sidebar />
        <Backdrop />
      </div>
      <div
        className={`flex min-h-screen flex-1 flex-col min-w-0 overflow-x-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "lg:ml-[280px]" : "lg:ml-[80px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <Header />
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>

        {/* Full-screen wipe: right → left, then left → right */}
        {wipePhase && (
          <div
            className={`preview-wipe-panel fixed inset-0 z-[100] ${wipePhase === "enter" ? "preview-wipe-enter" : "preview-wipe-exit"}`}
            aria-hidden="true"
          />
        )}

        {/* Preview switch — fixed bottom */}
        <div className="pointer-events-none fixed bottom-6 right-6 z-30">
          <div className="preview-btn-rotating-border pointer-events-none rounded-full p-[3px]">
            <button
              type="button"
              onClick={handlePreviewSwitch}
              className="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm transition-colors hover:bg-primary-50 dark:bg-gray-900 dark:text-primary-200 dark:hover:bg-primary-900/30"
            >
              <span className="text-primary-600 dark:text-primary-400">
                {previewMode === "onboarding" ? "Signed" : "Onboarding"}
              </span>
              <span className="text-gray-500 dark:text-gray-400">preview</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  return (
    <PreviewModeProvider>
      <SidebarProvider>
        <LayoutContent />
      </SidebarProvider>
    </PreviewModeProvider>
  );
};

export default MainLayout;
