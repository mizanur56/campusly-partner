import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { config } from "../../../config";
import { usePreviewMode } from "../../../context/PreviewModeContext";
import { useSidebar } from "../../../context/SidebarContext";
import { useFilteredSidebarItems } from "../../../hooks/useFilteredSidebarItems";
import { useStudentProfile } from "../../../context/StudentProfileContext";
import { ChevronDownIcon } from "../../../icons";
import { selectCurrentUser } from "../../../redux/features/auth/authSlice";
import { useGetPartnerProfileQuery } from "../../../redux/features/profile/partnerProfileApi";
import { useGetOnboardingStatusQuery } from "../../../redux/features/onboardingForm";
import { NavItem, SubMenuItem } from "../../../types/interfaces";
import { Tooltip } from "antd";

const SidebarItems: NavItem[] = [
  { icon: <i className="fa-solid fa-house"></i>, name: "Home", path: "/" },
];

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
    name: "My Tasks",
    path: "/my-tasks",
  },
  {
    icon: <i className="fa-solid fa-credit-card"></i>,
    name: "Payments",
    subItems: [
      { name: "Purchase", path: "/payments/purchase" },
      { name: "Commission", path: "/payments/commission" },
    ],
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
];
const SIGNED_ROUTE_PATHS = [
  "/programs-schools",
  "/students",
  "/team-members",
  "/applications",
  "/my-tasks",
  "/payments",
  "/payments/purchase",
  "/payments/commission",
  "/academy",
  "/hot-offers",
];

const othersSidebarItems: NavItem[] = [
  {
    icon: <i className="fa-solid fa-sign-out-alt"></i>,
    name: "Logout",
    action: "logout",
  },
];

// Fallback when no logged-in user
const fallbackManagedBy = {
  name: "Dipak Sharma",
  email: "dipak@campustransfer.com",
  phone: "+977 017879 39155",
  avatar: "/images/logo/logo-icon.svg",
};

const STUDENT_NAV = [
  {
    key: "activity",
    label: "Activity",
    icon: "fa-solid fa-chart-line",
    path: "activity",
  },
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
  {
    key: "tasks",
    label: "Tasks",
    icon: "fa-solid fa-list-check",
    path: "tasks",
  },
];

const Sidebar: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const { previewMode } = usePreviewMode();
  const location = useLocation();
  const navigate = useNavigate();
  const { student } = useStudentProfile();
  const user = useSelector(selectCurrentUser);

  // Fetch partner profile to get advisor details
  const {
    data: partnerProfile,
    isLoading: isPartnerProfileLoading,
    isFetching: isPartnerProfileFetching,
  } = useGetPartnerProfileQuery(undefined);

  // Onboarding status: when ACTIVE + portalAccessUnlocked, show signed sidebar even on "/"
  const { data: onboardingStatus } = useGetOnboardingStatusQuery();
  const hasUnlockedPortal =
    onboardingStatus?.status === "ACTIVE" && !!onboardingStatus?.portalAccessUnlocked;

  // Advisor details from partner profile (for "Managed by" section)
  const advisor = partnerProfile?.advisor;
  const profileName = advisor?.name ?? fallbackManagedBy.name;
  const profileEmail = advisor?.email ?? fallbackManagedBy.email;
  const profilePhone = advisor?.phone ?? fallbackManagedBy.phone;
  const profilePhotoUrl = advisor?.profile?.url
    ? advisor.profile.url.startsWith("http")
      ? advisor.profile.url
      : `${config.image_access_url}${advisor.profile.url}`
    : null;
  const isManagedByLoading =
    isPartnerProfileLoading || isPartnerProfileFetching;

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("partner-preview-mode");
    navigate("/login");
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
  const isOnboardingContext =
    (location.pathname === "/" && previewMode === "onboarding") ||
    location.pathname.startsWith("/onboarding") ||
    location.pathname.startsWith("/contract");
  const isSignedContext =
    !isStudentContext &&
    !isApplicationDetailContext &&
    ((location.pathname === "/" && (previewMode === "signed" || hasUnlockedPortal)) ||
      SIGNED_ROUTE_PATHS.includes(location.pathname) ||
      location.pathname.startsWith("/payments"));

  // Application details loading: show loading state (click korar sathe start)
  const isApplicationDetailLoading = isApplicationDetailContext && !student;
  const baseItems = isSignedContext ? SignedSidebarItems : SidebarItems;
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
                    className={`text-left ${isSignedSidebar ? "text-sm font-medium" : "text-base font-semibold"}`}
                  >
                    {nav.name}
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
        border-r border-gray-200/60 bg-white dark:border-gray-800 dark:bg-gray-900
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
              </div>
            </>
          )}
        </div>
      )}

      {/* Sidebar preview: SIGNED partner view – partner card (no "Managed by" label) */}
      {(isExpanded || isMobileOpen) && isSignedContext && (
        <div className="mx-3 mt-0 rounded-xl bg-gray-50/80 p-3 dark:bg-gray-800/40">
          {isManagedByLoading ? (
            <div className="animate-pulse">
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
              <div className="mt-0 flex items-center gap-2.5">
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
              </div>
            </>
          )}
        </div>
      )}

      {/* Sidebar preview: APPLICATION DETAIL (loading skeleton while student sidebar data loads) */}
      {(isExpanded || isMobileOpen) && isApplicationDetailLoading && (
        <div className="mx-3 mt-0 rounded-xl border border-gray-200/60 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-800/40 animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-2 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-2 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      )}

      {/* Sidebar preview: STUDENT / APPLICATION DETAIL – student profile card + Activity/Profile/Applications/Tasks */}
      {(isExpanded || isMobileOpen) && showStudentSidebar && studentId && (
        <div className="mx-3 mt-0 rounded-xl border border-gray-200/60 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-800/40">
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <img
                src={
                  student?.avatar ?? `https://i.pravatar.cc/80?u=${studentId}`
                }
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex items-center gap-0.5 rounded-full bg-primary-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                <i className="fa-solid fa-check text-[8px]" /> Verified
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                {student?.name ?? "Student"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug break-words">
                {student?.address ?? "Dhaka North City Corporation, Dhaka"}
              </p>
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                Status: <strong>{student?.status ?? "SQL"}</strong>
              </p>
            </div>
          </div>
          <nav className="mt-3 space-y-0.5">
            {STUDENT_NAV.map((item) => {
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
      <div className="flex flex-1 flex-col overflow-hidden">
        {isApplicationDetailLoading && (
          <div className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
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
          <div className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
            <nav className="flex flex-col gap-1">
              {renderMenuItems(filteredSidebarItems, "main")}
            </nav>
          </div>
        )}

        {/* Sidebar preview: STUDENT / APPLICATION – back link below student sidebar */}
        {showStudentSidebar && studentId && (
          <div className="flex-1 px-3 py-4">
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
    </aside>
  );
};

export default Sidebar;
