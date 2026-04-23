import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getSocket } from "../../services/socket";
import { notificationApi } from "../../redux/features/notifications/notificationApi";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";

const SocketManager = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const joinedRef = useRef(false);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    if (!user?.id || isConnectingRef.current) return;

    isConnectingRef.current = true;
    const socket = getSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      if (joinedRef.current) return;
      socket.emit(
        "join",
        { userId: user.id, role: user.role || "PARTNER" },
        (response: { success?: boolean }) => {
          if (response?.success) joinedRef.current = true;
        },
      );
    };

    const handleNotification = (data: {
      title?: string;
      message?: string;
      type?: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
    }) => {
      const typeMap = {
        SUCCESS: toast.success,
        ERROR: toast.error,
        WARNING: toast.warning,
        INFO: toast.info,
      };
      const notify = typeMap[data.type || "INFO"];
      notify(
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-sm text-white">{data.title}</div>
          {data.message ? (
            <div className="text-xs text-white/90">{data.message}</div>
          ) : null}
        </div>,
        { position: "top-right", autoClose: 5000 },
      );

      dispatch(notificationApi.util.invalidateTags(["Notification"]));
      window.dispatchEvent(new CustomEvent("notification-received", { detail: data }));
    };

    const handleConnectError = () => {
      isConnectingRef.current = false;
    };

    const handleDisconnect = (reason: string) => {
      joinedRef.current = false;
      isConnectingRef.current = false;
      if (reason === "io server disconnect") socket.connect();
    };

    socket.on("connect", handleConnect);
    socket.on("notification", handleNotification);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);

    if (!socket.connected) socket.connect();
    else handleConnect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("notification", handleNotification);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
      joinedRef.current = false;
      isConnectingRef.current = false;
    };
  }, [dispatch, user?.id, user?.role]);

  return null;
};

export default SocketManager;
