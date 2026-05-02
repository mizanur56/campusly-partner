import { useState } from "react";
import { RiGlobalLine, RiUserLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { config } from "../../../config";
import { clearAuthLocalStorage } from "../../../lib/authLocalStorage";
import { callLogoutApi, setLogoutCookie } from "../../../lib/logoutCookie";
import { isPartnerPortalUnlocked } from "../../../lib/partnerPortalAccess";
import { getPortalLoginUrl } from "../../../lib/portalRouting";
import { baseApi } from "../../../redux/api/baseApi";
import {
  logout,
  selectCurrentUser,
} from "../../../redux/features/auth/authSlice";
import { useGetOnboardingStatusQuery } from "../../../redux/features/onboardingForm";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  const { data: onboardingStatus } = useGetOnboardingStatusQuery();
  const isTeamMember = user?.role === "PARTNER_TEAM_MEMBER";
  const hasUnlockedPortal = isPartnerPortalUnlocked(onboardingStatus);
  const canAccessMyAccount = isTeamMember || hasUnlockedPortal;
  const dispatch = useDispatch();
  function toggleDropdown() {
    setIsOpen(!isOpen);
  }
  function getWebsiteUrl(): string {
    const domain = config.app_domain?.trim();
    if (!domain || domain === "localhost") {
      return "http://localhost:3000";
    }
    return `https://${domain}`;
  }
  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative flex cursor-pointer items-center justify-center bg-primary hover:bg-primary-600 transition-all duration-300 ease-in-out text-white rounded-xl dropdown-toggle w-10 h-10"
        aria-label="User menu"
      >
        <span className="overflow-hidden rounded-xl h-8 w-8 flex items-center justify-center">
          <img
            src={
              user?.profile_photo
                ? config.image_access_url + user?.profile_photo
                : "/images/user/owner.jpg"
            }
            alt={user?.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const nextElement = e.currentTarget
                .nextElementSibling as HTMLElement;
              if (nextElement) {
                nextElement.style.display = "flex";
              }
            }}
          />
          <div
            className="h-full w-full flex items-center justify-center font-semibold text-sm"
            style={{ display: "none" }}
          >
            {user?.name
              ? user.name.charAt(0).toUpperCase() +
                user.name.charAt(1).toUpperCase()
              : "U"}
          </div>
        </span>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-primary-border bg-white"
      >
        <div className="mb-3 flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-primary-border bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
            <img
              src={
                user?.profile_photo
                  ? config.image_access_url + user.profile_photo
                  : "/user.png"
              }
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/user.png";
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">
              {user?.name || "Partner user"}
            </span>
            <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
              {user?.email || "user@example.com"}
            </span>
          </div>
        </div>

        <ul>
          {canAccessMyAccount && (
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 text-[16px] group hover:bg-primary-50/50 hover:text-primary-600 border-b border-[#C7CACF80]"
            >
              <RiUserLine />
              <span>Profile</span>
            </DropdownItem>
          )}
          <DropdownItem
            onItemClick={closeDropdown}
            tag="a"
            to={getWebsiteUrl()}
            className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 text-[16px] group hover:bg-primary-50/50 hover:text-primary border-b border-[#C7CACF80]"
          >
            <RiGlobalLine />
            <span>Back to websites</span>
          </DropdownItem>
        </ul>
        <button
          onClick={async () => {
            await callLogoutApi();
            setLogoutCookie();
            clearAuthLocalStorage();
            localStorage.removeItem("partner-preview-mode");
            dispatch(logout());
            dispatch(baseApi.util.resetApiState());
            closeDropdown();
            window.location.href = getPortalLoginUrl();
          }}
          className="mt-2 flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <svg
            className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
              fill="currentColor"
            />
          </svg>
          Logout
        </button>
      </Dropdown>
    </div>
  );
}
