import { config } from "../config";

const BROWSER_ID_COOKIE = "ct_browser_id";
const LOCAL_SESSION_EVENT_KEY = "ct_auth_session_changed";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
let pageClientId: string | null = null;

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getRootDomain(): string {
  const h = window.location.hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || /^\d+\.\d+\.\d+\.\d+$/.test(h)) {
    return h;
  }
  const parts = h.split(".").filter(Boolean);
  return parts.length >= 2 ? `.${parts.slice(-2).join(".")}` : h;
}

function getCookie(name: string): string | null {
  const prefix = `${name}=`;
  const found = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(prefix));
  return found ? decodeURIComponent(found.slice(prefix.length)) : null;
}

function setCookie(name: string, value: string): void {
  const domain = getRootDomain();
  const domainAttr = domain.startsWith(".") ? `; domain=${domain}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/${domainAttr}; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
}

export function getAuthBrowserId(): string {
  const existing = getCookie(BROWSER_ID_COOKIE);
  if (existing) return existing;
  const next = createId();
  setCookie(BROWSER_ID_COOKIE, next);
  return next;
}

export function getAuthClientId(): string {
  if (!pageClientId) {
    pageClientId = createId();
  }
  return pageClientId;
}

export function getAuthSyncHeaders(): Record<string, string> {
  return {
    "x-browser-id": getAuthBrowserId(),
    "x-client-id": getAuthClientId(),
  };
}

export function getAuthSyncSocketUrl(): string {
  const configured = String(config.socketUrl ?? "").replace(/\/$/, "");
  if (configured) return configured;
  const api = String(config.api ?? "").replace(/\/$/, "");
  return api ? api.replace(/\/api$/i, "") : window.location.origin;
}

export function broadcastLocalAuthSessionChange(type: "login" | "logout"): void {
  localStorage.setItem(
    LOCAL_SESSION_EVENT_KEY,
    JSON.stringify({
      type,
      sourceClientId: getAuthClientId(),
      timestamp: Date.now(),
    }),
  );
}

export function getLocalAuthSessionEventKey(): string {
  return LOCAL_SESSION_EVENT_KEY;
}
