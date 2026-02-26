import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";
import { config } from "../../config";
import { logout } from "../features/auth/authSlice";
import { RootState } from "../features/store";

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

// ======================
// Base Query
// ======================
const rawBaseQuery = fetchBaseQuery({
  baseUrl: config.api,
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

// ======================
// Custom Base Query with Token Refresh
// ======================
const baseQueryWithRefreshToken: BaseQueryFn<
  string | FetchArgs, // request type
  unknown, // response type
  FetchBaseQueryError // error type
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  // Check for 401 errors - can be status 401 or nested in error.data
  const is401Error =
    result?.error?.status === 401 ||
    (result?.error?.data &&
      typeof result.error.data === "object" &&
      "error" in result.error.data &&
      (result.error.data as any).error?.statusCode === 401);

  if (is401Error) {
    // Extract error message - handle multiple possible structures
    let errorMessage = "Unauthorized. Please log in.";

    if (result?.error?.data) {
      if (typeof result?.error?.data === "string") {
        errorMessage = result.error.data;
      } else if (typeof result.error.data === "object") {
        // Check for message at root level
        if ("message" in result.error.data) {
          errorMessage =
            (result.error.data as { message?: string }).message || errorMessage;
        }
        // Check for message in nested error object
        else if (
          "error" in result.error.data &&
          typeof (result.error.data as any).error === "object" &&
          "message" in (result.error.data as any).error
        ) {
          errorMessage =
            (result.error.data as any).error.message || errorMessage;
        }
      }
    }

    // Check if this is a session invalidation (permissions updated)
    const isSessionExpired =
      errorMessage?.toLowerCase().includes("session expired") ||
      errorMessage?.toLowerCase().includes("session has been invalidated") ||
      errorMessage?.toLowerCase().includes("updated permissions") ||
      errorMessage?.toLowerCase().includes("re-login") ||
      errorMessage?.toLowerCase().includes("please login again");

    if (isSessionExpired) {
      // Show specific message for permission updates
      toast.error(
        "Your permissions have been updated. Please login again to continue.",
        { autoClose: 5000 }
      );
    } else {
      // Show generic unauthorized message
      toast.error(errorMessage || "Unauthorized. Please log in.");
    }

    // Clear auth state
    api.dispatch(logout());

    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    try {
      // Preserve the current path so user can be redirected back after login
      const currentPath = window.location.pathname + window.location.search;
      const encoded = encodeURIComponent(currentPath);
      const basename = "/";

      // Small delay to ensure toast shows
      setTimeout(() => {
        window.location.href = `${basename}/login?redirect=${encoded}`;
      }, 100);
    } catch (err) {
      console.error("Error during redirect:", err);
      const basename = "/";
      window.location.href = `${basename}/login`;
    }
  }

  if (result?.error?.status === 404) {
    toast.error(
      result.error.data &&
        typeof result.error.data === "object" &&
        "message" in result.error.data
        ? (result.error.data as { message?: string }).message || "Not found."
        : "Not found."
    );
  }

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
  ],
  endpoints: () => ({}),
});
