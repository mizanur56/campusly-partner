import { io, Socket } from "socket.io-client";

const getSocketURL = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error(
      "VITE_API_URL is not configured. Example: VITE_API_URL=http://localhost:5030/api",
    );
  }

  return apiUrl.replace(/\/api\/?$/, "");
};

const SOCKET_URL = getSocketURL();
let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
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
  }

  return socket;
};
