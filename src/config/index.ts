/** Central app config. API base is used by RTK Query baseApi (redux/api/baseApi.ts). */
export const config = {
  // 🌐 Application
  // Default origin falls back to production domain if env is not set
  app_domain: import.meta.env.VITE_PUBLIC_APP_DOMAIN || "https://campustransfer.com/",

  // API base: always prefer explicit VITE_API_URL; fall back to /api
  // Example local: VITE_API_URL=http://localhost:5030/api
  api: import.meta.env.VITE_API_URL ?? "/api",
  image_access_url: import.meta.env.VITE_IMAGE_ACCESS_URL,

  // 🚀 Server & API
  // server_url: import.meta.env.VITE_PUBLIC_SERVER_URL,
  // api_url: import.meta.env.VITE_PUBLIC_API_URL,
  // image_access_url: import.meta.env.VITE_PUBLIC_IMAGE_ACCESS_URL,

  // 🔑 Third-Party Services
  tiny_api_key: import.meta.env.VITE_PUBLIC_TINY_API_KEY,
} as const;
