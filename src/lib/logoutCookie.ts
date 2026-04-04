import { config } from "../config";

const COOKIE_NAME = "ct_logout";

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
  document.cookie = buildCookieStr("1", 60);
}

export function clearLogoutCookie(): void {
  document.cookie = buildCookieStr("", 0);
}

export function hasLogoutCookie(): boolean {
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${COOKIE_NAME}=1`));
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
