/**
 * Cross-portal routing: server sets optional cookie (default name `role_msbhh`).
 * Add new roles to ROLE_HOME_PORTAL in all three apps (admin / student / partner).
 */

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

export function getPortalOrigin(portal: PortalKind, appDomain?: string): string {
  const domain = normalizeAppDomain(appDomain ?? config.app_domain);
  if (!domain) return "";
  return `${PROTOCOL}://${subdomainForPortal(portal)}.${domain}`;
}

export function normalizeRoleKey(role: string): string {
  return role.trim().toUpperCase().replace(/\s+/g, "_");
}

export function homePortalForRole(role: string | undefined | null): PortalKind | null {
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

export function redirectToCorrectPortalIfNeeded(user: {
  role?: string;
  type?: string;
}): boolean {
  const role = resolvePortalRoleForRedirect(user);
  const home = homePortalForRole(role);
  const current = inferCurrentPortal();

  if (!home) return false;

  if (home === current) return false;

  const target = getPortalOrigin(home, config.app_domain);
  if (!target) return false;
  window.location.replace(`${target}/`);
  return true;
}
