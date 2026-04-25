import { io, Socket } from "socket.io-client";

const getSocketURL = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error(
      "❌ VITE_API_URL is not configured! Please set it in your .env file.\n" +
        "Example: VITE_API_URL=http://localhost:5030/api",
    );
  }

  return apiUrl.replace(/\/api\/?$/, "");
};

const SOCKET_URL = getSocketURL();

let socket: Socket | null = null;

function buildAuth(token: string | null | undefined): Record<string, string> {
  return token ? { token } : {};
}

/**
 * Shared Socket.IO client for notifications and chat.
 * Pass `authToken` so the server can authenticate JWT on connect (required for chat rooms).
 */
export const getSocket = (authToken?: string | null): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: buildAuth(authToken),
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ["websocket", "polling"],
      upgrade: true,
      forceNew: false,
      multiplex: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
    });
  } else if (authToken !== undefined) {
    const nextAuth = buildAuth(authToken);
    const prev = JSON.stringify((socket as { auth?: object }).auth ?? {});
    const next = JSON.stringify(nextAuth);
    if (prev !== next) {
      (socket as { auth: Record<string, string> }).auth = nextAuth;
      if (socket.connected) {
        socket.disconnect();
      }
    }
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};
