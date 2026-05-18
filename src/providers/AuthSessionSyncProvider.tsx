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

    const handleSessionChanged = (payload: { sourceClientId?: string | null }) => {
      if (payload?.sourceClientId && payload.sourceClientId === clientId) {
        return;
      }
      window.location.reload();
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
