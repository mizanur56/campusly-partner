import { useCallback, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { config } from "../config";
import type { ChatMessage } from "../redux/features/chat/chatApi";

export type ChatMessageEvent = {
  conversationId: string;
  message: ChatMessage;
};

export type ChatReadEvent = {
  conversationId: string;
  readerUserId: string;
};

export type ChatTypingEvent = {
  conversationId: string;
  userId: string;
  isTyping: boolean;
};

type UseChatSocketOptions = {
  enabled: boolean;
  token: string | null | undefined;
  userId: string | null | undefined;
  role: string | null | undefined;
  activeConversationId: string | null;
  onChatMessage?: (payload: ChatMessageEvent) => void;
  onChatRead?: (payload: ChatReadEvent) => void;
  onChatTyping?: (payload: ChatTypingEvent) => void;
  onConnected?: () => void;
};

function emitJoinRooms(
  socket: Socket,
  userId: string,
  role: string,
  conversationId: string | null,
) {
  socket.emit("join", { userId, role }, () => {});
  if (conversationId) {
    socket.emit("chat:join_conversation", { conversationId }, () => {});
  }
}

export function useChatSocket({
  enabled,
  token,
  userId,
  role,
  activeConversationId,
  onChatMessage,
  onChatRead,
  onChatTyping,
  onConnected,
}: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const activeRef = useRef(activeConversationId);
  activeRef.current = activeConversationId;

  const cbRef = useRef({
    onChatMessage,
    onChatRead,
    onChatTyping,
    onConnected,
  });
  cbRef.current = {
    onChatMessage,
    onChatRead,
    onChatTyping,
    onConnected,
  };

  useEffect(() => {
    if (!enabled || !token || !userId || !role) return;

    const socket = io(config.socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    const onConnect = () => {
      emitJoinRooms(socket, userId, role, activeRef.current);
      cbRef.current.onConnected?.();
    };

    socket.on("connect", onConnect);
    socket.on("reconnect", onConnect);

    socket.on(
      "chat:message",
      (payload: ChatMessageEvent & { message?: ChatMessage }) => {
        if (payload?.conversationId && payload?.message) {
          cbRef.current.onChatMessage?.({
            conversationId: payload.conversationId,
            message: payload.message,
          });
        }
      },
    );

    socket.on("chat:read", (payload: ChatReadEvent) => {
      if (payload?.conversationId) {
        cbRef.current.onChatRead?.(payload);
      }
    });

    socket.on("chat:typing", (payload: ChatTypingEvent) => {
      if (payload?.conversationId) {
        cbRef.current.onChatTyping?.(payload);
      }
    });

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("reconnect", onConnect);
      socket.removeAllListeners("chat:message");
      socket.removeAllListeners("chat:read");
      socket.removeAllListeners("chat:typing");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, token, userId, role]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket?.connected || !userId || !role) return;

    if (activeConversationId) {
      socket.emit("chat:join_conversation", { conversationId: activeConversationId }, () => {});
    }
  }, [activeConversationId, userId, role]);

  const emitTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      socketRef.current?.emit("chat:typing", { conversationId, isTyping });
    },
    [],
  );

  const emitLeaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("chat:leave_conversation", { conversationId });
  }, []);

  return { emitTyping, emitLeaveConversation };
}
