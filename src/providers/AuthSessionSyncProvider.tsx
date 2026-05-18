import { ReactNode, useEffect } from "react";
import { io } from "socket.io-client";
import {
  getAuthBrowserId,
  getAuthClientId,
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

    socket.on("connect", joinBrowserRoom);
    socket.on("auth:session-changed", handleSessionChanged);
    socket.connect();

    return () => {
      socket.off("connect", joinBrowserRoom);
      socket.off("auth:session-changed", handleSessionChanged);
      socket.disconnect();
    };
  }, []);

  return <>{children}</>;
}
