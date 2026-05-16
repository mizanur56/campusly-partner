import { config } from "../config";

const COOKIE_NAME = "ct_logout";
const HANDLED_STORAGE_KEY = "ct_logout_handled";
const LOGOUT_SIGNAL_TTL_SECONDS = 60 * 60 * 24; // 24h

function getRootDomain(): string {
  const h = window.location.hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || /^\d+\.\d+\.\d+\.\d+$/.test(h)) {
    return h;
  }
  const parts = h.split(".").filter(Boolean);
  if (parts.length >= 2) {
    return "." + parts.slice(-2).join(".");
  }
  return h;
}

function buildCookieStr(value: string, maxAgeSeconds: number): string {
  const domain = getRootDomain();
  const domainAttr = domain.startsWith(".") ? `; domain=${domain}` : "";
  return `${COOKIE_NAME}=${value}; path=/${domainAttr}; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function setLogoutCookie(): void {
  const signal = String(Date.now());
  document.cookie = buildCookieStr(signal, LOGOUT_SIGNAL_TTL_SECONDS);
  localStorage.setItem(HANDLED_STORAGE_KEY, signal);
}

export function clearLogoutCookie(): void {
  const signal = getLogoutSignal();
  if (signal) localStorage.setItem(HANDLED_STORAGE_KEY, signal);
}

export function hasLogoutCookie(): boolean {
  const signal = getLogoutSignal();
  return Boolean(signal && localStorage.getItem(HANDLED_STORAGE_KEY) !== signal);
}

function getLogoutSignal(): string | null {
  const prefix = `${COOKIE_NAME}=`;
  const found = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(prefix));
  return found ? decodeURIComponent(found.slice(prefix.length)) : null;
}

export async function callLogoutApi(): Promise<void> {
  try {
    const apiBase = String(config.api ?? "").replace(/\/$/, "");
    await fetch(`${apiBase}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // ignore
  }
}
