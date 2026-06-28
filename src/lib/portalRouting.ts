import { config } from "../config";
import { clearAuthLocalStorage } from "./authLocalStorage";

/** Full page redirects must clear persisted auth or GuestOnlyAuthRoute ↔ ProtectedRoute will loop (SPA reload still rehydrates redux-persist). */
export function clearClientAuthStorageForHardRedirect(): void {
  clearAuthLocalStorage();
  try {
    localStorage.removeItem("persist:auth");
  } catch {
    /* ignore */
  }
}

export type PortalKind = "admin" | "student" | "partner";

export const PORTAL_ROLE_COOKIE =
  import.meta.env.VITE_PORTAL_ROLE_COOKIE ?? "role_msbhh";
const PORTAL_LOGIN_COOKIE = "ct_login";
const PORTAL_LOGIN_HANDLED_STORAGE_KEY = "ct_login_handled";
const PORTAL_LOGIN_SIGNAL_TTL_SECONDS = 60 * 60 * 24;

const PROTOCOL = import.meta.env.VITE_DASHBOARD_PROTOCOL ?? "https";

const SUB = {
  admin: import.meta.env.VITE_SUBDOMAIN_ADMIN ?? "admin",
  student: import.meta.env.VITE_SUBDOMAIN_STUDENT ?? "student",
  partner: import.meta.env.VITE_SUBDOMAIN_PARTNER ?? "partner",
} as const;

const PORTAL_THIS_APP: PortalKind = "partner";

/** Portal login on app domain with explicit partner tab fallback. */
export const PORTAL_LOGIN_PATH = "/auth/login/?tab=partner";
/** Development: SPA-local login route (no /auth prefix, no tab query). */
export const DEV_PORTAL_LOGIN_PATH = "/login";

/**
 * True when the app is running on the configured primary app domain
 * (e.g. campustransfer.com or any of its subdomains). This is false for
 * standalone deployments such as *.vercel.app or localhost, where the
 * centralized login hub is not reachable and the app should use its own
 * `/login` page instead.
 */
export function isOnPrimaryAppDomain(): boolean {
  if (typeof window === "undefined") return false;
  const domain = normalizeAppDomain(config.app_domain).toLowerCase();
  if (!domain) return false;
  const host = window.location.hostname.toLowerCase();
  return host === domain || host.endsWith(`.${domain}`);
}

export function getPortalLoginUrl(): string {
  if (typeof window === "undefined") return PORTAL_LOGIN_PATH;
  // Only route to the centralized login hub when actually on the primary
  // app domain. Otherwise (vercel.app preview, localhost, etc.) keep the
  // user on this deployment's own login page.
  if (config.node_env === "production" && isOnPrimaryAppDomain()) {
    const host = normalizeAppDomain(config.app_domain);
    return host ? `https://${host}${PORTAL_LOGIN_PATH}` : PORTAL_LOGIN_PATH;
  }
  return `${window.location.origin}${DEV_PORTAL_LOGIN_PATH}`;
}

export const ROLE_HOME_PORTAL: Record<string, PortalKind> = {
  ADMIN: "admin",
  SUPER_ADMIN: "admin",
  SUPERADMIN: "admin",
  AGENT: "admin",
  EMPLOYEE: "admin",
  STUDENT: "student",
  PARTNER: "partner",
  PARTNER_TEAM_MEMBER: "partner",
};

export function normalizeAppDomain(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/^https?:\/\//i, "")
    .split("/")[0]
    .replace(/\/$/, "")
    .trim();
}

function subdomainForPortal(portal: PortalKind): string {
  return SUB[portal];
}

export function getPortalOrigin(
  portal: PortalKind,
  appDomain?: string,
): string {
  const domain = normalizeAppDomain(appDomain ?? config.app_domain);
  if (!domain) return "";
  return `${PROTOCOL}://${subdomainForPortal(portal)}.${domain}`;
}

export function normalizeRoleKey(role: string): string {
  return role.trim().toUpperCase().replace(/\s+/g, "_");
}

