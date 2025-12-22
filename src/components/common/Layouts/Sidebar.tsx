import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../../../context/SidebarContext";
import { useFilteredSidebarItems } from "../../../hooks/useFilteredSidebarItems";
import { ChevronDownIcon } from "../../../icons";
import { NavItem, SubMenuItem } from "../../../types/interfaces";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/features/auth/authSlice";
import { Tooltip } from "antd";

// Sidebar items with Font Awesome class names
const SidebarItems: NavItem[] = [
  {
    icon: <i className="fa-solid fa-house"></i>,
    name: "Home",
    path: "/",
  },
  {
    icon: <i className="fa-solid fa-user"></i>,
    name: "Profile",
    path: "/profile",
  },
  {
    icon: <i className="fa-solid fa-file-image"></i>,
    name: "Media Library",
    path: "/media",
  },
  {
    icon: <i className="fa-solid fa-graduation-cap"></i>,
    name: "Study Levels",
    path: "/study-levels",
  },
  {
    icon: <i className="fa-solid fa-calendar-days"></i>,
    name: "Events Management",
    path: "/events",
  },
  {
    icon: <i className="fa-solid fa-images"></i>,
    name: "Gallery Management",
    path: "/gallery",
  },
  {
    icon: <i className="fa-solid fa-book"></i>,
    name: "Guides Management",
    path: "/guides",
  },
  {
    icon: <i className="fa-solid fa-graduation-cap"></i>,
    name: "Courses Management",
    path: "/courses",
  },
  {
    icon: <i className="fa-solid fa-globe"></i>,
    name: "Country Management",
    path: "/country",
  },
  {
    icon: <i className="fa-solid fa-graduation-cap"></i>,
    name: "University Management",
    path: "/universities",
  },
  {
    icon: <i className="fa-solid fa-briefcase"></i>,
    name: "Careers Management",
    path: "/careers",
    
  },
  {
    icon: <i className="fa-brands fa-youtube"></i>,
    name: "Video Management",
    path: "/videos",
  },
  {
    icon: <i className="fa-solid fa-newspaper"></i>,
    name: "Articles Management",
    path: "/articles",
  },
  {
    icon: <i className="fa-solid fa-id-badge"></i>,
    name: "Designations",
    path: "/designations",
  },
  {
    icon: <i className="fa-solid fa-users"></i>,
    name: "User Management",
    subItems: [
      { name: "Employees", path: "/employees" },
    ],
  },
  {
    icon: <i className="fa-solid fa-file-alt"></i>,
    name: "Content Management",
    subItems: [
      { name: "Content", path: "/content" },
      { name: "Document", path: "/document" },
    ],
  },
  {
    icon: <i className="fa-solid fa-address-book"></i>,
    name: "Offices Management",
    path: "/offices",
  },
  {
    icon: <i className="fa-solid fa-newspaper"></i>,
    name: "News Management",
    path: "/news",
  },


  {
    icon: <i className="fa-solid fa-handshake"></i>,
    name: "Institution Partners",
    path: "/institution-partners",
  },
  {
    icon: <i className="fa-solid fa-question-circle"></i>,
    name: "FAQs Management",
    path: "/faqs",
  },

];

