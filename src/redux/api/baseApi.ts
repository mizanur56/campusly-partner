import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";
import { config } from "../../config";
import { refreshAuthSession } from "../../lib/authSessionRefresh";
import { clearAuthLocalStorage } from "../../lib/authLocalStorage";
import { logout } from "../features/auth/authSlice";
import { RootState } from "../features/store";
import { getPortalLoginUrl } from "../../lib/portalRouting";

// ======================
// IP Fetch
// ======================
const getClientIP = async (): Promise<string> => {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data: { ip: string } = await res.json();
    return data?.ip || "Unknown";
  } catch {
    return "Unknown";
  }
};

// ======================
// Construct Client Metadata
// ======================
interface ClientDetails {
  ipAddress: string;
  userAgent: string;
  browserUrl: string;
  accessedAt: string;
}

const getClientDetails = async (): Promise<ClientDetails> => {
  const ipAddress = await getClientIP();
  const userAgent = navigator.userAgent || "Unknown";
  const browserUrl = (() => {
    try {
      const current = window.location.href;
      const url = new URL(current);
      const origin = config.app_domain || "https://campustransfer.com/";
      const cleanOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin;
      return `${cleanOrigin}${url.pathname}${url.search}${url.hash}`;
    } catch {
      return config.app_domain || "https://campustransfer.com/";
    }
  })();

  return {
    ipAddress,
    userAgent,
    browserUrl,
    accessedAt: new Date().toISOString(),
  };
};

// Mutations that return 401 for invalid credentials — do not chain refresh
const NO_REFRESH_ON_401_ENDPOINTS = new Set([
  "login",
  "register",
  "forgotPassword",
  "resetPassword",
  "setPasswordByInvitation",
]);

function is401Result(result: { error?: FetchBaseQueryError }): boolean {
  if (result?.error?.status === 401) return true;
  const data = result?.error?.data;
  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error?: { statusCode?: number } }).error;
    return err?.statusCode === 401;
  }
  return false;
}

// ======================
// Base Query
// ======================
const rawBaseQuery = fetchBaseQuery({
  baseUrl: config.api, // from src/config — single source for API base
  credentials: "include",
  prepareHeaders: async (headers, { getState, endpoint }) => {
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    const clientDetails = await getClientDetails();
    headers.set("X-Client-Details", JSON.stringify(clientDetails));

    // Optional: send current action name
    headers.set("X-Action", endpoint);

    return headers;
  },
});

function handle401Logout(
  api: Parameters<BaseQueryFn>[1],
  result: { error?: FetchBaseQueryError },
) {
  let errorMessage = "Unauthorized. Please log in.";

  if (result?.error?.data) {
    if (typeof result?.error?.data === "string") {
      errorMessage = result.error.data;
    } else if (typeof result.error.data === "object") {
      if ("message" in result.error.data) {
        errorMessage =
          (result.error.data as { message?: string }).message || errorMessage;
      } else if (
        "error" in result.error.data &&
        typeof (result.error.data as any).error === "object" &&
        "message" in (result.error.data as any).error
      ) {
        errorMessage =
          (result.error.data as any).error.message || errorMessage;
      }
    }
  }

  const isSessionExpired =
    errorMessage?.toLowerCase().includes("session expired") ||
    errorMessage?.toLowerCase().includes("session has been invalidated") ||
    errorMessage?.toLowerCase().includes("updated permissions") ||
    errorMessage?.toLowerCase().includes("re-login") ||
    errorMessage?.toLowerCase().includes("please login again");

  if (isSessionExpired) {
    toast.error(
      "Your permissions have been updated. Please login again to continue.",
      { autoClose: 5000 },
    );
  } else {
    toast.error(errorMessage || "Unauthorized. Please log in.");
  }

  api.dispatch(logout());
  clearAuthLocalStorage();

  try {
    setTimeout(() => {
      window.location.href = getPortalLoginUrl();
    }, 100);
  } catch (err) {
    console.error("Error during redirect:", err);
    window.location.href = getPortalLoginUrl();
  }
}

// ======================
// Custom Base Query with Token Refresh + retry
// ======================
const baseQueryWithRefreshToken: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (!is401Result(result)) {
    if (result?.error?.status === 404) {
      toast.error(
        result.error.data &&
          typeof result.error.data === "object" &&
          "message" in result.error.data
          ? (result.error.data as { message?: string }).message || "Not found."
          : "Not found.",
      );
    }
    return result;
  }

  const skipRefresh = NO_REFRESH_ON_401_ENDPOINTS.has(api.endpoint);

  if (!skipRefresh) {
    const refreshed = await refreshAuthSession(api);
    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions);
      if (!is401Result(result)) {
        if (result?.error?.status === 404) {
          toast.error(
            result.error.data &&
              typeof result.error.data === "object" &&
              "message" in result.error.data
              ? (result.error.data as { message?: string }).message ||
                "Not found."
              : "Not found.",
          );
        }
        return result;
      }
    }
  }

  handle401Logout(api, result);
  return result;
};

// ======================
// Base API
// ======================
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: [
    "users",
    "designations",
    "settings",
    "media",
    "folders",
    "content",
    "documentCategories",
    "documents",
    "documentFields",
    "galleryCategories",
    "gallerySections",
    "videoGalleryCategories",
    "videoGalleryVideos",
    "articles",
    "guideCategories",
    "guides",
    "events",
    "studyLevels",
    "countries",
    "contactCountries",
    "cities",
    "contacts",
    "faqs",
    "courses",
    "universities",
    "universityCourses",
    "universityDocuments",
    "universityGallery",
    "speakers",
    "newsCategories",
    "news",
    "jobs",
    "institutionPartners",
    "homepage",
    "countryStudyLevels",
    "countryDocuments",
    "search",
    "applications",
    "invoices",
    "partnerOnboarding",
    "partnerProfile",
    "partnerContract",
    "partnerPayments",
    "bankAccounts",
    "partnerTeams",
    "partnerTasks",
    "hotOffers",
    "studentProfile",
    "announcements",
  ],
  endpoints: () => ({}),
});
