/* eslint-disable no-constant-binary-expression */
import { useEffect, useRef, useState } from "react";
import { AiOutlineFullscreen } from "react-icons/ai";
import { Link, useLocation } from "react-router-dom";
import { usePreviewMode } from "../../../context/PreviewModeContext";
import { useSidebar } from "../../../context/SidebarContext";
import { useGetPartnerProfileQuery } from "../../../redux/features/profile/partnerProfileApi";
import { getApiImageUrl } from "../../../utils/getApiImageUrl";
import AnnouncementDropdown from "../Dropdowns/AnnouncementDropdown";
import UserDropdown from "../Dropdowns/UserDropdown";
import NotificationDropdown from "../NotificationDropdown";
import { HiMiniBars3, HiMiniXMark } from "react-icons/hi2";

// Mock Data
const mockCountries = [
  { label: "United Kingdom", value: "uk", flag: "uk.png" },
  { label: "United States", value: "usa", flag: "usa.png" },
  { label: "Canada", value: "ca", flag: "ca.png" },
  { label: "Australia", value: "au", flag: "au.png" },
];

const mockCourses = [
  {
    id: "1",
    course: { name: "Computer Science" },
    university: {
      name: "Oxford University",
      UniversityLogo: { url: "oxford.png" },
    },
  },
  {
    id: "2",
    course: { name: "Business Administration" },
    university: {
      name: "Harvard University",
      UniversityLogo: { url: "harvard.png" },
    },
  },
  {
    id: "3",
    course: { name: "Engineering" },
    university: { name: "MIT", UniversityLogo: { url: "mit.png" } },
  },
];

const SCROLL_THRESHOLD = 8;

const SIGNED_HEADER_PATHS = [
  "/programs-schools",
  "/students",
  "/applications",
  "/my-tasks",
  "/announcements",
  "/notifications",
  "/task-management",
  "/academy",
  "/hot-offers",
  "/team-members",
  "/settings/profile",
];

