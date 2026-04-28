import { Tooltip } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdOutlineContentPaste } from "react-icons/md";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { config } from "../../../config";
import { usePreviewMode } from "../../../context/PreviewModeContext";
import { useSidebar } from "../../../context/SidebarContext";
import { useStudentProfile } from "../../../context/StudentProfileContext";
import { useFilteredSidebarItems } from "../../../hooks/useFilteredSidebarItems";
import { ChevronDownIcon } from "../../../icons";
import { clearAuthLocalStorage } from "../../../lib/authLocalStorage";
import { getPortalLoginUrl } from "../../../lib/portalRouting";
import { selectCurrentUser } from "../../../redux/features/auth/authSlice";
import { useGetOnboardingStatusQuery } from "../../../redux/features/onboardingForm";
import { useGetPartnerProfileQuery } from "../../../redux/features/profile/partnerProfileApi";
import { useGetStudentProfileQuery } from "../../../redux/features/profile/studentProfileApi";
import { NavItem, SubMenuItem } from "../../../types/interfaces";

const SidebarItems: NavItem[] = [
  { icon: <i className="fa-solid fa-house"></i>, name: "Home", path: "/" },
];

/** Full partner sidebar (PARTNER role). */
const SignedSidebarItems: NavItem[] = [
  { icon: <i className="fa-solid fa-house"></i>, name: "Home", path: "/" },
  {
    icon: <i className="fa-solid fa-magnifying-glass"></i>,
    name: "Programs & Schools",
    path: "/programs-schools",
  },
  {
    icon: <i className="fa-solid fa-users"></i>,
    name: "Students",
    path: "/students",
  },
  {
    icon: <i className="fa-solid fa-users-gear"></i>,
    name: "Team Members",
    path: "/team-members",
  },
  {
    icon: <i className="fa-solid fa-file-lines"></i>,
    name: "Applications",
    path: "/applications",
  },
  {
    icon: <i className="fa-solid fa-list-check"></i>,
    name: "Task Management",
    subItems: [
      { name: "Task Management", path: "/task-management" },
      { name: "My Tasks", path: "/my-tasks" },
    ],
  },
  {
    icon: <i className="fa-solid fa-credit-card"></i>,
    name: "Payments",
    path: "/payments/commission",
  },
  {
    icon: <i className="fa-solid fa-graduation-cap"></i>,
    name: "Academy",
    path: "/academy",
  },
  {
    icon: <i className="fa-solid fa-fire"></i>,
    name: "Hot Offers",
    path: "/hot-offers",
  },
  // {
  //   icon: <i className="fa-solid fa-gear"></i>,
  //   name: "Settings",
  //   subItems: [{ name: "Profile", path: "/settings/profile" }],
  // },
];

const TeamMemberSidebarItems: NavItem[] = SignedSidebarItems.filter(
  (item) => item.path !== "/team-members",
);

const SIGNED_ROUTE_PATHS = [
  "/programs-schools",
  "/students",
  "/team-members",
  "/applications",
  "/my-tasks",
  "/announcements",
  "/notifications",
  "/task-management",
  "/payments",
  "/payments/commission",
  "/academy",
  "/hot-offers",
  "/settings/profile",
];

const TEAM_MEMBER_ROUTE_PATHS = [
  "/",
  ...SIGNED_ROUTE_PATHS.filter((path) => path !== "/team-members"),
];

const othersSidebarItems: NavItem[] = [
  {
    icon: <i className="fa-solid fa-sign-out-alt"></i>,
    name: "Logout",
    action: "logout",
  },
];

// Fallback labels when advisor info is unavailable
const fallbackManagedBy = {
  name: "Campus Transfer Support",
  email: "support@campustransfer.com",
  phone: "",
  avatar: "/images/logo/logo-icon.svg",
};

const STUDENT_NAV = [
  {
    key: "profile",
    label: "Profile",
    icon: "fa-solid fa-user",
    path: "profile",
  },
  {
    key: "applications",
    label: "Applications",
    icon: "fa-solid fa-file-lines",
    path: "applications",
  },
];

