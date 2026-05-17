const apiBase = import.meta.env.VITE_API_URL ?? "/api";

/** WebSocket origin for Socket.IO (notifications + chat). Override with VITE_SOCKET_URL. */
function getSocketUrl(): string {
  const explicit = import.meta.env.VITE_SOCKET_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (apiBase.startsWith("http")) {
    try {
      return new URL(apiBase).origin;
    } catch {
      return apiBase;
    }
  }
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

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
  app_domain: import.meta.env.VITE_PUBLIC_APP_DOMAIN || "campustransfer.com",
  /** Mirrors `.env` `VITE_NODE_ENV` — drives auth/login vs SPA `/login` routing. */
  node_env: import.meta.env.VITE_NODE_ENV ?? import.meta.env.MODE,
  api: apiBase,
  /** Same origin as HTTP API unless VITE_SOCKET_URL is set */
  socketUrl: getSocketUrl(),
  image_access_url: getImageAccessUrl(),
} as const;