const Header: React.FC = () => {
  const { pathname } = useLocation();
  const { previewMode } = usePreviewMode();
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar, isExpanded } =
    useSidebar();
  const isSignedMode =
    (pathname === "/" && previewMode === "signed") ||
    SIGNED_HEADER_PATHS.includes(pathname) ||
    pathname.startsWith("/programs-schools") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/students/") ||
    pathname.startsWith("/applications/") ||
    pathname.startsWith("/academy");
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isCountriesOpen, setIsCountriesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDashboardOrOnboarding =
    pathname === "/" ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/contract") ||
    pathname.startsWith("/meeting") ||
    [
      "/programs-schools",
      "/students",
      "/applications",
      "/my-tasks",
      "/announcements",
      "/notifications",
      "/task-management",
      "/academy",
      "/hot-offers",
      "/team-members",
      "/settings/profile",
    ].includes(pathname) ||
    pathname.startsWith("/programs-schools") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/students/") ||
    pathname.startsWith("/applications/") ||
    pathname.startsWith("/academy");

  const countries = mockCountries;
  const countryOptions = countries;

  const universitiesCourse = { data: mockCourses };

  const { data: partnerProfile } = useGetPartnerProfileQuery();
  const brandName = partnerProfile?.businessName || "Partner portal";
  const brandLogoUrl = partnerProfile?.businessPhoto
    ? getApiImageUrl(partnerProfile.businessPhoto as string)
    : null;

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };
  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 z-[60] flex min-w-0 items-center border-b transition-all duration-300 w-full ${
        isExpanded
          ? "lg:left-[280px] lg:w-[calc(100vw-280px)]"
          : "lg:left-[80px] lg:w-[calc(100vw-80px)]"
      } ${
        hasScrolled
          ? "border-primary-border bg-[#FFFFFF]/95 backdrop-blur-md dark:border-[#353646] dark:bg-[#20242A]/95"
          : "border-primary-border bg-[#FFFFFF] dark:border-[#353646] dark:bg-[#20242A]"
      }`}
    >
      <div className="flex w-full min-w-0 max-w-full items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        {/* Dashboard / Onboarding: Partner branding */}
        {isDashboardOrOnboarding ? (
          <div className="flex items-center gap-3 ml-12 lg:ml-0">
            <div className="hidden lg:flex h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-200">
              {brandLogoUrl ? (
                <img
                  src={brandLogoUrl}
                  alt={brandName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>
                  {brandName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 3)}
                </span>
              )}
            </div>
            <div>
              <span className="block text-[20px] font-semibold tracking-tight text-[#20242A] dark:text-white">
                {brandName}
              </span>
            </div>
          </div>
        ) : (
          /* Left Side - Search Input */
          <div className="flex-1 max-w-[450px] ml-4 lg:ml-0">
            <form className="relative">
              <div className="hidden sm:block relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 group-focus-within:text-primary-500">
                  <svg
                    className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search courses, universities..."
                  className="w-full h-11 pl-12 pr-12 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-primary-border/80 dark:border-gray-700/50 
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800
                    text-base font-normal text-gray-700 dark:text-gray-200 placeholder:text-gray-400 
                    transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                />
                <kbd className="hidden lg:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-6 items-center gap-1 rounded-md border border-primary-border dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-1.5 font-mono text-xs font-medium text-gray-500 dark:text-gray-400">
                  ⌘K
                </kbd>
              </div>
            </form>
          </div>
        )}

        {/* Right: About + Partners (dashboard/onboarding/signed), then 4 icons when signed, notification, user */}
        <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
          {isDashboardOrOnboarding ? (
            <nav className="hidden md:flex items-center gap-1">
              <div className="relative group">
                <button
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-[16px] font-medium text-[#20242A] transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  type="button"
                >
                  About
                  <svg
                    className="h-4 w-4 transition-transform group-hover:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {/* pt-2 bridges the gap so hover is not lost moving from button to menu */}
                <div className="pointer-events-none absolute left-0 top-full z-[100] w-44 pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 invisible">
                  <div className="rounded-2xl border border-primary-border bg-white py-2 shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] dark:border-gray-800 dark:bg-gray-800">
                    <Link
                      to="/galleries"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      Our story
                    </Link>
                    <Link
                      to="/employees"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      Our team
                    </Link>
                    <Link
                      to="/offices"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      Contact
                    </Link>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <button
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-[16px] font-medium text-[#20242A] transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  type="button"
                >
                  Partners
                  <svg
                    className="h-4 w-4 transition-transform group-hover:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="pointer-events-none absolute left-0 top-full z-[100] w-44 pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 invisible">
                  <div className="rounded-2xl border border-primary-border bg-white py-2 shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] dark:border-gray-800 dark:bg-gray-800">
                    <Link
                      to="#"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      Partner resources
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
          ) : (
            /* Navigation Links with Dropdowns (non-dashboard, public site) */
            <nav className="hidden md:flex items-center gap-6">
              {/* Courses Dropdown */}
              <div className="relative group">
                <button className="font-medium cursor-pointer flex items-center gap-1.5 text-gray-700 hover:text-gray-900 text-sm">
                  Courses
                  <svg
                    className="w-4 h-4 transition-transform group-hover:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-[400px] bg-white rounded-2xl border border-primary-border py-2 shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] z-[100] opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 dark:border-gray-800 dark:bg-gray-800">
                  <h1 className="text-sm font-semibold px-4 py-3 text-gray-900 dark:text-gray-100">
                    Top courses
                  </h1>
                  {universitiesCourse?.data?.map((item: any) => (
                    <Link
                      key={item.id}
                      to={`/university-course/${item.id}`}
                      className="flex items-start gap-3 px-4 py-2 hover:bg-gray-50 rounded-md transition"
                    >
                      {/* University Logo */}
                      {true && (
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                          Logo
                        </div>
                      )}

                      {/* Course & University Name */}
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800">
                          {item.course.name}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {item.university.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Countries Dropdown */}
              <div className="relative group">
                <button className="font-medium cursor-pointer flex items-center gap-1.5 text-gray-700 hover:text-gray-900 text-sm">
                  Countries
                  <svg
                    className="w-4 h-4 transition-transform group-hover:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown → Hidden by default, show on hover */}
                <div className="absolute top-full -left-6 mt-2 grid grid-cols-2 gap-2 w-[380px] bg-white rounded-2xl border border-primary-border py-2 shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] z-[100] opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 dark:border-gray-800 dark:bg-gray-800">
                  {countryOptions.map((country: any) => (
                    <Link
                      key={country.value}
                      to={`/country/${country.value}`}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {/* Flag */}
                      <div className="w-8 h-8 rounded-full border bg-gray-100"></div>

                      {/* Country Name */}
                      <span className="whitespace-nowrap">{country.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* About Dropdown */}
              <div className="relative group">
                <button className="font-medium cursor-pointer flex items-center gap-1.5 text-gray-700 hover:text-gray-900 text-sm">
                  About
                  <svg
                    className="w-4 h-4 transition-transform group-hover:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown submenu */}
                <div
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl border border-primary-border py-2 shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] z-[100]
                  opacity-0 invisible group-hover:visible group-hover:opacity-100
                  max-h-0 group-hover:max-h-96 overflow-hidden
                  transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-800"
                >
                  <Link
                    to="/galleries"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Our Story
                  </Link>
                  <Link
                    to="/employees"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Team
                  </Link>
                  <Link
                    to="/offices"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </nav>
          )}

          {/* Signed mode extras: fullscreen + announcements */}
          {isSignedMode && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleFullscreen}
                className="hidden lg:inline-flex relative group items-center justify-center w-10 h-10 rounded-xl border border-primary-border bg-white text-gray-600 transition-all duration-300 ease-in-out hover:border-primary-500 hover:text-primary-600 hover:shadow-md"
              >
                <AiOutlineFullscreen
                  size={22}
                  className="transition-colors duration-300 group-hover:text-primary-600"
                />
              </button>
              <div className="hidden lg:block">
                <AnnouncementDropdown />
              </div>
            </div>
          )}

          {/* Notification + User — shown on all authenticated pages (onboarding, contract, signed) */}
          {isDashboardOrOnboarding && (
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              <UserDropdown />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Toggle Button */}

      <button
        onClick={handleToggle}
        aria-label="Toggle Sidebar"
        className={`
    lg:hidden absolute left-4 top-1/2 -translate-y-1/2
    w-10 h-10 flex items-center justify-center
    rounded-xl border

    transition-all duration-300 ease-in-out
    cursor-pointer z-50

    ${
      isMobileOpen
        ? "bg-primary-500 text-white border-primary-500 hover:bg-primary-600 shadow-md"
        : "bg-white text-gray-600 border-gray-200 hover:border-primary-500 hover:text-primary-600 hover:shadow-sm"
    }
  `}
      >
        {isMobileOpen ? <HiMiniXMark size={22} /> : <HiMiniBars3 size={22} />}
      </button>

      {/* Close dropdowns when clicking outside */}
      {isCoursesOpen || isCountriesOpen || isAboutOpen ? (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsCoursesOpen(false);
            setIsCountriesOpen(false);
            setIsAboutOpen(false);
          }}
        />
      ) : null}
    </header>
  );
};

export default Header;
