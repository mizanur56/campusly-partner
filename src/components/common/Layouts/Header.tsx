import { useEffect, useRef, useState } from "react";
import { useSidebar } from "../../../context/SidebarContext";
import UserDropdown from "../Dropdowns/UserDropdown";
import { Link } from "react-router-dom";

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

const Header: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isCountriesOpen, setIsCountriesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <header className="sticky top-0 flex w-full backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-200/80 dark:border-gray-700/50 z-40">
      <div className="flex items-center justify-between w-full px-6 py-[18px]">
        {/* Left Side - Enhanced Search Input */}
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
                  text-[15px] font-normal text-gray-700 dark:text-gray-200 placeholder:text-gray-400 
                  transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
              />
              <kbd className="hidden lg:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-6 items-center gap-1 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-1.5 font-mono text-[10px] font-medium text-gray-500 dark:text-gray-400">
                ⌘K
              </kbd>
            </div>
          </form>
        </div>

        {/* Right Side - Navigation Links, Bell Icon, Avatar */}
        <div className="flex items-center gap-6 ml-6">
          {/* Navigation Links with Dropdowns */}
          <nav className="hidden md:flex items-center gap-6">
     {/* Courses Dropdown */}
<div className="relative group">
  <button
    className="font-medium cursor-pointer flex items-center gap-1.5 text-gray-700 hover:text-gray-900 font-normal text-[18px]"
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
  <div className="absolute top-full left-0 mt-2 w-[400px] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200">
    
    <h1 className="text-[18px] font-semibold px-4 py-4">Top Courses</h1>
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
          <span className="font-semibold text-gray-800">
            {item.course.name}
          </span>
          <span className="text-sm text-gray-500 mt-1">
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
    className="font-medium cursor-pointer flex items-center gap-1.5 text-gray-700 hover:text-gray-900 font-normal text-[18px]"
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
  <div className="absolute top-full -left-6 mt-2 grid grid-cols-2 gap-2 w-[380px] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200">
    {countryOptions.map((country: any) => (
      <Link
        key={country.value}
        to={`/country/${country.value}`}
        className="flex items-center gap-3 px-4 py-2 text-[16px] text-gray-700 hover:bg-gray-50"
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
    className="font-medium cursor-pointer flex items-center gap-1.5 text-gray-700 hover:text-gray-900 font-normal text-[18px]"
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
  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50
                  opacity-0 invisible group-hover:visible group-hover:opacity-100
                  max-h-0 group-hover:max-h-96 overflow-hidden
                  transition-all duration-300 ease-in-out">
    <Link
      to="/galleries"
      className="block px-4 py-2 text-[18px] font-normal text-gray-700 hover:bg-gray-50 transition-colors duration-200"
    >
      Our Story
    </Link>
    <Link
      to="/employees"
      className="block px-4 py-2 text-[18px] font-normal text-gray-700 hover:bg-gray-50 transition-colors duration-200"
    >
      Team
    </Link>
    <Link
      to="/offices"
      className="block px-4 py-2 text-[18px] font-normal text-gray-700 hover:bg-gray-50 transition-colors duration-200"
    >
      Contact
    </Link>
  </div>
</div>

          </nav>

          {/* Enhanced Notification Bell */}
          <button className="relative p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-all duration-200 group">
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
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
            {/* Notification dot with pulse animation */}
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary-500 rounded-full ring-2 ring-white dark:ring-gray-900">
              <span className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-75"></span>
            </span>
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
