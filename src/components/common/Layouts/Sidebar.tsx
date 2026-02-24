import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { config } from "../../../config";
import { usePreviewMode } from "../../../context/PreviewModeContext";
import { useSidebar } from "../../../context/SidebarContext";
import { useFilteredSidebarItems } from "../../../hooks/useFilteredSidebarItems";
import { ChevronDownIcon } from "../../../icons";
import { selectCurrentUser } from "../../../redux/features/auth/authSlice";
import { NavItem, SubMenuItem } from "../../../types/interfaces";
import { Tooltip } from "antd";

const SidebarItems: NavItem[] = [
  { icon: <i className="fa-solid fa-house"></i>, name: "Home", path: "/" },
];

const SignedSidebarItems: NavItem[] = [
  { icon: <i className="fa-solid fa-house"></i>, name: "Home", path: "/" },
  { icon: <i className="fa-solid fa-magnifying-glass"></i>, name: "Programs & Schools", path: "/programs-schools" },
  { icon: <i className="fa-solid fa-users"></i>, name: "Students", path: "/students" },
  { icon: <i className="fa-solid fa-file-lines"></i>, name: "Applications", path: "/applications" },
  { icon: <i className="fa-solid fa-list-check"></i>, name: "My Tasks", path: "/my-tasks" },
  { icon: <i className="fa-solid fa-credit-card"></i>, name: "Payments", path: "/payments" },
  { icon: <i className="fa-solid fa-graduation-cap"></i>, name: "Academy", path: "/academy" },
  { icon: <i className="fa-solid fa-fire"></i>, name: "Hot Offers", path: "/hot-offers" },
];
const SIGNED_ROUTE_PATHS = [
  "/programs-schools",
  "/students",
  "/applications",
  "/my-tasks",
  "/payments",
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

const Sidebar: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const { previewMode } = usePreviewMode();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const profileName = user?.name ?? fallbackManagedBy.name;
  const profileEmail = user?.email ?? fallbackManagedBy.email;
  const profilePhone = fallbackManagedBy.phone;
  const profilePhotoUrl = user?.profile_photo
    ? (user.profile_photo.startsWith("http")
        ? user.profile_photo
        : `${config.image_access_url || ""}${user.profile_photo}`)
    : `https://i.pravatar.cc/80?u=${user?.id || encodeURIComponent(profileEmail) || "user"}`;

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const baseItems =
    (location.pathname === "/" && previewMode === "signed") || SIGNED_ROUTE_PATHS.includes(location.pathname)
      ? SignedSidebarItems
      : SidebarItems;
  const filteredSidebarItems = useFilteredSidebarItems(baseItems);
  const isSignedSidebar =
    (location.pathname === "/" && previewMode === "signed") || SIGNED_ROUTE_PATHS.includes(location.pathname);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
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
    [location.pathname]
  );

  const isAnyNestedItemActive = useCallback(
    (items: SubMenuItem[]): boolean => {
      return items.some((item) => {
        if (item.path && isActive(item.path)) return true;
        if (item.subItems) return isAnyNestedItemActive(item.subItems);
        return false;
      });
    },
    [isActive]
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
        : { type: menuType, index }
    );
  };

  const renderNestedMenuItems = (items: SubMenuItem[], level = 0) => (
    <ul className={`space-y-1 ${level > 0 ? "ml-4" : ""}`}>
      {items.map((item, index) => (
        <li key={`${item.name}-${index}`}>
          {item.subItems ? (
            <div>
              <button
                className={`menu-dropdown-item w-full text-left text-base font-semibold ${
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
              className={`menu-dropdown-item text-base font-semibold ${
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
                      <span className={`text-left truncate max-w-[150px] ${isSignedSidebar ? "text-sm font-medium" : "text-base font-semibold"}`}>
                        {nav.name.substring(0, 15) + "..."}
                      </span>
                    </Tooltip>
                  ) : (
                    <span className={`text-left ${isSignedSidebar ? "text-sm font-medium" : "text-base font-medium"}`}>
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
                  <span className={`text-left ${isSignedSidebar ? "text-sm font-medium" : "text-base font-semibold"}`}>
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
        border-r border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900
        ${isExpanded || isMobileOpen ? "w-[280px]" : "w-[80px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
    >
      {/* Logo */}
      <div
        className={`flex px-5 pb-5 ${
          !isExpanded && !isMobileOpen ? "lg:justify-center" : ""
        }`}
      >
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/images/logo/Frame1044.svg"
            alt="Campus Transfer"
            className={(isExpanded || isMobileOpen) ? "h-20 w-auto max-w-[300px]" : "h-14 w-14 object-contain"}
          />
        </Link>
      </div>

      {/* Managed by — live profile, simple & professional (hidden in signed preview) */}
      {(isExpanded || isMobileOpen) && !isSignedSidebar && (
        <div className="mx-3 mt-2 rounded-xl bg-gray-50/80 p-3 dark:bg-gray-800/40">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Managed by
          </p>
          <div className="mt-2 flex items-center gap-2.5">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <img
                src={profilePhotoUrl}
                alt={profileName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <span
                className="text-sm font-semibold text-gray-600 dark:text-gray-300"
                style={{ display: "none", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}
              >
                {profileName.charAt(0)}
              </span>
            </div>
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800 dark:text-gray-100">
              {profileName}
            </p>
          </div>
          <div className="mt-2.5 space-y-1.5">
            <a
              href={`mailto:${profileEmail}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
            >
              <svg className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="min-w-0 truncate">{profileEmail}</span>
            </a>
            <a
              href={`tel:${profilePhone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
            >
              <svg className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="min-w-0 truncate">{profilePhone}</span>
            </a>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
          <nav className="flex flex-col gap-1">
            {renderMenuItems(filteredSidebarItems, "main")}
          </nav>
        </div>

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
