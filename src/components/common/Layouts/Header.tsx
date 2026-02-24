import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePreviewMode } from "../../../context/PreviewModeContext";
import { useSidebar } from "../../../context/SidebarContext";
import UserDropdown from "../Dropdowns/UserDropdown";

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
    university: { name: "Oxford University", UniversityLogo: { url: "oxford.png" } }
  },
  {
      id: "2",
      course: { name: "Business Administration" },
      university: { name: "Harvard University", UniversityLogo: { url: "harvard.png" } }
  },
  {
      id: "3",
      course: { name: "Engineering" },
      university: { name: "MIT", UniversityLogo: { url: "mit.png" } }
  }
];

const SCROLL_THRESHOLD = 8;

const Header: React.FC = () => {
  const { pathname } = useLocation();
  const { previewMode } = usePreviewMode();
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar, isExpanded } = useSidebar();
  const isSignedMode = pathname === "/" && previewMode === "signed";
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isCountriesOpen, setIsCountriesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPartnersOpen, setIsPartnersOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDashboardOrOnboarding =
    pathname === "/" ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/contract") ||
    ["/programs-schools", "/students", "/applications", "/my-tasks", "/payments", "/academy", "/hot-offers"].includes(
      pathname
    );

  const countries = mockCountries;
  const countryOptions = countries;

  const universitiesCourse = { data: mockCourses };

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
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
        isExpanded ? "lg:left-[280px] lg:w-[calc(100vw-280px)]" : "lg:left-[80px] lg:w-[calc(100vw-80px)]"
      } ${
        hasScrolled
          ? "border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80"
          : "border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
      }`}
    >
      <div className="flex w-full min-w-0 max-w-full items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        {/* Dashboard / Onboarding: Partner branding */}
        {isDashboardOrOnboarding ? (
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=80&h=80&fit=crop"
              alt="Window Nepal Education"
              className="h-10 w-10 shrink-0 rounded-xl object-cover"
            />
            <div>
              <span className="block text-base font-semibold tracking-tight text-gray-900 dark:text-white">
                Window Nepal Education
              </span>
              <span className="block text-sm text-gray-500 dark:text-gray-400">
                Partner portal
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
                  className="w-full h-11 pl-12 pr-12 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/50 
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800
                    text-base font-normal text-gray-700 dark:text-gray-200 placeholder:text-gray-400 
                    transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                />
                <kbd className="hidden lg:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-6 items-center gap-1 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-1.5 font-mono text-xs font-medium text-gray-500 dark:text-gray-400">
                  ⌘K
                </kbd>
              </div>
            </form>
          </div>
        )}

        {/* Right: Nav, then others (4 icons when signed), notification, user at end */}
        <div className="flex min-w-0 shrink items-center gap-1 sm:gap-4">
          {isDashboardOrOnboarding && !isSignedMode ? (
            <nav className="hidden md:flex items-center gap-1">
              <div className="relative group">
                <button
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  type="button"
                >
                  About
                  <svg className="h-4 w-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 top-full mt-2 w-44 rounded-2xl border border-gray-200 bg-white py-2 shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] opacity-0 transition-opacity group-hover:opacity-100 dark:border-gray-800 dark:bg-gray-800 z-[100]">
                  <Link to="/galleries" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50 transition-colors duration-200">Our story</Link>
                  <Link to="/employees" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50 transition-colors duration-200">Our team</Link>
                  <Link to="/offices" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50 transition-colors duration-200">Contact</Link>
                </div>
              </div>
              <div className="relative group">
                <button
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  type="button"
                >
                  Partners
                  <svg className="h-4 w-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 top-full mt-2 w-44 rounded-2xl border border-gray-200 bg-white py-2 shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] opacity-0 transition-opacity group-hover:opacity-100 dark:border-gray-800 dark:bg-gray-800 z-[100]">
                  <Link to="#" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50 transition-colors duration-200">Partner resources</Link>
                </div>
              </div>
            </nav>
          ) : (
          /* Navigation Links with Dropdowns (non-dashboard) */
          <nav className="hidden md:flex items-center gap-6">
     {/* Courses Dropdown */}
<div className="relative group">
  <button
    className="font-medium cursor-pointer flex items-center gap-1.5 text-gray-700 hover:text-gray-900 text-sm"
  >
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
  <div className="absolute top-full left-0 mt-2 w-[400px] bg-white rounded-2xl border border-gray-200 py-2 shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] z-[100] opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 dark:border-gray-800 dark:bg-gray-800">
    
    <h1 className="text-sm font-semibold px-4 py-3 text-gray-900 dark:text-gray-100">Top courses</h1>
    {universitiesCourse?.data?.map((item: any) => (
      <Link
        key={item.id}
        to={`/university-course/${item.id}`}
        className="flex items-start gap-3 px-4 py-2 hover:bg-gray-50 rounded-md transition"
      >
        {/* University Logo */}
        {true && (
            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">Logo</div>
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
  <button
    className="font-medium cursor-pointer flex items-center gap-1.5 text-gray-700 hover:text-gray-900 text-sm"
  >
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
  <div className="absolute top-full -left-6 mt-2 grid grid-cols-2 gap-2 w-[380px] bg-white rounded-2xl border border-gray-200 py-2 shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] z-[100] opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 dark:border-gray-800 dark:bg-gray-800">
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
  <button
    className="font-medium cursor-pointer flex items-center gap-1.5 text-gray-700 hover:text-gray-900 text-sm"
  >
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
  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl border border-gray-200 py-2 shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] z-[100]
                  opacity-0 invisible group-hover:visible group-hover:opacity-100
                  max-h-0 group-hover:max-h-96 overflow-hidden
                  transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-800">
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

          {/* Signed mode: others first, notification (bell) at dui number (second from right), then user */}
          {isSignedMode ? (
            <>
              <button type="button" className="flex items-center justify-center rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200" aria-label="Announcements">
                <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.712-6.673A1 1 0 005 12.5V5.882a1.76 1.76 0 013.418-.592l2.712 6.673A1 1 0 0011 5.882z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 9.34a1.76 1.76 0 011.417.592l2.712 6.673A1 1 0 0119 12.5V5.882a1.76 1.76 0 00-3.418-.592l-2.712 6.673A1 1 0 0015 9.34z" /></svg>
              </button>
              <button type="button" className="flex items-center justify-center rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200" aria-label="Documents">
                <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
              </button>
              <button type="button" className="flex items-center justify-center rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200" aria-label="Marking">
                <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              </button>
              <button type="button" className="relative flex items-center justify-center rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200" aria-label="Notifications">
                <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span className="absolute right-1 top-1 flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white dark:ring-gray-900" /></span>
              </button>
            </>
          ) : null}

          {/* Notification — when not signed (signed has bell in "others" above) */}
          {!isSignedMode && (
          <button
            type="button"
            className="relative flex items-center justify-center rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Notifications"
          >
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            <span className="absolute right-1 top-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white dark:ring-gray-900" />
            </span>
          </button>
          )}

          {/* User icon — always at the very right */}
          <div className="flex items-center">
            <UserDropdown />
          </div>
        </div>
      </div>

      {/* Mobile Menu Toggle Button */}
      <button
        className="lg:hidden absolute left-4 top-1/2 -translate-y-1/2 p-2 text-gray-600 z-[100]"
        onClick={handleToggle}
        aria-label="Toggle Sidebar"
      >
        {isMobileOpen ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg
            width="16"
            height="12"
            viewBox="0 0 16 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
              fill="currentColor"
            />
          </svg>
        )}
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
