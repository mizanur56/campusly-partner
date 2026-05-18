import { config } from "../config";

import {
  broadcastLocalAuthSessionChange,
  getAuthSyncHeaders,
} from "./authSessionSync";

const COOKIE_NAME = "ct_logout";
const LOGIN_COOKIE_NAME = "ct_login";
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

function buildCookieStr(
  name: string,
  value: string,
  maxAgeSeconds: number,
): string {
  const domain = getRootDomain();
  const domainAttr = domain.startsWith(".") ? `; domain=${domain}` : "";
  return `${name}=${value}; path=/${domainAttr}; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearCookie(name: string): void {
  document.cookie = buildCookieStr(name, "", 0);
}

export function setLogoutCookie(): void {
  const signal = String(Date.now());
  clearCookie(LOGIN_COOKIE_NAME);
  document.cookie = buildCookieStr(COOKIE_NAME, signal, LOGOUT_SIGNAL_TTL_SECONDS);
  localStorage.setItem(HANDLED_STORAGE_KEY, signal);
}

export function clearLogoutCookie(): void {
  const signal = getLogoutSignal();
  if (signal) localStorage.setItem(HANDLED_STORAGE_KEY, signal);
  clearCookie(LOGIN_COOKIE_NAME);
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
    const accessToken = localStorage.getItem("token")?.trim() || "";
    const refreshToken = localStorage.getItem("refreshToken")?.trim() || "";
    await fetch(`${apiBase}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthSyncHeaders(),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        accessToken,
        refreshToken,
      }),
    });
  } catch {
    // ignore
  } finally {
    broadcastLocalAuthSessionChange("logout");
  }
}
