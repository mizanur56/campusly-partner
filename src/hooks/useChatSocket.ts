import { useCallback, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "../services/socket";
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

/**
 * Support flat, nested `data` / `payload`, or "payload is the message row" shapes
 * (common across NestJS gateways and Socket.IO wrappers).
 */
function parseChatMessagePayload(raw: unknown): ChatMessageEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;

  let conversationId: unknown = p.conversationId;
  let message: unknown = p.message;

  const payload = p.payload;
  if (payload && typeof payload === "object") {
    const pl = payload as Record<string, unknown>;
    conversationId = conversationId ?? pl.conversationId;
    message = message ?? pl.message;
    if (
      !message &&
      (typeof pl.text === "string" ||
        typeof pl.body === "string" ||
        typeof pl.content === "string")
    ) {
      message = pl;
    }
  }

  const nested = p.data;
  if (nested && typeof nested === "object") {
    const d = nested as Record<string, unknown>;
    conversationId = conversationId ?? d.conversationId;
    message = message ?? d.message;
    if (
      !message &&
      (typeof d.text === "string" ||
        typeof d.body === "string" ||
        typeof d.content === "string")
    ) {
      message = d;
    }
  }

  if (!message || typeof message !== "object") {
    const hasText =
      typeof p.text === "string" ||
      typeof p.body === "string" ||
      typeof p.content === "string";
    const hasSender =
      typeof p.senderUserId === "string" ||
      typeof p.senderId === "string" ||
      !!(p.sender && typeof p.sender === "object");
    if (hasText && hasSender) {
      message = p;
      conversationId = conversationId ?? p.conversationId;
    }
  }

  const convObj = p.conversation;
  if (typeof conversationId !== "string" && convObj && typeof convObj === "object") {
    const c = convObj as Record<string, unknown>;
    if (typeof c.id === "string") conversationId = c.id;
  }

  if (typeof conversationId !== "string" || !conversationId.trim()) return null;
  if (!message || typeof message !== "object") return null;

  return {
    conversationId: conversationId.trim(),
    message: message as ChatMessage,
  };
}

/** Server may emit under different event names; handle all without double-processing duplicate ids in UI. */
const CHAT_MESSAGE_SOCKET_EVENTS = [
  "chat:message",
  "message",
  "newMessage",
  "new_message",
  "chat_new_message",
  "ChatMessage",
] as const;

function parseChatReadPayload(raw: unknown): ChatReadEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  let conversationId: unknown = p.conversationId;
  let readerUserId: unknown = p.readerUserId;
  const nested = p.data;
  if (nested && typeof nested === "object") {
    const d = nested as Record<string, unknown>;
    conversationId = conversationId ?? d.conversationId;
    readerUserId = readerUserId ?? d.readerUserId;
  }
  if (typeof conversationId !== "string" || typeof readerUserId !== "string")
    return null;
  return { conversationId, readerUserId };
}

function parseChatTypingPayload(raw: unknown): ChatTypingEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  let conversationId: unknown = p.conversationId;
  let userId: unknown = p.userId;
  let isTyping: unknown = p.isTyping;
  const nested = p.data;
  if (nested && typeof nested === "object") {
    const d = nested as Record<string, unknown>;
    conversationId = conversationId ?? d.conversationId;
    userId = userId ?? d.userId;
    isTyping = isTyping ?? d.isTyping;
  }
  if (typeof conversationId !== "string" || typeof userId !== "string")
    return null;
  if (typeof isTyping !== "boolean") return null;
  return { conversationId, userId, isTyping };
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

    const socket = getSocket(token);

    const handleChatMessage = (raw: unknown) => {
      const parsed = parseChatMessagePayload(raw);
      if (parsed) cbRef.current.onChatMessage?.(parsed);
    };

    const handleChatRead = (raw: unknown) => {
      const parsed = parseChatReadPayload(raw);
      if (parsed) cbRef.current.onChatRead?.(parsed);
    };

    const handleChatTyping = (raw: unknown) => {
      const parsed = parseChatTypingPayload(raw);
      if (parsed) cbRef.current.onChatTyping?.(parsed);
    };

    const onReconnectChat = () => {
      emitJoinRooms(socket, userId, role, activeRef.current);
      cbRef.current.onConnected?.();
    };

    for (const ev of CHAT_MESSAGE_SOCKET_EVENTS) {
      socket.on(ev, handleChatMessage);
    }
    socket.on("chat:read", handleChatRead);
    socket.on("chat:typing", handleChatTyping);
    socket.on("connect", onReconnectChat);
    socket.on("reconnect", onReconnectChat);

    if (socket.connected) {
      emitJoinRooms(socket, userId, role, activeRef.current);
    }

    return () => {
      for (const ev of CHAT_MESSAGE_SOCKET_EVENTS) {
        socket.off(ev, handleChatMessage);
      }
      socket.off("chat:read", handleChatRead);
      socket.off("chat:typing", handleChatTyping);
      socket.off("connect", onReconnectChat);
      socket.off("reconnect", onReconnectChat);
    };
  }, [enabled, token, userId, role]);

  /** Re-join conversation room (with retries) so we do not miss emits if join races with connect. */
  useEffect(() => {
    if (!enabled || !token || !userId || !role || !activeConversationId) return;
    const socket = getSocket(token);
    const cid = activeConversationId;

    const joinConv = () => {
      socket.emit("chat:join_conversation", { conversationId: cid }, () => {});
    };

    const timers: ReturnType<typeof setTimeout>[] = [];

    const scheduleJoins = () => {
      for (const t of timers) clearTimeout(t);
      timers.length = 0;
      if (!socket.connected) return;
      joinConv();
      timers.push(setTimeout(joinConv, 400));
      timers.push(setTimeout(joinConv, 1600));
    };

    scheduleJoins();
    const onConnectJoin = () => scheduleJoins();
    socket.on("connect", onConnectJoin);

    return () => {
      for (const t of timers) clearTimeout(t);
      socket.off("connect", onConnectJoin);
    };
  }, [enabled, token, userId, role, activeConversationId]);

  const emitTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      if (!token) return;
      getSocket(token).emit("chat:typing", { conversationId, isTyping });
    },
    [token],
  );

  const emitLeaveConversation = useCallback(
    (conversationId: string) => {
      if (!token) return;
      getSocket(token).emit("chat:leave_conversation", { conversationId });
    },
    [token],
  );

  return { emitTyping, emitLeaveConversation };
}
