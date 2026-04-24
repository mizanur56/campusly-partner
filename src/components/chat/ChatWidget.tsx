import { Alert, Empty, Spin } from "antd";
import { MessageCircle, MoreVertical, Send, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useChat } from "../../context/ChatContext";
import { useChatSocket } from "../../hooks/useChatSocket";
import { resolveStaffUserIdForChat } from "../../lib/resolveStaffUserIdForChat";
import {
  selectCurrentUser,
  useCurrentToken,
} from "../../redux/features/auth/authSlice";
import {
  chatApi,
  normalizeChatMessage,
  useCreateOrGetChatConversationMutation,
  useGetChatConversationsQuery,
  useGetChatMessagesQuery,
  useGetChatUnreadQuery,
  useMarkChatConversationReadMutation,
  useSendChatMessageMutation,
  type ChatConversation,
  type ChatMessage,
  type ChatParticipant
} from "../../redux/features/chat/chatApi";
import {
  useGetPartnerDashboardQuery,
  useGetPartnerProfileQuery,
} from "../../redux/features/profile/partnerProfileApi";
import { cn } from "../../utils/utils";

const CHAT_ROLES = new Set(["PARTNER", "PARTNER_TEAM_MEMBER"]);

function messageDisplayText(m: ChatMessage): string {
  const t = m.text?.trim();
  if (t) return m.text ?? "";
  if (typeof m.body === "string") return m.body;
  return "";
}

/** Prefer the copy with real text (socket echo often has `body` only; race: echo before REST). */
function preferRicherMessage(a: ChatMessage, b: ChatMessage): ChatMessage {
  const na = normalizeChatMessage(a);
  const nb = normalizeChatMessage(b);
  const la = messageDisplayText(na).length;
  const lb = messageDisplayText(nb).length;
  if (lb > la) return nb;
  if (la > lb) return na;
  return nb;
}

function peerStaffParticipant(
  conv: ChatConversation | undefined,
  myUserId: string,
): ChatParticipant | null {
  if (!conv) return null;
  const staff = conv.staffUser;
  const other = conv.otherUser;
  if (staff?.id === myUserId) return other ?? null;
  if (other?.id === myUserId) return staff ?? null;
  return staff ?? other ?? null;
}

function sortMessagesChronological(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort((a, b) => {
    const ta = new Date(a.createdAt ?? 0).getTime();
    const tb = new Date(b.createdAt ?? 0).getTime();
    if (ta !== tb) return ta - tb;
    return (a.id || "").localeCompare(b.id || "");
  });
}

function mergeMessagesUnique(
  base: ChatMessage[],
  extras: ChatMessage[],
): ChatMessage[] {
  const map = new Map<string, ChatMessage>();
  const put = (m: ChatMessage) => {
    if (!m.id) return;
    const norm = normalizeChatMessage(m);
    const cur = map.get(norm.id);
    map.set(norm.id, cur ? preferRicherMessage(cur, norm) : norm);
  };
  for (const m of base) put(m);
  for (const m of extras) put(m);
  return sortMessagesChronological([...map.values()]);
}

function initialsFromName(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
  }
  return t.slice(0, 2).toUpperCase();
}

