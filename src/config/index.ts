/** Central app config. API base is used by RTK Query baseApi (redux/api/baseApi.ts). */

const apiBase = import.meta.env.VITE_API_URL ?? "/api";

/** Image base URL: from VITE_IMAGE_ACCESS_URL, or derived from API base (origin) so path can be appended. */
function getImageAccessUrl(): string {
  const envUrl = import.meta.env.VITE_IMAGE_ACCESS_URL;
  if (envUrl) return envUrl;
  if (apiBase.startsWith("http")) {
    try {
      return new URL(apiBase).origin;
    } catch {
      return "";
    }
  }
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export const config = {
  // 🌐 Application
  app_domain: import.meta.env.VITE_PUBLIC_APP_DOMAIN || "https://campustransfer.com/",

  // API base: always prefer explicit VITE_API_URL; fall back to /api
  // Example local: VITE_API_URL=http://localhost:5030/api
  api: apiBase,

  // Image base URL: env VITE_IMAGE_ACCESS_URL, else same origin as API (base URL + path for images)
  image_access_url: getImageAccessUrl(),

  // 🔑 Third-Party Services
  tiny_api_key: import.meta.env.VITE_PUBLIC_TINY_API_KEY,
} as const;
