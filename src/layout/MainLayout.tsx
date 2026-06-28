import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChatWidget } from "../components/chat/ChatWidget";
import { Backdrop, Header, Sidebar } from "../components/common/Layouts";
import { ChatProvider } from "../context/ChatContext";
import {
  PreviewModeProvider,
  usePreviewMode,
} from "../context/PreviewModeContext";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { StudentProfileProvider } from "../context/StudentProfileContext";
import {
  isPartnerPortalUnlocked,
  isPathAllowedBeforePartnerPortalUnlock,
} from "../lib/partnerPortalAccess";
import { selectCurrentUser } from "../redux/features/auth/authSlice";
import { useGetOnboardingStatusQuery } from "../redux/features/onboardingForm";
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
  const user = useSelector(selectCurrentUser);
  const isTeamMember = user?.role === "PARTNER_TEAM_MEMBER";
  const {
    data: onboardingStatus,
    isSuccess: isOnboardingStatusSuccess,
    isError: isOnboardingStatusError,
  } = useGetOnboardingStatusQuery();
  /** RTK Query v2: `isLoading` can be false while the request has not finished; use settled state so we never redirect before `/form-status` returns. */
  const isOnboardingStatusPending =
    !isOnboardingStatusSuccess && !isOnboardingStatusError;
  const hasUnlockedPortal = isPartnerPortalUnlocked(onboardingStatus);
  const { previewMode, togglePreviewMode } = usePreviewMode();
  const [wipePhase, setWipePhase] = useState<"enter" | "exit" | null>(null);

  // Ensure partner profile loads immediately after login (or app load) so
  // sidebar/header have data without requiring a manual refresh.
  useGetPartnerProfileQuery(undefined);

  const portalRouteAllowed =
    isTeamMember ||
    hasUnlockedPortal ||
    isPathAllowedBeforePartnerPortalUnlock(pathname);

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

  if (!isTeamMember && !hasUnlockedPortal) {
    if (
      isOnboardingStatusPending &&
      !isPathAllowedBeforePartnerPortalUnlock(pathname)
    ) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#fefefe] dark:bg-neutral-900">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-border border-t-primary-600 dark:border-gray-700 dark:border-t-primary-400" />
        </div>
      );
    }
    if (!isOnboardingStatusPending && !portalRouteAllowed) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-[var(--fynix-bg)] lg:flex">
    <div>
      <Sidebar />
      <Backdrop />
    </div>
    <div
      className={`flex flex-1 flex-col bg-[var(--fynix-bg)] transition-all duration-300 ease-in-out ${
        isExpanded ? "lg:ml-[260px]" : "lg:ml-[72px]"
      } ${isMobileOpen ? "ml-0" : ""}`}
    >
      <Header />
      <main className="min-h-[calc(100vh-4.5rem)] bg-[var(--fynix-content)] shadow-[inset_6px_0_20px_-12px_rgba(26,29,31,0.05)]">
        <div className="px-3 py-4 sm:px-4 sm:py-5 lg:px-4 lg:py-5">
          <Outlet key={location.pathname} />
        </div>
      </main>

       {/* Full-screen wipe: right → left, then left → right */}
       {wipePhase && (
          <div
            className={`preview-wipe-panel fixed inset-0 z-[100] ${wipePhase === "enter" ? "preview-wipe-enter" : "preview-wipe-exit"}`}
            aria-hidden="true"
          />
        )}
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
