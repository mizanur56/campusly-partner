import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { config } from "../config";
import {
  clearAuthLocalStorage,
  persistAuthLocalStorage,
} from "../lib/authLocalStorage";
import {
  buildUserData,
  extractAccessTokenFromRefreshJson,
  extractUserFromMeJson,
} from "../lib/authSessionRefresh";
import {
  logout,
  selectCurrentUser,
  setUser,
  useCurrentToken,
} from "../redux/features/auth/authSlice";
import {
  getPortalLoginUrl,
  isPartnerPortalSession,
  redirectFromLatestLoginSignalIfNeeded,
  redirectFromPortalRoleCookieIfNeeded,
  redirectToCorrectPortalIfNeeded,
} from "../lib/portalRouting";
import { clearLogoutCookie, hasLogoutCookie } from "../lib/logoutCookie";
const apiBase = (config.api ?? "").replace(/\/$/, "");

const PUBLIC_AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/set-password",
] as const;

function isPublicAuthPath(): boolean {
  if (typeof window === "undefined") return false;
  const p = window.location.pathname;
  return PUBLIC_AUTH_PATHS.some(
    (prefix) => p === prefix || p.startsWith(`${prefix}/`),
  );
}

function getInitialSessionGateStatus(): "checking" | "done" {
  if (typeof window === "undefined") return "checking";
  return isPublicAuthPath() ? "done" : "checking";
}

async function callMe(token: string): Promise<Response> {
  return fetch(`${apiBase}/auth/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
}

async function callRefresh(): Promise<Response> {
  return fetch(`${apiBase}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  });
}

export default function SessionRestoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(useCurrentToken);

  const [status, setStatus] = useState<"checking" | "done">(
    getInitialSessionGateStatus,
  );
  const attempted = useRef(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (hasLogoutCookie()) {
      clearLogoutCookie();
      clearAuthLocalStorage();
      dispatch(logout());
      if (!isPublicAuthPath()) {
        window.location.replace(getPortalLoginUrl());
      }
      return;
    }
    if (redirectFromLatestLoginSignalIfNeeded()) return;
    if (isPublicAuthPath()) return;
    if (redirectFromPortalRoleCookieIfNeeded()) return;
  }, [dispatch]);

  useEffect(() => {
    if (attempted.current) return;

    const publicAnonymous =
      isPublicAuthPath() && !user && !token && !localStorage.getItem("token");

    if (publicAnonymous) {
      setStatus("done");
      return;
    }

    attempted.current = true;

    const goLoginOrStayOnPublicAuth = () => {
      clearAuthLocalStorage();
      dispatch(logout());
      if (isPublicAuthPath()) {
        setStatus("done");
        return;
      }
      if (hasLogoutCookie()) {
        clearLogoutCookie();
        window.location.href = getPortalLoginUrl();
        return;
      }
      if (redirectFromPortalRoleCookieIfNeeded()) return;
      window.location.href = getPortalLoginUrl();
    };

    const restore = async () => {
      try {
        let bearer = (token ?? localStorage.getItem("token") ?? "").trim();

        // ── 1) /auth/me (cookie-only session uses empty Authorization) ──
        let meRes = await callMe(bearer);

        if (meRes.status === 401) {
          // ── 2) Only on 401: refresh, then /auth/me again ──
          const refreshRes = await callRefresh();

          if (!refreshRes.ok) {
            goLoginOrStayOnPublicAuth();
            return;
          }

          const refreshJson = await refreshRes.json().catch(() => null);
          const newToken = extractAccessTokenFromRefreshJson(refreshJson);

          if (!newToken) {
            goLoginOrStayOnPublicAuth();
            return;
          }

          bearer = newToken;
          meRes = await callMe(newToken);

          if (!meRes.ok) {
            goLoginOrStayOnPublicAuth();
            return;
          }
        } else if (!meRes.ok) {
          goLoginOrStayOnPublicAuth();
          return;
        }

        const meJson = await meRes.json().catch(() => null);
        const rawUser = extractUserFromMeJson(meJson);

        if (!rawUser) {
          goLoginOrStayOnPublicAuth();
          return;
        }

        const userData = buildUserData(rawUser as Record<string, unknown>);
        /** Bearer already worked for /auth/me — avoid extra refresh-token on every visit. */
        let sessionToken = bearer.trim();

        if (!sessionToken) {
          const refreshRes = await callRefresh();
          if (!refreshRes.ok) {
            goLoginOrStayOnPublicAuth();
            return;
          }
          const refreshJson = await refreshRes.json().catch(() => null);
          const fromRefresh = extractAccessTokenFromRefreshJson(refreshJson);
          if (!fromRefresh) {
            goLoginOrStayOnPublicAuth();
            return;
          }
          if (redirectToCorrectPortalIfNeeded(userData as any)) return;
          if (!isPartnerPortalSession(userData as any)) {
            clearAuthLocalStorage();
            dispatch(logout());
            window.location.href = getPortalLoginUrl();
            return;
          }
          dispatch(setUser({ user: userData as any, token: fromRefresh }));
          persistAuthLocalStorage(userData, fromRefresh);
          setStatus("done");
          return;
        }

        if (redirectToCorrectPortalIfNeeded(userData as any)) return;
        if (!isPartnerPortalSession(userData as any)) {
          clearAuthLocalStorage();
          dispatch(logout());
          window.location.href = getPortalLoginUrl();
          return;
        }
        dispatch(setUser({ user: userData as any, token: sessionToken }));
        persistAuthLocalStorage(userData, sessionToken);
        setStatus("done");
      } catch {
        goLoginOrStayOnPublicAuth();
      }
    };

    restore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === "checking") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
          <p className="text-sm text-gray-400">Loading your session…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