export function ChatWidget() {
  const { isOpen, close, toggle } = useChat();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(useCurrentToken);
  const dispatch = useDispatch();

  const allowed = !!user && CHAT_ROLES.has(user.role);

  const { data: profile } = useGetPartnerProfileQuery(undefined, {
    skip: !allowed,
  });
  const { data: dashboard } = useGetPartnerDashboardQuery(undefined, {
    skip: !allowed,
  });

  const staffUserId = useMemo(
    () => resolveStaffUserIdForChat(profile, dashboard),
    [profile, dashboard],
  );

  const {
    data: conversations = [],
    isLoading: convLoading,
    isError: convError,
    error: convErr,
  } = useGetChatConversationsQuery(undefined, { skip: !allowed });

  const { data: unreadTotal = 0 } = useGetChatUnreadQuery(undefined, {
    skip: !allowed,
    pollingInterval: 60_000,
  });

  const [createConversation, { isLoading: creating }] =
    useCreateOrGetChatConversationMutation();
  const [sendMessage, { isLoading: sending }] = useSendChatMessageMutation();
  const [markRead] = useMarkChatConversationReadMutation();

  const [pendingConversationId, setPendingConversationId] = useState<
    string | null
  >(null);

  const activeConversationId = useMemo(() => {
    if (pendingConversationId) return pendingConversationId;
    if (!user?.id || !conversations.length) return null;
    const sorted = [...conversations].sort(
      (a, b) =>
        new Date(b.lastMessageAt ?? 0).getTime() -
        new Date(a.lastMessageAt ?? 0).getTime(),
    );
    return sorted[0]?.id ?? null;
  }, [conversations, user?.id, pendingConversationId]);

  useEffect(() => {
    if (
      pendingConversationId &&
      conversations.some((c) => c.id === pendingConversationId)
    ) {
      setPendingConversationId(null);
    }
  }, [conversations, pendingConversationId]);

  const {
    data: initialMessages = [],
    isLoading: msgLoading,
    isError: msgError,
    error: msgErr,
  } = useGetChatMessagesQuery(
    { conversationId: activeConversationId!, page: 1, limit: 80 },
    { skip: !allowed || !activeConversationId },
  );

  const [extraMessages, setExtraMessages] = useState<ChatMessage[]>([]);
  const [composerText, setComposerText] = useState("");
  const [typingPeer, setTypingPeer] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const ensuredEmptyRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(0);

  const invalidateChatLists = useCallback(() => {
    dispatch(
      chatApi.util.invalidateTags([
        { type: "chatUnread", id: "TOTAL" },
        { type: "chatConversations", id: "LIST" },
      ]),
    );
  }, [dispatch]);

  useEffect(() => {
    setExtraMessages([]);
    setComposerText("");
    setTypingPeer(false);
  }, [activeConversationId]);

  const onSocketMessage = useCallback(
    (payload: { conversationId: string; message: ChatMessage }) => {
      const { conversationId, message } = payload;
      if (!message?.id) return;
      const norm = normalizeChatMessage(message);
      if (conversationId === activeConversationId) {
        setExtraMessages((prev) => {
          const i = prev.findIndex((m) => m.id === norm.id);
          if (i === -1) return [...prev, norm];
          return prev.map((m, idx) =>
            idx === i ? preferRicherMessage(m, norm) : m,
          );
        });
      }
      invalidateChatLists();
    },
    [activeConversationId, invalidateChatLists],
  );

  const onSocketRead = useCallback(() => {
    invalidateChatLists();
  }, [invalidateChatLists]);

  const onSocketTyping = useCallback(
    (payload: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (payload.conversationId !== activeConversationId) return;
      if (!user?.id) return;
      if (payload.userId === user.id) return;
      setTypingPeer(!!payload.isTyping);
    },
    [activeConversationId, user?.id],
  );

  const { emitTyping, emitLeaveConversation } = useChatSocket({
    enabled: !!allowed && !!token,
    token,
    userId: user?.id,
    role: user?.role,
    activeConversationId,
    onChatMessage: onSocketMessage,
    onChatRead: onSocketRead,
    onChatTyping: onSocketTyping,
    onConnected: invalidateChatLists,
  });

  useEffect(() => {
    return () => {
      if (activeConversationId) {
        emitLeaveConversation(activeConversationId);
      }
    };
  }, [activeConversationId, emitLeaveConversation]);

  useEffect(() => {
    if (!allowed || !staffUserId || convLoading || convError) return;
    if (conversations.length > 0) {
      ensuredEmptyRef.current = false;
      return;
    }
    if (ensuredEmptyRef.current) return;
    ensuredEmptyRef.current = true;
    createConversation({ otherUserId: staffUserId })
      .unwrap()
      .then((c) => {
        if (c?.id) setPendingConversationId(c.id);
        invalidateChatLists();
      })
      .catch((e: { status?: number; data?: { message?: string } }) => {
        ensuredEmptyRef.current = false;
        const msg =
          (typeof e?.data?.message === "string" && e.data.message) ||
          (e?.status === 403
            ? "You do not have permission to use chat."
            : e?.status === 401
              ? "Please sign in again."
              : "Could not start a conversation. Try again later.");
        setBootstrapError(msg);
      });
  }, [
    allowed,
    staffUserId,
    convLoading,
    convError,
    conversations.length,
    createConversation,
    invalidateChatLists,
  ]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId],
  );

  const peerName = useMemo(() => {
    if (!user?.id) return "Campus Transfer";
    const p = peerStaffParticipant(activeConversation, user.id);
    return p?.name || p?.email || profile?.advisor?.name || "Advisor";
  }, [activeConversation, user?.id, profile?.advisor?.name]);

  const mergedMessages = useMemo(
    () => mergeMessagesUnique(initialMessages, extraMessages),
    [initialMessages, extraMessages],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mergedMessages.length, typingPeer, isOpen]);

  useEffect(() => {
    if (!isOpen || !activeConversationId || !allowed) return;
    const run = () => {
      if (document.visibilityState === "visible") {
        markRead({ conversationId: activeConversationId });
      }
    };
    run();
    document.addEventListener("visibilitychange", run);
    window.addEventListener("focus", run);
    return () => {
      document.removeEventListener("visibilitychange", run);
      window.removeEventListener("focus", run);
    };
  }, [isOpen, activeConversationId, allowed, markRead]);

  const handleSend = async () => {
    const text = composerText.trim();
    if (!text || !activeConversationId) return;
    setComposerText("");
    emitTyping(activeConversationId, false);
    try {
      const sent = await sendMessage({
        conversationId: activeConversationId,
        text,
      }).unwrap();
      if (sent?.id) {
        const norm = normalizeChatMessage(sent);
        setExtraMessages((prev) => {
          const i = prev.findIndex((m) => m.id === norm.id);
          if (i === -1) return [...prev, norm];
          return prev.map((m, idx) =>
            idx === i ? preferRicherMessage(m, norm) : m,
          );
        });
      }
      invalidateChatLists();
    } catch {
      setComposerText(text);
    }
  };

  const onComposerChange = (v: string) => {
    setComposerText(v);
    if (!activeConversationId) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current > 800) {
      emitTyping(activeConversationId, true);
      lastTypingSentRef.current = now;
    }
    if (typingStopRef.current) clearTimeout(typingStopRef.current);
    typingStopRef.current = setTimeout(() => {
      emitTyping(activeConversationId, false);
      typingStopRef.current = null;
    }, 1200);
  };

  if (!allowed) return null;

  const convErrMsg =
    convErr && typeof convErr === "object" && "data" in convErr
      ? String((convErr as { data?: { message?: string } }).data?.message ?? "")
      : "";
  const msgErrMsg =
    msgErr && typeof msgErr === "object" && "data" in msgErr
      ? String((msgErr as { data?: { message?: string } }).data?.message ?? "")
      : "";

  const partnerInitials = initialsFromName(user?.name ?? "You");
  const staffInitials = initialsFromName(peerName);

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[300] flex flex-col items-end gap-3 md:bottom-6 md:right-6"
      aria-live="polite"
    >
      {isOpen ? (
        <div
          className="pointer-events-auto flex max-h-[min(560px,72vh)] w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl"
          role="dialog"
          aria-label="Chat with Campus Transfer staff"
        >
          {/* Header */}
          <div
            className="flex shrink-0 items-center gap-3 px-3 py-3 text-white bg-primary-800"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold bg-primary"
              
            >
              {staffInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">
                {peerName}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Online
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
              aria-label="More options"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={close}
              className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            {bootstrapError ? (
              <Alert type="error" message={bootstrapError} className="mb-2" />
            ) : null}
            {!staffUserId && !convLoading ? (
              <Alert
                type="warning"
                message="No advisor assigned yet"
                className="mb-2 text-xs"
              />
            ) : null}

            {convLoading || creating ? (
              <div className="flex justify-center py-12">
                <Spin />
              </div>
            ) : convError ? (
              <Alert type="error" message={convErrMsg || "Could not load chat"} />
            ) : !activeConversationId ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Connecting to your advisor…"
              />
            ) : msgLoading ? (
              <div className="flex justify-center py-12">
                <Spin />
              </div>
            ) : msgError ? (
              <Alert type="error" message={msgErrMsg} />
            ) : mergedMessages.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No messages yet. Say hello!"
              />
            ) : (
              <ul className="flex flex-col gap-4">
                {mergedMessages.map((m) => {
                  const mine =
                    m.senderUserId === user.id || m.sender?.id === user.id;
                  const ts = m.createdAt
                    ? new Date(m.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "";
                  return (
                    <li key={m.id}>
                      <p className="mb-1 text-center text-[11px] text-gray-400">
                        {ts}
                      </p>
                      <div
                        className={cn(
                          "flex items-end gap-2",
                          mine ? "justify-end" : "justify-start",
                        )}
                      >
                        {!mine ? (
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white bg-primary"
                          >
                            {staffInitials}
                          </div>
                        ) : null}
                        <div
                          className={cn(
                            "max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                            mine
                              ? "rounded-br-sm bg-primary text-white"
                              : "rounded-bl-sm border border-gray-200 bg-white text-primary-900",
                          )}
                          
                        >
                          <p className="whitespace-pre-wrap break-words leading-relaxed">
                            {messageDisplayText(m)}
                          </p>
                        </div>
                        {mine ? (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-500">
                            {partnerInitials}
                          </div>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {typingPeer ? (
              <p className="mt-3 text-center text-xs italic text-gray-500">
                {peerName} is typing…
              </p>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div
            className="flex shrink-0 items-center gap-2 px-3 py-3 bg-primary-800"
          >
            <input
              type="text"
              value={composerText}
              onChange={(e) => onComposerChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder="Want to know something…"
              disabled={sending || msgLoading || !activeConversationId}
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-200/50 focus:border-white/30"
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={
                sending || msgLoading || !composerText.trim() || !activeConversationId
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary transition hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-primary-200 border border-white/15"
              aria-label="Send"
            >
              {sending ? <Spin size="small" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={toggle}
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition hover:bg-primary-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/50"
        aria-label={isOpen ? "Close chat" : "Open messages"}
        aria-expanded={isOpen}
      >
        <MessageCircle className="h-7 w-7" strokeWidth={2} />
        {!isOpen && unreadTotal > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadTotal > 99 ? "99+" : unreadTotal}
          </span>
        ) : null}
      </button>
    </div>
  );
}