const othersSidebarItems: NavItem[] = [
  {
    icon: <i className="fa-solid fa-sign-out-alt"></i>,
    name: "Logout",
    action: "logout", // <-- path এর পরিবর্তে action ব্যবহার
  },
];
const Sidebar: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    // Redux slice থেকে logout action কল করা
    dispatch(logout());

    // Local storage থেকে token মুছে ফেলা
    localStorage.removeItem("token");
    // Login পেজে redirect করা
    navigate("/login");
  };

  // Get filtered sidebar items based on user permissions
  const filteredSidebarItems = useFilteredSidebarItems(SidebarItems);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Helper function to check if any nested item is active
  const isAnyNestedItemActive = useCallback(
    (items: SubMenuItem[]): boolean => {
      return items.some((item) => {
        if (item.path && isActive(item.path)) {
          return true;
        }
        if (item.subItems) {
          return isAnyNestedItemActive(item.subItems);
        }
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
        if (nav.subItems) {
          // Check if any nested item (including deeply nested) is active
          if (isAnyNestedItemActive(nav.subItems)) {
            setOpenSubmenu({
              type: menuType as "main" | "others",
              index,
            });
            submenuMatched = true;
          }
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, filteredSidebarItems, isAnyNestedItemActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // Recursive function to render nested menu items
  const renderNestedMenuItems = (items: SubMenuItem[], level: number = 0) => (
    <ul className={`space-y-1 ${level > 0 ? "ml-4" : ""}`}>
      {items.map((item, index) => (
        <li key={`${item.name}-${index}`}>
          {item.subItems ? (
            <div>
              <button
                className={`menu-dropdown-item w-full text-left text-[14px] font-medium ${
                  isAnyNestedItemActive(item.subItems)
                    ? "menu-dropdown-item-active"
                    : "menu-dropdown-item-inactive"
                }`}
              >
                {item.name}
                <ChevronDownIcon className="ml-auto w-4 h-4" />
              </button>
              <div className="ml-4 mt-1 ">
                {renderNestedMenuItems(item.subItems, level + 1)}
              </div>
            </div>
          ) : (
            <Link
              to={item.path || "#"}
              className={`menu-dropdown-item text-[14px] font-medium ${
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

  // change code
  //   const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const menuItemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-1 relative">
      {items.map((nav, index) => {
        // Skip logout button in the main rendering
        if (nav.action === "logout") {
          return null;
        }

        // Main menu item
        return (
          <li
            key={nav.name}
            className="relative overflow-y-auto"
            ref={(el) => {
              menuItemRefs.current[`${menuType}-${index}`] = el;
            }}
          >
            {nav.subItems ? (
              // Item with submenu
              <button
                onClick={() => {
                  handleSubmenuToggle(index, menuType);
                }}
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
                      <span className="text-left truncate max-w-[150px] text-[14px] font-medium">
                        {nav.name.substring(0, 15) + "..."}
                      </span>
                    </Tooltip>
                  ) : (
                    <span className="text-left text-[14px] font-medium">
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
              // Clickable main menu item without submenu
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active pl-5 transition-all duration-300" : "menu-item-inactive"
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
                  <span className="text-left text-[14px] font-medium">
                    {nav.name}
                  </span>
                )}
              </Link>
            ) : null}

            {/* Submenu for all sidebar states */}
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
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0  left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[240px]" : "w-[70px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
    >
      <div
        className={`py-4 px-5 lg:flex hidden ${
          !isExpanded ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="flex items-center">
          {isExpanded || isMobileOpen ? (
            <img
              src={`${import.meta.env.BASE_URL}images/logo/logo.svg`}
              alt="Campus Transfer Logo"
              className="h-auto w-auto max-w-full"
              style={{ height: "45px", width: "auto" }}
            />
          ) : (
            <img
              src={`${import.meta.env.BASE_URL}images/logo/logo.svg`}
              alt="Campus Transfer Logo"
              className="h-10 w-10"
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 px-4 py-4 overflow-y-auto duration-300 ease-linear no-scrollbar">
          <nav>
            <div className="flex flex-col gap-1">
              {renderMenuItems(filteredSidebarItems, "main")}
            </div>
          </nav>
        </div>

        {/* Sticky Logout Button */}
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button
            onClick={handleLogout}
            className="menu-item group menu-item-inactive w-full text-left"
          >
            <span className="menu-item-icon-size menu-item-icon-inactive">
              {!isExpanded ? (
                <Tooltip title="Logout" placement="right">
                  <span>
                    <i className="fa-solid fa-sign-out-alt"></i>
                  </span>
                </Tooltip>
              ) : (
                <i className="fa-solid fa-sign-out-alt"></i>
              )}
            </span>
            {(isExpanded || isMobileOpen) && (
              <span className="text-left text-[14px] font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