const Sidebar: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const { previewMode } = usePreviewMode();
  const location = useLocation();
  const navigate = useNavigate();
  const { student } = useStudentProfile();

  const user = useSelector(selectCurrentUser);

  const downloadDocument = useCallback(async (url: string, name?: string) => {
    const resolved = String(url || "").trim();
    if (!resolved) return;
    try {
      const res = await fetch(resolved, { credentials: "include" });
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = name?.trim() ? name.trim() : "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Download failed:", err);
      try {
        window.open(resolved, "_blank");
      } catch {
        // ignore
      }
    }
  }, []);

  // Fetch partner profile to get advisor details
  const {
    data: partnerProfile,
    isLoading: isPartnerProfileLoading,
    isFetching: isPartnerProfileFetching,
  } = useGetPartnerProfileQuery(undefined);

  // Onboarding status: when ACTIVE + portalAccessUnlocked, show signed sidebar even on "/"
  const { data: onboardingStatus } = useGetOnboardingStatusQuery();
  const hasUnlockedPortal =
    onboardingStatus?.status === "ACTIVE" &&
    !!onboardingStatus?.portalAccessUnlocked;

  const isTeamMember = user?.role === "PARTNER_TEAM_MEMBER";
  const resolveAssetBase = () => {
    if (config.image_access_url)
      return String(config.image_access_url).replace(/\/$/, "");
    const apiBase = String(config.api ?? "");
    if (apiBase.startsWith("http")) {
      try {
        return new URL(apiBase).origin;
      } catch {
        return "";
      }
    }
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  };
  const resolveMediaUrl = (
    media?: { id?: string; url?: string | null } | null,
  ) => {
    if (!media) return null;
    const assetBase = resolveAssetBase();
    if (media.url) {
      const raw = String(media.url).startsWith("http")
        ? media.url
        : `${assetBase}/${String(media.url).replace(/^\/+/, "")}`;
      return encodeURI(raw);
    }
    if (media.id) {
      return encodeURI(`${assetBase}/media/${media.id}`);
    }
    return null;
  };

  // Advisor details can arrive from profile or onboarding status.
  // Prefer onboarding advisor when available to avoid stale assignment in preview.
  const onboardingAdvisor = (onboardingStatus?.advisor ?? null) as {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    profile?: { id?: string; url?: string | null } | null;
  } | null;
  const advisor = onboardingAdvisor ?? partnerProfile?.advisor ?? null;
  const profileName = isTeamMember
    ? (user?.name ?? "Team Member")
    : (advisor?.name ?? fallbackManagedBy.name);
  const profileEmail = isTeamMember
    ? (user?.email ?? "")
    : (advisor?.email ?? fallbackManagedBy.email);
  const profilePhone = isTeamMember
    ? ""
    : (advisor?.phone ?? fallbackManagedBy.phone);
  const profilePhotoUrl = isTeamMember
    ? null
    : resolveMediaUrl(advisor?.profile) || null;
  const isManagedByLoading =
    !isTeamMember && (isPartnerProfileLoading || isPartnerProfileFetching);

  // Signed sidebar: partner sees advisor details, team member keeps own account details.
  const _signedProfileName = isTeamMember
    ? (user?.name ?? profileName)
    : profileName;
  const _signedProfileEmail = isTeamMember
    ? (user?.email ?? profileEmail)
    : profileEmail;
  const _signedProfilePhone = isTeamMember ? "" : profilePhone;
  const _signedProfilePhotoUrl = isTeamMember ? null : profilePhotoUrl;

  const handleLogout = () => {
    clearAuthLocalStorage();
    localStorage.removeItem("partner-preview-mode");
    window.location.href = getPortalLoginUrl();
  };

  /* Sidebar mode by context:
   * - STUDENT: /students/:id/* → only student card + Activity/Profile/Applications/Tasks
   * - APPLICATION DETAIL: /applications/:id/* → student card (from application) + Activity/Profile/Applications/Tasks
   * - UNSIGNED (onboarding): / or /onboarding or /contract → partner card + Home
   * - SIGNED: dashboard routes → partner card + full nav
   */
  const isStudentContext = /^\/students\/[^/]+(\/|$)/.test(location.pathname);
  const isApplicationDetailContext = /^\/applications\/[^/]+(\/|$)/.test(
    location.pathname,
  );
  const studentIdFromPath = isStudentContext
    ? location.pathname.split("/")[2]
    : null;
  const studentId = isStudentContext
    ? studentIdFromPath
    : isApplicationDetailContext
      ? student?.id
      : null;
  const showStudentSidebar =
    (isStudentContext && studentIdFromPath) ||
    (isApplicationDetailContext && student);

  const { data: _studentProfileForNav } = useGetStudentProfileQuery(
    studentId!,
    { skip: !studentId || !showStudentSidebar },
  );

  const studentNavItems = useMemo(() => STUDENT_NAV, []);
  const isOnboardingContext =
    (location.pathname === "/" && previewMode === "onboarding") ||
    location.pathname.startsWith("/onboarding") ||
    location.pathname.startsWith("/contract");
  const signedPaths = isTeamMember
    ? TEAM_MEMBER_ROUTE_PATHS
    : SIGNED_ROUTE_PATHS;
  const isSignedContext =
    !isStudentContext &&
    !isApplicationDetailContext &&
    ((location.pathname === "/" &&
      (previewMode === "signed" || hasUnlockedPortal || isTeamMember)) ||
      signedPaths.includes(location.pathname) ||
      location.pathname.startsWith("/payments") ||
      (isTeamMember &&
        (location.pathname.startsWith("/students/") ||
          location.pathname.startsWith("/applications/"))));

  // Application details loading: show loading state (click korar sathe start)
  const isApplicationDetailLoading = isApplicationDetailContext && !student;
  const baseItems = isSignedContext
    ? isTeamMember
      ? TeamMemberSidebarItems
      : SignedSidebarItems
    : SidebarItems;

  const filteredSidebarItems = useFilteredSidebarItems(baseItems);
  const isSignedSidebar = isSignedContext;

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => {
      if (path === "/") {
        // Treat onboarding + contract flows as part of "Home"
        return (
          location.pathname === "/" ||
          location.pathname.startsWith("/onboarding") ||
          location.pathname === "/contract" ||
          location.pathname.startsWith("/contract/")
        );
      }
      if (path.startsWith("/payments")) {
        // Single "Payments" menu should stay active for Purchase/Commission tabs
        return location.pathname.startsWith("/payments");
      }
      return location.pathname === path;
    },
    [location.pathname],
  );

  const isAnyNestedItemActive = useCallback(
    (items: SubMenuItem[]): boolean => {
      return items.some((item) => {
        if (item.path && isActive(item.path)) return true;
        if (item.subItems) return isAnyNestedItemActive(item.subItems);
        return false;
      });
    },
    [isActive],
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items =
        menuType === "main" ? filteredSidebarItems : othersSidebarItems;
      items.forEach((nav, index) => {
        if (nav.subItems && isAnyNestedItemActive(nav.subItems)) {
          setOpenSubmenu({
            type: menuType as "main" | "others",
            index,
          });
          submenuMatched = true;
        }
      });
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [location, isActive, filteredSidebarItems, isAnyNestedItemActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) =>
      prev?.type === menuType && prev?.index === index
        ? null
        : { type: menuType, index },
    );
  };

  const renderNestedMenuItems = (items: SubMenuItem[], level = 0) => (
    <ul className={`space-y-1 ${level > 0 ? "ml-4" : ""}`}>
      {items.map((item, index) => (
        <li key={`${item.name}-${index}`}>
          {item.subItems ? (
            <div>
              <button
                className={`menu-dropdown-item w-full text-left text-[0.9375rem] font-medium ${
                  isAnyNestedItemActive(item.subItems)
                    ? "menu-dropdown-item-active"
                    : "menu-dropdown-item-inactive"
                }`}
              >
                {item.name}
                <ChevronDownIcon className="ml-auto w-4 h-4" />
              </button>
              <div className="ml-4 mt-1">
                {renderNestedMenuItems(item.subItems, level + 1)}
              </div>
            </div>
          ) : (
            <Link
              to={item.path || "#"}
              className={`menu-dropdown-item text-[0.9375rem] font-medium ${
                item.path && isActive(item.path)
                  ? "menu-dropdown-item-active"
                  : "menu-dropdown-item-inactive"
              }`}
            >
              {item.name}
              {item.new && (
                <span className="ml-auto menu-dropdown-badge">new</span>
              )}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  const menuItemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-1 relative">
      {items.map((nav, index) => {
        if (nav.action === "logout") return null;
        return (
          <li
            key={nav.name}
            className="relative overflow-y-auto"
            ref={(el) => {
              menuItemRefs.current[`${menuType}-${index}`] = el;
            }}
          >
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group cursor-pointer ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                }`}
              >
                <span className="menu-item-icon-size menu-item-icon-inactive">
                  <span
                    className={`menu-item-icon-size ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "text-primary-500"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                </span>
                {(isExpanded || isMobileOpen) &&
                  (nav.name.length > 15 ? (
                    <Tooltip title={nav.name} placement="right">
                      <span
                        className={`text-left truncate max-w-[150px] ${isSignedSidebar ? "text-sm font-medium" : "text-base font-semibold"}`}
                      >
                        {nav.name.substring(0, 15) + "..."}
                      </span>
                    </Tooltip>
                  ) : (
                    <span
                      className={`text-left ${isSignedSidebar ? "text-sm font-medium" : "text-base font-medium"}`}
                    >
                      {nav.name}
                    </span>
                  ))}
                {nav.subItems && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "rotate-180 text-primary-500"
                        : ""
                    }`}
                  />
                )}
              </button>
            ) : nav.path ? (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path)
                    ? "menu-item-active pl-5 transition-all duration-300"
                    : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {!isExpanded ? (
                      <Tooltip title={nav.name} placement="right">
                        <span>{nav.icon}</span>
                      </Tooltip>
                    ) : (
                      nav.icon
                    )}
                  </span>
                </span>
                {(isExpanded || isMobileOpen) && (
                  <span
                    className={`flex min-w-0 flex-1 items-center gap-2 text-left ${isSignedSidebar ? "text-sm font-medium" : "text-base font-semibold"}`}
                  >
                    <span className="truncate">{nav.name}</span>
                    {nav.badgeCount && nav.badgeCount > 0 ? (
                      <span className="ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold text-white">
                        {nav.badgeCount > 99 ? "99+" : nav.badgeCount}
                      </span>
                    ) : null}
                  </span>
                )}
              </Link>
            ) : null}
            {nav.subItems && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300 ml-9 mt-1"
                style={{
                  height:
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                {renderNestedMenuItems(nav.subItems)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col transition-all duration-300 ease-in-out lg:mt-0
        border-r-[1px] border-[#C7CACF] bg-[#FFFFFF] dark:border-[#353646] dark:bg-[#20242A]
        ${isExpanded || isMobileOpen ? "w-[280px]" : "w-[80px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
    >
      {/* Logo */}
      <div
        className={`flex px-5 pb-0 ${
          !isExpanded && !isMobileOpen ? "lg:justify-center" : ""
        }`}
      >
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/images/logo/Frame1044.svg"
            alt="Campus Transfer"
            className={
              isExpanded || isMobileOpen
                ? "h-20 w-auto max-w-[300px]"
                : "h-14 w-14 object-contain"
            }
          />
        </Link>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Sidebar preview: UNSIGNED (onboarding) partner view – "Managed by" card */}
        {(isExpanded || isMobileOpen) && isOnboardingContext && (
          <div className="mx-3 mt-0 rounded-xl bg-gray-50/80 p-3 dark:bg-gray-800/40">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Managed by
            </p>
            {isManagedByLoading ? (
              <div className="mt-2 animate-pulse">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-3.5 w-full rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3.5 w-4/5 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ) : (
              <>
                <div className="mt-2 flex items-center gap-2.5">
                  {profilePhotoUrl ? (
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <img
                        src={profilePhotoUrl}
                        alt={profileName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                    {profileName}
                  </p>
                </div>
                <div className="mt-2.5 space-y-1.5">
                  {profileEmail && (
                    <a
                      href={`mailto:${profileEmail}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                    >
                      <svg
                        className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="min-w-0 truncate">{profileEmail}</span>
                    </a>
                  )}
                  {profilePhone && (
                    <a
                      href={`tel:${profilePhone.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                    >
                      <svg
                        className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span className="min-w-0 truncate">{profilePhone}</span>
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Sidebar preview: SIGNED view – show own profile info (logged-in user) */}
        {/* {(isExpanded || isMobileOpen) && isSignedContext && (
        <div className="mx-3 mt-0 rounded-xl bg-gray-50/80 p-3 dark:bg-gray-800/40">
          <div className="mt-0 flex items-center gap-2.5">
            {signedProfilePhotoUrl ? (
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <img
                  src={signedProfilePhotoUrl}
                  alt={signedProfileName}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-100">
                {signedProfileName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800 dark:text-gray-100">
              {signedProfileName}
            </p>
          </div>
          <div className="mt-2.5 space-y-1.5">
            {signedProfileEmail && (
              <a
                href={`mailto:${signedProfileEmail}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="min-w-0 truncate">{signedProfileEmail}</span>
              </a>
            )}
            {signedProfilePhone && (
              <a
                href={`tel:${signedProfilePhone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="min-w-0 truncate">{signedProfilePhone}</span>
              </a>
            )}
          </div>
        </div>
      )} */}

        {/* Sidebar preview: APPLICATION DETAIL (loading skeleton while student sidebar data loads) */}
        {(isExpanded || isMobileOpen) && isApplicationDetailLoading && (
          <div className="mt-3 animate-pulse">
            <div className="flex flex-col items-center gap-2.5">
              <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="w-full px-4 text-center space-y-2">
                <div className="mx-auto h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mx-auto h-3 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mx-auto h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>

            <div className="mt-3 space-y-2 mx-4">
              <div className="rounded-2xl border border-gray-200/60 bg-white p-5 dark:border-gray-700 dark:bg-gray-900/40">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="mt-5 space-y-3">
                  <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200/60 bg-white p-5 dark:border-gray-700 dark:bg-gray-900/40">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar preview: STUDENT / APPLICATION DETAIL – student profile card + Activity/Profile/Applications/Tasks */}
        {(isExpanded || isMobileOpen) && showStudentSidebar && studentId && (
          <div className="mt-3">
            <div className="flex flex-col items-center gap-2.5">
              <div className="shrink-0">
                <img
                  src={
                    student?.avatar ?? `https://i.pravatar.cc/80?u=${studentId}`
                  }
                  alt=""
                  className="h-20 w-20 rounded-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 text-center space-y-2">
                <p className="truncate text-[18px] font-semibold text-gray-800 dark:text-gray-100">
                  {student?.name ?? "Student"}
                </p>
                <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-snug break-words">
                  {student?.email}
                </p>
                <p className="mt-0.5 text-[14px] text-gray-600 dark:text-gray-300">
                  Status: <strong>{student?.status ?? "Active"}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip title="Edit profile" placement="bottom">
                  <button
                    type="button"
                    onClick={() => navigate(`/students/${studentId}/profile`)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-[#E9F2EB] text-[#237D3B] hover:bg-[#E9F2EB] hover:text-[#237D3B] transition-colors dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300 dark:hover:bg-gray-800"
                    aria-label="Edit profile"
                  >
                    <i className="fa-solid fa-pen-to-square text-sm" />
                  </button>
                </Tooltip>

                <Tooltip title="Copy email" placement="bottom">
                  <button
                    type="button"
                    onClick={async () => {
                      const text = (student?.email ?? "").trim();
                      if (!text) return;
                      try {
                        await navigator.clipboard.writeText(text);
                      } catch {
                        // Fallback for older browsers
                        const ta = document.createElement("textarea");
                        ta.value = text;
                        ta.style.position = "fixed";
                        ta.style.left = "-9999px";
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand("copy");
                        ta.remove();
                      }
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-[#E9F2EB] text-[#237D3B] hover:bg-[#E9F2EB] hover:text-[#237D3B] transition-colors dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300 dark:hover:bg-gray-800"
                    aria-label="Copy email"
                  >
                    <MdOutlineContentPaste className="text-sm" />
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Application details cards (only in Application Details context) */}
            {isApplicationDetailContext && student?.applicationSidebar && (
              <div className="mt-3 space-y-2 mx-4">
                <div className="rounded-2xl border border-[#CFCACF] bg-[#FFFFFF] p-5 dark:border-gray-700 dark:bg-gray-900/40">
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-semibold text-[#20242A] dark:text-gray-100">
                      Application ID
                    </p>
                    <p className="text-[14px] text-[#20242A] dark:text-gray-200">
                      {student.applicationSidebar.applicationId ?? "—"}
                    </p>
                  </div>

                  <div className="mt-5 space-y-5">
                    <p className="text-[14px] font-bold tracking-wide text-[#20242A] dark:text-gray-100">
                      MAIN PROGRAM
                    </p>

                    <div className="space-y-1">
                      <p className="text-[14px] text-[#4B5563] dark:text-gray-300">
                        Selected intake
                      </p>
                      <p className="text-[14px] text-[#4B5563] dark:text-gray-300">
                        {student.applicationSidebar.intake ?? "—"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[14px] font-semibold text-[#20242A] dark:text-gray-100">
                        Program
                      </p>
                      <p className="text-[14px] font-medium text-[#237D3B] ">
                        {student.applicationSidebar.program ?? "—"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-[14px] font-semibold text-[#20242A] dark:text-gray-100">
                        <i className="fa-solid fa-graduation-cap" />
                        School
                      </p>
                      <p className="text-[14px] font-medium text-[#237D3B] leading-snug">
                        {student.applicationSidebar.school ?? "—"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-[14px] font-semibold text-[#20242A] dark:text-gray-100">
                        <i className="fa-solid fa-globe" />
                        Country
                      </p>
                      <p className="text-[14px] text-[#20242A] dark:text-gray-200">
                        {student.applicationSidebar.country ?? "—"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[14px] font-semibold text-[#20242A] dark:text-gray-100">
                        Level
                      </p>
                      <p className="text-[14px] text-[#4B5563] dark:text-gray-300">
                        {student.applicationSidebar.level ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {student.applicationSidebar.applicationFee && (
                  <div className="rounded-2xl border border-[#CFCACF] bg-[#FFFFFF] p-5 dark:border-gray-700 dark:bg-gray-900/40">
                    <div className="flex items-center justify-between">
                      <p className="text-[14px] font-semibold text-[#20242A] dark:text-gray-100">
                        Application fee
                      </p>
                      <p className="text-[14px]  text-[#20242A] dark:text-gray-100">
                        {student.applicationSidebar.applicationFee.amountText ??
                          "—"}
                      </p>
                    </div>

                    <div className="mt-5 space-y-5">
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] font-semibold text-[#20242A] dark:text-gray-100">
                          Payment status
                        </p>
                        <p className="text-[14px] text-[#20242A] dark:text-gray-200">
                          {student.applicationSidebar.applicationFee
                            .statusText ?? "—"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-[14px] font-semibold text-[#20242A] dark:text-gray-100">
                          Payment date
                        </p>
                        <p className="text-[14px] text-[#20242A] dark:text-gray-200">
                          {student.applicationSidebar.applicationFee
                            .paymentDateText ?? "—"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-[14px] font-semibold text-[#20242A] dark:text-gray-100">
                          Receipt
                        </p>
                        {student.applicationSidebar.applicationFee
                          .receiptUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              downloadDocument(
                                student?.applicationSidebar?.applicationFee
                                  ?.receiptUrl ?? "",
                                "application-fee-receipt",
                              )
                            }
                            className="text-[14px] font-medium text-[#237D3B] hover:underline underline-offset-4"
                          >
                            Download receipt
                          </button>
                        ) : (
                          <p className="text-[14px] text-[#20242A] dark:text-gray-200">
                            —
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <nav className="mt-3 space-y-0.5">
              {studentNavItems.map((item) => {
                const path = `/students/${studentId}/${item.path}`;
                const isActiveNav = location.pathname === path;
                return (
                  <Link
                    key={item.key}
                    to={path}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.9375rem] font-medium transition-colors ${
                      isActiveNav
                        ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <i className={`${item.icon} w-4 text-center`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Sidebar preview nav: UNSIGNED → Home only | SIGNED → full partner nav | STUDENT/APPLICATION → hidden (handled by student sidebar above) */}
        <div className="flex flex-col">
          {isApplicationDetailLoading && (
            <div className="px-3 py-4">
              <div className="flex flex-col gap-2 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 rounded-lg bg-gray-200 dark:bg-gray-700"
                  />
                ))}
              </div>
            </div>
          )}
          {!showStudentSidebar && !isApplicationDetailLoading && (
            <div className="px-3 py-4">
              <nav className="flex flex-col gap-1">
                {renderMenuItems(filteredSidebarItems, "main")}
              </nav>
            </div>
          )}

          {/* Sidebar preview: STUDENT / APPLICATION – back link below student sidebar */}
          {showStudentSidebar && studentId && (
            <div className="px-3 py-4">
              <Link
                to={isApplicationDetailContext ? "/applications" : "/students"}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.9375rem] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-gray-100 transition-colors"
              >
                <i className="fa-solid fa-arrow-left w-4 text-center" />
                <span>
                  {isApplicationDetailContext
                    ? "Back to Applications"
                    : "Back to Students"}
                </span>
              </Link>
            </div>
          )}

          <div className="px-3 py-3">
            <button
              type="button"
              onClick={handleLogout}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-normal text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 ${
                !isExpanded && !isMobileOpen ? "justify-center" : ""
              }`}
            >
              <span className="text-lg">
                {!isExpanded && !isMobileOpen ? (
                  <Tooltip title="Logout" placement="right">
                    <span>
                      <i className="fa-solid fa-sign-out-alt"></i>
                    </span>
                  </Tooltip>
                ) : (
                  <i className="fa-solid fa-sign-out-alt"></i>
                )}
              </span>
              {(isExpanded || isMobileOpen) && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