export function homePortalForRole(
  role: string | undefined | null,
): PortalKind | null {
  if (!role) return null;
  const key = normalizeRoleKey(role);
  if (ROLE_HOME_PORTAL[key]) return ROLE_HOME_PORTAL[key];
  if (key.includes("PARTNER")) return "partner";
  return null;
}

// h

export function readPortalRoleCookie(): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${PORTAL_ROLE_COOKIE}=`;
  let value: string | null = null;
  for (const part of document.cookie.split(";")) {
    const c = part.trim();
    if (c.startsWith(prefix)) {
      try {
        value = decodeURIComponent(c.slice(prefix.length));
      } catch {
        value = c.slice(prefix.length);
      }
    }
  }
  return value;
}

function getRootDomain(): string {
  const h = window.location.hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || /^\d+\.\d+\.\d+\.\d+$/.test(h)) {
    return h;
  }
  const parts = h.split(".").filter(Boolean);
  return parts.length >= 2 ? "." + parts.slice(-2).join(".") : h;
}

function readPortalLoginSignal(): { signal: string; role: string } | null {
  if (typeof document === "undefined") return null;
  const prefix = `${PORTAL_LOGIN_COOKIE}=`;
  let signal: string | null = null;
  for (const part of document.cookie.split(";")) {
    const c = part.trim();
    if (c.startsWith(prefix)) {
      signal = decodeURIComponent(c.slice(prefix.length));
    }
  }
  if (!signal) return null;
  const role = signal.split(":").slice(1).join(":").trim();
  return role ? { signal, role } : null;
}

export function setPortalLoginCookie(role: string): void {
  if (typeof document === "undefined") return;
  const normalizedRole = String(role || "").trim().toUpperCase();
  if (!normalizedRole) return;
  const domain = getRootDomain();
  const domainAttr = domain.startsWith(".") ? `; domain=${domain}` : "";
  const rawSignal = `${Date.now()}:${normalizedRole}`;
  document.cookie = `${PORTAL_LOGIN_COOKIE}=${encodeURIComponent(rawSignal)}; path=/${domainAttr}; max-age=${PORTAL_LOGIN_SIGNAL_TTL_SECONDS}; SameSite=Lax`;
  localStorage.setItem(PORTAL_LOGIN_HANDLED_STORAGE_KEY, rawSignal);
}

export function redirectFromLatestLoginSignalIfNeeded(): boolean {
  if (typeof window === "undefined") return false;
  const loginSignal = readPortalLoginSignal();
  if (!loginSignal) return false;
  if (localStorage.getItem(PORTAL_LOGIN_HANDLED_STORAGE_KEY) === loginSignal.signal) {
    return false;
  }
  localStorage.setItem(PORTAL_LOGIN_HANDLED_STORAGE_KEY, loginSignal.signal);
  const home = homePortalForRole(loginSignal.role);
  if (!home) return false;
  if (home === inferCurrentPortal()) {
    if (hasClientAuthEvidence()) {
      clearAuthLocalStorage();
      window.location.replace(window.location.href);
      return true;
    }
    return false;
  }
  const target = getPortalOrigin(home, config.app_domain);
  if (!target) return false;
  clearAuthLocalStorage();
  // On standalone deployments the sibling subdomains don't exist; keep the
  // user on this deployment's own login page instead.
  if (!isOnPrimaryAppDomain()) {
    window.location.replace(DEV_PORTAL_LOGIN_PATH);
    return true;
  }
  window.location.replace(`${target}/`);
  return true;
}

function hasClientAuthEvidence(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const token = localStorage.getItem("token")?.trim();
    if (token) return true;
    const persisted = localStorage.getItem("persist:auth");
    if (persisted) return true;
  } catch {
    return false;
  }
  return false;
}

export function redirectFromPortalRoleCookieIfNeeded(): boolean {
  if (typeof window === "undefined") return false;
  if (!hasClientAuthEvidence()) return false;
  const raw = readPortalRoleCookie();
  if (!raw?.trim()) return false;
  const home = homePortalForRole(raw.trim());
  const current = inferCurrentPortal();
  if (!home || home === current) return false;
  if (config.node_env !== "production" || !isOnPrimaryAppDomain()) {
    clearClientAuthStorageForHardRedirect();
    window.location.replace(DEV_PORTAL_LOGIN_PATH);
    return true;
  }
  const target = getPortalOrigin(home, config.app_domain);
  if (!target) return false;
  clearClientAuthStorageForHardRedirect();
  window.location.replace(`${target}/`);
  return true;
}

export function resolvePortalRoleForRedirect(user: {
  role?: string;
  type?: string;
}): string | null {
  // Admin SPA: HQ employees always resolve as EMPLOYEE for home-portal checks
  if (user?.type === "employee" && inferCurrentPortal() === "admin") {
    return "EMPLOYEE";
  }
  if (user?.type === "employee" && inferCurrentPortal() === "partner") {
    const redux = user?.role ? String(user.role).trim() : "";
    if (redux) return redux;
    return "EMPLOYEE";
  }
  if (user?.type === "employee") return "EMPLOYEE";
  const redux = user?.role ? String(user.role).trim() : "";
  if (redux) return redux;
  const fromCookie = readPortalRoleCookie();
  if (fromCookie && fromCookie.trim()) return fromCookie.trim();
  return null;
}

export function inferCurrentPortal(): PortalKind {
  const env = import.meta.env.VITE_PORTAL?.toLowerCase();
  if (env === "admin" || env === "student" || env === "partner") {
    return env;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    const first = host.split(".")[0];
    if (first === SUB.admin) return "admin";
    if (first === SUB.student) return "student";
    if (first === SUB.partner) return "partner";
  }
  return PORTAL_THIS_APP;
}

/** Whether this account's home portal matches the SPA we are running (student vs partner). */
export function isRoleAllowedOnThisPortal(
  role: string | undefined | null,
): boolean {
  const current = inferCurrentPortal();
  const key = role ? normalizeRoleKey(role) : "";
  // Partner org staff use API role EMPLOYEE but belong on the partner portal (not admin HQ)
  if (current === "partner" && key === "EMPLOYEE") {
    return true;
  }
  const home = homePortalForRole(role);
  return Boolean(home && home === current);
}

/** Partner dashboard: partner roles + org employees (type employee). Not student / HQ admin-only accounts. */
export function isPartnerPortalSession(
  user:
    | {
        role?: string;
        type?: string;
      }
    | null
    | undefined,
): boolean {
  if (!user) return false;
  if (user.type === "employee") return true;
  return isRoleAllowedOnThisPortal(user.role ?? null);
}

/** Message when login succeeds but the account belongs on another portal (same idea as campustransfer-frontend LoginPage). */
export function getPortalRoleMismatchMessage(
  role: string | undefined | null,
): string {
  const home = homePortalForRole(role);
  const current = inferCurrentPortal();

  if (current === "student") {
    if (home === "partner") {
      return "This email belongs to a partner account. Please sign in on the partner portal.";
    }
    if (home === "admin") {
      return "This email belongs to a staff account. Please use the admin portal to sign in.";
    }
    return "This account is not for the student portal.";
  }
  if (current === "partner") {
    if (home === "student") {
      return "This email belongs to a student account. Please sign in on the student portal.";
    }
    if (home === "admin") {
      return "This email belongs to a staff account. Please use the admin portal to sign in.";
    }
    return "This account is not for the partner portal.";
  }
  return "This account is not for this portal.";
}

export function redirectToCorrectPortalIfNeeded(
  user: { role?: string; type?: string } | null | undefined,
): boolean {
  if (!user) return false;
  const current = inferCurrentPortal();
  // Partner SPA: designation-based employees stay here; do not send to admin subdomain
  if (current === "partner" && user.type === "employee") {
    return false;
  }
  const role = resolvePortalRoleForRedirect(user);
  const home = homePortalForRole(role);

  if (!home) return false;

  if (home === current) return false;

  if (config.node_env !== "production" || !isOnPrimaryAppDomain()) {
    clearClientAuthStorageForHardRedirect();
    window.location.replace(DEV_PORTAL_LOGIN_PATH);
    return true;
  }

  const target = getPortalOrigin(home, config.app_domain);
  if (!target) return false;
  clearClientAuthStorageForHardRedirect();
  window.location.replace(`${target}/`);
  return true;
}
