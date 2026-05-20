import { ReactNode, useEffect } from "react";
import { io } from "socket.io-client";
import {
  getAuthBrowserId,
  getAuthClientId,
  getLocalAuthSessionEventKey,
  getAuthSyncSocketUrl,
} from "../lib/authSessionSync";

type Props = {
  children: ReactNode;
};

const RELOAD_GUARD_KEY = "ct_auth_session_reload_guard";

export default function AuthSessionSyncProvider({ children }: Props) {
  useEffect(() => {
    const browserId = getAuthBrowserId();
    const clientId = getAuthClientId();
    const socket = io(getAuthSyncSocketUrl(), {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const joinBrowserRoom = () => {
      socket.emit("auth:join-browser", { browserId });
    };

    const reloadOnceForSignal = (payload: {
      type?: string | null;
      sourceClientId?: string | null;
      timestamp?: number | null;
    }) => {
      const signalKey = `${payload?.type || "auth"}:${payload?.timestamp || ""}:${payload?.sourceClientId || ""}`;
      const now = Date.now();
      try {
        const previous = JSON.parse(
          sessionStorage.getItem(RELOAD_GUARD_KEY) || "null",
        ) as { signalKey?: string; reloadedAt?: number } | null;
        if (
          previous?.signalKey === signalKey ||
          (previous?.reloadedAt && now - previous.reloadedAt < 3000)
        ) {
          return;
        }
        sessionStorage.setItem(
          RELOAD_GUARD_KEY,
          JSON.stringify({ signalKey, reloadedAt: now }),
        );
      } catch {
        // If storage is unavailable, still allow a single browser reload attempt.
      }
      window.location.reload();
    };

    const handleSessionChanged = (payload: {
      type?: string | null;
      sourceClientId?: string | null;
      timestamp?: number | null;
    }) => {
      if (payload?.sourceClientId && payload.sourceClientId === clientId) {
        return;
      }
      reloadOnceForSignal(payload);
    };

    const handleLocalSessionChanged = (event: StorageEvent) => {
      if (event.key !== getLocalAuthSessionEventKey() || !event.newValue) {
        return;
      }

      try {
        const payload = JSON.parse(event.newValue) as {
          sourceClientId?: string | null;
        };
        handleSessionChanged(payload);
      } catch {
        window.location.reload();
      }
    };

    socket.on("connect", joinBrowserRoom);
    socket.on("auth:session-changed", handleSessionChanged);
    window.addEventListener("storage", handleLocalSessionChanged);
    socket.connect();

    return () => {
      socket.off("connect", joinBrowserRoom);
      socket.off("auth:session-changed", handleSessionChanged);
      window.removeEventListener("storage", handleLocalSessionChanged);
      socket.disconnect();
    };
  }, []);

  return <>{children}</>;
}
