import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  selectCurrentUser,
  useCurrentToken,
} from "../../redux/features/auth/authSlice";
import { announcementsApi } from "../../redux/features/announcements/announcementsApi";
import { chatApi } from "../../redux/features/chat/chatApi";
import { notificationApi } from "../../redux/features/notifications/notificationApi";
import { getSocket } from "../../services/socket";

const SocketManager = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(useCurrentToken);

  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const joinedRef = useRef(false);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    if (!user?.id || isConnectingRef.current) return;

    isConnectingRef.current = true;
    const socket = getSocket(token);
    socketRef.current = socket;

    const handleConnect = () => {
      if (joinedRef.current) return;

      socket.emit(
        "join",
        {
          userId: user.id,
          role: user.role || "STUDENT",
        },
        (response: any) => {
          if (response?.success) {
            joinedRef.current = true;
          }
        },
      );
    };

    // Function to play notification sound
    const playNotificationSound = () => {
      try {
        const audioContext = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();

        // Create a more pleasant notification sound with two tones (like a chime)
        const createTone = (
          frequency: number,
          startTime: number,
          duration: number,
        ) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          // Use a more pleasant waveform
          oscillator.type = "sine";
          oscillator.frequency.value = frequency;

          // Smooth fade in and out
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
          gainNode.gain.linearRampToValueAtTime(
            0.15,
            startTime + duration * 0.6,
          );
          gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        };

        const now = audioContext.currentTime;
        const duration = 0.3;

        // Play two tones in quick succession (like a notification chime)
        createTone(523.25, now, duration); // C5 note
        createTone(659.25, now + 0.1, duration); // E5 note (slightly delayed)
      } catch (error) {
        console.warn("Could not play notification sound:", error);
      }
    };

    const handleNotification = (data: any) => {
      // Play notification sound
      playNotificationSound();
      // Determine toast type and styling based on notification type
      const getToastConfig = () => {
        switch (data.type) {
          case "SUCCESS":
            return {
              type: toast.success,
              style: {
                background: "#10B981",
                color: "#FFFFFF",
              },
            };
          case "ERROR":
            return {
              type: toast.error,
              style: {
                background: "#EF4444",
                color: "#FFFFFF",
              },
            };
          case "WARNING":
            return {
              type: toast.warning,
              style: {
                background: "#F59E0B",
                color: "#FFFFFF",
              },
            };
          default:
            return {
              type: toast.info,
              style: {
                background: "#3B82F6",
                color: "#FFFFFF",
              },
            };
        }
      };

      const { type: toastType, style } = getToastConfig();

      // Show toast with title and message
      toastType(
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-sm text-white">{data.title}</div>
          {data.message && (
            <div className="text-xs text-white/90">{data.message}</div>
          )}
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: style,
        },
      );

      dispatch(notificationApi.util.invalidateTags(["Notification"]));
      dispatch(
        chatApi.util.invalidateTags([
          { type: "chatUnread", id: "TOTAL" },
          { type: "chatConversations", id: "LIST" },
        ]),
      );

      const event = new CustomEvent("notification-received", {
        detail: data,
      });
      window.dispatchEvent(event);
    };

    const handleUnreadCount = (_payload: any) => {
      // simplest: refetch notification queries that provide this tag
      dispatch(notificationApi.util.invalidateTags(["Notification"]));
    };

    const handleApplicationNotesChanged = (payload: any) => {
      const event = new CustomEvent("application-notes-changed", {
        detail: payload,
      });
      window.dispatchEvent(event);
    };

    const handleAnnouncementChanged = () => {
      dispatch(announcementsApi.util.invalidateTags(["announcements"]));
    };

    const handleConnectError = (error: Error) => {
      console.error("❌ Socket connection error:", error.message);
      isConnectingRef.current = false;
    };

    const handleDisconnect = (reason: string) => {
      joinedRef.current = false;
      isConnectingRef.current = false;

      if (reason === "io server disconnect") {
        socket.connect();
      }
    };

    const handleReconnect = () => {
      joinedRef.current = false;
    };

    socket.on("connect", handleConnect);
    socket.on("notification", handleNotification);
    socket.on("notification:unreadCount", handleUnreadCount);
    socket.on("application:notesChanged", handleApplicationNotesChanged);
    socket.on("announcement:changed", handleAnnouncementChanged);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);
    socket.on("reconnect", handleReconnect);

    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("notification", handleNotification);
      socket.off("notification:unreadCount", handleUnreadCount);
      socket.off("application:notesChanged", handleApplicationNotesChanged);
      socket.off("announcement:changed", handleAnnouncementChanged);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
      socket.off("reconnect", handleReconnect);

      joinedRef.current = false;
      isConnectingRef.current = false;
    };
  }, [user?.id, user?.role, token, dispatch]);

  return null;
};

export default SocketManager;
