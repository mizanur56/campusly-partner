export const config = {
  // 🌐 Application
  app_domain: import.meta.env.VITE_PUBLIC_APP_DOMAIN,

  api: import.meta.env.VITE_API_URL,
  image_access_url: import.meta.env.VITE_IMAGE_ACCESS_URL,

  // 🚀 Server & API
  // server_url: import.meta.env.VITE_PUBLIC_SERVER_URL,
  // api_url: import.meta.env.VITE_PUBLIC_API_URL,
  // image_access_url: import.meta.env.VITE_PUBLIC_IMAGE_ACCESS_URL,

  // 🔑 Third-Party Services
  tiny_api_key: import.meta.env.VITE_PUBLIC_TINY_API_KEY,
} as const;
