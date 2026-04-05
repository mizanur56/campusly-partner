import type { BaseQueryApi } from "@reduxjs/toolkit/query";
import { config } from "../config";
import { setUser } from "../redux/features/auth/authSlice";
import { persistAuthLocalStorage } from "./authLocalStorage";

const apiBase = (config.api ?? "").replace(/\/$/, "");

/** Match login / SessionRestore user shaping */
export function buildUserData(raw: Record<string, unknown>) {
  const role = typeof raw.role === "string" ? raw.role : "";
  return {
    ...raw,
    type: role === "EMPLOYEE" ? "employee" : "user",
  };
}

/** Support common backend shapes for refresh-token responses */
export function extractAccessTokenFromRefreshJson(json: unknown): string | undefined {
  if (!json || typeof json !== "object") return undefined;
  const root = json as Record<string, unknown>;
  const nested = root.data;
  if (nested && typeof nested === "object") {
    const d = nested as Record<string, unknown>;
    for (const key of ["token", "accessToken", "access_token"] as const) {
      const v = d[key];
      if (typeof v === "string" && v.length > 0) return v;
    }
  }
  for (const key of ["token", "accessToken", "access_token"] as const) {
    const v = root[key];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return undefined;
}

/** Support user at root, `data`, or `data.user` */
export function extractUserFromMeJson(json: unknown): Record<string, unknown> | undefined {
  if (!json || typeof json !== "object") return undefined;
  const root = json as Record<string, unknown>;
  if (root.user && typeof root.user === "object") {
    return root.user as Record<string, unknown>;
  }
  const data = root.data;
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;
  if (d.user && typeof d.user === "object") {
    return d.user as Record<string, unknown>;
  }
  if (typeof d.id === "string" || typeof d.email === "string" || typeof d.role === "string") {
    return d;
  }
  return undefined;
}

let refreshSessionPromise: Promise<boolean> | null = null;

/**
 * POST refresh-token → GET auth/me → Redux + localStorage.
 * Concurrent 401s share one refresh (mutex).
 */
export function refreshAuthSession(api: BaseQueryApi): Promise<boolean> {
  if (!refreshSessionPromise) {
    refreshSessionPromise = performRefreshSession(api).finally(() => {
      refreshSessionPromise = null;
    });
  }
  return refreshSessionPromise;
}

async function performRefreshSession(api: BaseQueryApi): Promise<boolean> {
  try {
    const refreshRes = await fetch(`${apiBase}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });
    if (!refreshRes.ok) return false;

    const refreshJson = await refreshRes.json().catch(() => null);
    const newToken = extractAccessTokenFromRefreshJson(refreshJson);
    if (!newToken) return false;

    const meRes = await fetch(`${apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${newToken}` },
      credentials: "include",
    });
    if (!meRes.ok) return false;

    const meJson = await meRes.json().catch(() => null);
    const rawUser = extractUserFromMeJson(meJson);
    if (!rawUser) return false;

    const userData = buildUserData(rawUser);
    api.dispatch(setUser({ user: userData as any, token: newToken }));
    persistAuthLocalStorage(userData, newToken);
    return true;
  } catch {
    return false;
  }
}
