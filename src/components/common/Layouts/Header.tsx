import { useEffect, useRef, useState } from "react";
import { useSidebar } from "../../../context/SidebarContext";
import UserDropdown from "../Dropdowns/UserDropdown";

const Header: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isCountriesOpen, setIsCountriesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between w-full px-6 py-4">
        {/* Left Side - Search Input */}
        <div className="flex-1 max-w-[400px] ml-4 lg:ml-0">
          <form className="relative">
            <div className=" hidden sm:block  relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
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
                placeholder="Find Courses, subjects, universities..."
                className="w-full max-w-[400px] h-16 pl-14 pr-6 rounded-full border border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-[18px] font-normal text-gray-700 placeholder:text-gray-400 placeholder:text-[18px]"
              />
            </div>
          </form>
        </div>

        {/* Right Side - Navigation Links, Bell Icon, Avatar */}
        <div className="flex items-center gap-6 ml-6">
          {/* Navigation Links with Dropdowns */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Courses Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsCoursesOpen(!isCoursesOpen);
                  setIsCountriesOpen(false);
                  setIsAboutOpen(false);
                }}
                className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 font-normal text-[18px]"
              >
                Courses
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isCoursesOpen ? "rotate-180" : ""
                  }`}
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
              {isCoursesOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <a
                    href="#"
                    className="block px-4 py-2 text-[18px] font-normal text-gray-700 hover:bg-neutral-50"
                  >
                    All Courses
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-[18px] font-normal text-gray-700 hover:bg-gray-50"
                  >
                    Popular Courses
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-[18px] font-normal text-gray-700 hover:bg-gray-50"
                  >
                    New Courses
                  </a>
                </div>
              )}
            </div>

            {/* Countries Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsCountriesOpen(!isCountriesOpen);
                  setIsCoursesOpen(false);
                  setIsAboutOpen(false);
                }}
                className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 font-normal text-[18px]"
              >
                Countries
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isCountriesOpen ? "rotate-180" : ""
                  }`}
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
              {isCountriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <a
                    href="#"
                    className="block px-4 py-2 text-[18px] font-normal text-gray-700 hover:bg-gray-50"
                  >
                    United States
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-[18px] font-normal text-gray-700 hover:bg-gray-50"
                  >
                    United Kingdom
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-[18px] font-normal text-gray-700 hover:bg-gray-50"
                  >
                    Canada
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-[18px] font-normal text-gray-700 hover:bg-gray-50"
                  >
                    Australia
                  </a>
                </div>
              )}
            </div>

            {/* About Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsAboutOpen(!isAboutOpen);
                  setIsCoursesOpen(false);
                  setIsCountriesOpen(false);
                }}
                className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 font-normal text-[18px]"
              >
                About
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isAboutOpen ? "rotate-180" : ""
                  }`}
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
              {isAboutOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <a
                    href="#"
                    className="block px-4 py-2 text-[18px] font-normal text-gray-700 hover:bg-gray-50"
                  >
                    Our Story
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-[18px] font-normal text-gray-700 hover:bg-gray-50"
                  >
                    Team
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-[18px] font-normal text-gray-700 hover:bg-gray-50"
                  >
                    Contact
                  </a>
                </div>
              )}
            </div>
          </nav>

          {/* Bell Icon - Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          {/* User Avatar */}
          <div className="flex items-center">
            <UserDropdown />
          </div>
        </div>
      </div>

      {/* Mobile Menu Toggle Button */}
      <button
        className="lg:hidden absolute left-4 top-1/2 -translate-y-1/2 p-2 text-gray-600 z-50"
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
