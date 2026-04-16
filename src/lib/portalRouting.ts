import { config } from "../config";

export type PortalKind = "admin" | "student" | "partner";

export const PORTAL_ROLE_COOKIE =
  import.meta.env.VITE_PORTAL_ROLE_COOKIE ?? "role_msbhh";

const PROTOCOL = import.meta.env.VITE_DASHBOARD_PROTOCOL ?? "https";

const SUB = {
  admin: import.meta.env.VITE_SUBDOMAIN_ADMIN ?? "admin",
  student: import.meta.env.VITE_SUBDOMAIN_STUDENT ?? "student",
  partner: import.meta.env.VITE_SUBDOMAIN_PARTNER ?? "partner",
} as const;

const PORTAL_THIS_APP: PortalKind = "partner";

/** Login route for this SPA — guests must not be sent to apex or another subdomain. */
export const PORTAL_LOGIN_PATH = "/login";

export function getPortalLoginUrl(): string {
  if (typeof window === "undefined") return PORTAL_LOGIN_PATH;
  return `${import.meta.env.PROD ? `https://${config.app_domain}/auth` : window.location.origin}${PORTAL_LOGIN_PATH}`;
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

export function readPortalRoleCookie(): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${PORTAL_ROLE_COOKIE}=`;
  for (const part of document.cookie.split(";")) {
    const c = part.trim();
    if (c.startsWith(prefix)) {
      try {
        return decodeURIComponent(c.slice(prefix.length));
      } catch {
        return c.slice(prefix.length);
      }
    }
  }
  return null;
}

export function redirectFromPortalRoleCookieIfNeeded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (!localStorage.getItem("token")) return false;
  } catch {
    return false;
  }
  // Partner subdomain: never jump to admin/student via cookie — validate session here; else /login
  if (inferCurrentPortal() === "partner") {
    return false;
  }
  const raw = readPortalRoleCookie();
  if (!raw?.trim()) return false;
  const home = homePortalForRole(raw.trim());
  const current = inferCurrentPortal();
  if (!home || home === current) return false;
  const target = getPortalOrigin(home, config.app_domain);
  if (!target) return false;
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
  const fromCookie = readPortalRoleCookie();
  if (fromCookie && fromCookie.trim()) return fromCookie.trim();
  const redux = user?.role ? String(user.role).trim() : "";
  if (redux) return redux;
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

  // Partner subdomain: never auto-open admin/student apps — non-partner sessions use /login here
  if (current === "partner") {
    return false;
  }

  const target = getPortalOrigin(home, config.app_domain);
  if (!target) return false;
  window.location.replace(`${target}/`);
  return true;
}
