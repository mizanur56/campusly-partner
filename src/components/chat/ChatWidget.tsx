import { skipToken } from "@reduxjs/toolkit/query";
import { Alert, Empty, Spin } from "antd";
import { Lock, MessageCircle, Send, UserRound, X } from "lucide-react";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useChat } from "../../context/ChatContext";
import { useChatSocket } from "../../hooks/useChatSocket";
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
  useGetPartnerChatAdvisorQuery,
  useMarkChatConversationReadMutation,
  useSendChatMessageMutation,
  type ChatConversation,
  type ChatMessage,
  type ChatParticipant,
} from "../../redux/features/chat/chatApi";
import { cn } from "../../utils/cn";

const PARTNER_ROLE = "PARTNER";
const INBOX_PAGE_SIZE = 20;

function messageDisplayText(m: ChatMessage): string {
  const t = m.text?.trim();
  if (t) return m.text ?? "";
  if (typeof m.body === "string") return m.body;
  return "";
}

function preferRicherMessage(a: ChatMessage, b: ChatMessage): ChatMessage {
  const na = normalizeChatMessage(a);
  const nb = normalizeChatMessage(b);
  const la = messageDisplayText(na).length;
  const lb = messageDisplayText(nb).length;
  if (lb > la) return nb;
  if (la > lb) return na;
  return nb;
}

/** Peer is the administrator (not the partner). */
function peerParticipant(
  conv: ChatConversation | undefined,
  myUserId: string,
): ChatParticipant | null {
  if (!conv) return null;
  const staff = conv.staffUser;
  const other = conv.otherUser;
  if (staff?.id === myUserId) return other ?? null;
  if (other?.id === myUserId) return staff ?? null;
  if (staff?.role === "ADMIN" || staff?.role === "admin") return staff;
  if (other?.role === "ADMIN" || other?.role === "admin") return other;
  return staff ?? other ?? null;
}

function peerParticipantUserId(
  conv: ChatConversation | undefined,
  myUserId: string,
): string | null {
  const p = peerParticipant(conv, myUserId);
  const id = p?.id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

/** Thread with the assigned advisor (not another admin). */
function findConversationWithAdvisorPeer(
  list: ChatConversation[],
  myUserId: string,
  advisorUserId: string,
): ChatConversation | undefined {
  return list.find(
    (c) => peerParticipantUserId(c, myUserId) === advisorUserId,
  );
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

/** Local calendar day key for grouping thread messages. */
function getMessageDayKey(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Centered thread separator: Today / Yesterday / full date. */
function formatThreadDaySeparatorLabel(d: Date): string {
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const startOf = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const d0 = startOf(d);
  const n0 = startOf(now);
  const dayMs = 86400000;
  if (d0 === n0) return "Today";
  if (d0 === n0 - dayMs) return "Yesterday";
  const opts: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
  };
  if (d.getFullYear() !== now.getFullYear()) opts.year = "numeric";
  return d.toLocaleDateString(undefined, opts);
}

/** WhatsApp-style time inside bubble (e.g. 9:00PM). */
function formatBubbleTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const h24 = d.getHours();
  const min = d.getMinutes();
  const isAm = h24 < 12;
  const h12 = h24 % 12 || 12;
  const mm = String(min).padStart(2, "0");
  return `${h12}:${mm}${isAm ? "AM" : "PM"}`;
}

function chatErrorMessage(
  e: unknown,
  fallback: string,
): { status?: number; message: string } {
  const err = e as {
    status?: number;
    data?: { message?: string };
    message?: string;
  };
  const msg =
    (typeof err?.data?.message === "string" && err.data.message) ||
    (typeof err?.message === "string" && err.message) ||
    fallback;
  return { status: err?.status, message: msg };
}

/** WhatsApp-style first-row notice (pale yellow banner + lock). */
function ThreadIntroBanner({
  administratorName,
}: {
  administratorName: string;
}) {
  return (
    <div
      className="mb-3 rounded-[10px] border border-amber-200/65 bg-[#fff9c4] px-3 py-3.5 shadow-sm"
      role="note"
    >
      <p className="mx-auto max-w-[98%] text-center text-[12px] leading-relaxed text-amber-950/90">
        <Lock
          className="-mt-0.5 mr-1 inline-block h-3.5 w-3.5 align-middle text-amber-900/55"
          strokeWidth={2}
          aria-hidden
        />
        <span className="font-semibold text-amber-950">Secure chat.</span> Only
        you and your assigned advisor{" "}
        <span className="font-semibold text-amber-950">{administratorName}</span>{" "}
        can read this conversation. Keep personal details in this private chat.
      </p>
    </div>
  );
}

/** Shown when the partner has no assigned advisor (no POST /conversations). */
function NoAdvisorChatEmpty() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center bg-gradient-to-b from-slate-50/95 to-white px-6 py-10 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-800 shadow-sm ring-1 ring-amber-200/60">
        <UserRound className="h-8 w-8" strokeWidth={1.6} aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-gray-900">
        No advisor assigned yet
      </h3>
      <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-gray-600">
        When an advisor is assigned to your profile, you can message them here
        for help with applications, documents, and questions.
      </p>
      <p className="mt-4 text-xs text-gray-500">
        Check back after your account is linked to a counselor.
      </p>
    </div>
  );
}

/** Incoming-style typing row (no avatar; matches thread bubbles). */
function TypingIndicatorBubble({ peerName }: { peerName: string }) {
  return (
    <div
      className="mt-2 flex items-end justify-start"
      role="status"
      aria-live="polite"
      aria-relevant="additions"
    >
      <span className="sr-only">{`${peerName} is typing`}</span>
      <div className="flex min-h-[40px] max-w-[82%] items-center rounded-2xl rounded-bl-sm border border-gray-200/90 bg-white px-3 py-1.5 shadow-sm">
        <span className="flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "inline-block size-2 rounded-full bg-primary-500/65",
                "motion-reduce:opacity-70 motion-safe:animate-bounce",
              )}
              style={{
                animationDelay: `${i * 120}ms`,
                animationDuration: "0.55s",
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

export function ChatWidget() {
  const { isOpen, close, toggle } = useChat();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(useCurrentToken);
  const dispatch = useDispatch();

  const allowed = !!user && user.role === PARTNER_ROLE;

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [pendingConversationId, setPendingConversationId] = useState<
    string | null
  >(null);

  const {
    data: advisorPayload,
    isLoading: advisorLoading,
    isFetching: advisorFetching,
    isError: advisorError,
    error: advisorErr,
  } = useGetPartnerChatAdvisorQuery(undefined, { skip: !allowed });

  const advisorSettled = !advisorLoading && !advisorFetching;
  const assignedAdvisor = advisorPayload?.advisor ?? null;
  const advisorUserId = assignedAdvisor?.userId?.trim() || null;

  const {
    data: inboxFirstPage,
    isLoading: inboxLoading,
    isError: inboxError,
    error: inboxErr,
    isFetching: inboxFetching,
  } = useGetChatConversationsQuery(
    { page: 1, limit: INBOX_PAGE_SIZE },
    {
      skip:
        !allowed || !advisorSettled || !advisorUserId || !!advisorError,
    },
  );

  const { data: unreadFromApi = 0, refetch: refetchUnread } =
    useGetChatUnreadQuery(undefined, {
      skip: !allowed,
      pollingInterval: 0,
    });

  // Intentionally do not refetch unread on focus/visibility.
  // Unread should update via socket events only.

  const [createConversation, { isLoading: creating }] =
    useCreateOrGetChatConversationMutation();
  const [sendMessage, { isLoading: sending }] = useSendChatMessageMutation();
  const [markRead] = useMarkChatConversationReadMutation();

  const conversations = inboxFirstPage?.conversations ?? [];

  /** Fallback when /chat/unread shape differs — sum thread unread flags from inbox. */
  const unreadFromConversations = useMemo(
    () =>
      conversations.reduce(
        (sum, c) =>
          sum +
          (typeof c.unreadCount === "number" && !Number.isNaN(c.unreadCount)
            ? c.unreadCount
            : 0),
        0,
      ),
    [conversations],
  );

  const unreadTotal = Math.max(unreadFromApi, unreadFromConversations);

  const conversationWithAdvisor = useMemo(() => {
    if (!user?.id || !advisorUserId) return undefined;
    return findConversationWithAdvisorPeer(
      conversations,
      user.id,
      advisorUserId,
    );
  }, [conversations, user?.id, advisorUserId]);

  const conversationWithAdvisorId = conversationWithAdvisor?.id ?? null;

  useEffect(() => {
    if (
      pendingConversationId &&
      conversations.some((c) => c.id === pendingConversationId)
    ) {
      setPendingConversationId(null);
    }
  }, [conversations, pendingConversationId]);

  /** Keep selection pinned to the assigned advisor thread, not another admin. */
  useEffect(() => {
    if (!conversationWithAdvisorId || pendingConversationId) return;
    setSelectedConversationId((prev) =>
      prev === conversationWithAdvisorId ? prev : conversationWithAdvisorId,
    );
  }, [conversationWithAdvisorId, pendingConversationId]);

  const ensuredConversationRef = useRef(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const activeConversationId = useMemo(() => {
    if (pendingConversationId) return pendingConversationId;
    if (advisorUserId && user?.id) {
      if (conversationWithAdvisorId) return conversationWithAdvisorId;
      return null;
    }
    return selectedConversationId ?? conversations[0]?.id ?? null;
  }, [
    pendingConversationId,
    advisorUserId,
    user?.id,
    conversationWithAdvisorId,
    selectedConversationId,
    conversations,
  ]);

  const messagesQueryArgs =
    allowed && activeConversationId
      ? { conversationId: activeConversationId, page: 1, limit: 80 }
      : skipToken;

  const {
    data: initialMessages = [],
    isLoading: msgLoading,
    isError: msgError,
    error: msgErr,
  } = useGetChatMessagesQuery(messagesQueryArgs, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 0,
  });

  const [extraMessages, setExtraMessages] = useState<ChatMessage[]>([]);
  const [composerText, setComposerText] = useState("");
  /** Peer typing per conversation (socket `chat:typing`, excludes self). */
  const [peerTypingByConversationId, setPeerTypingByConversationId] = useState<
    Record<string, boolean>
  >({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(0);
  const typingFallbackClearRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  const invalidateChatLists = useCallback(() => {
    dispatch(
      chatApi.util.invalidateTags([
        { type: "chatUnread", id: "TOTAL" },
        { type: "chatConversations", id: "LIST" },
      ]),
    );
  }, [dispatch]);

  useEffect(() => {
    if (!allowed || !advisorSettled || advisorError) return;
    if (!advisorUserId || !user?.id) {
      ensuredConversationRef.current = false;
      return;
    }
    if (inboxLoading || inboxFetching || inboxError) return;
    if (conversationWithAdvisorId) {
      ensuredConversationRef.current = false;
      return;
    }
    if (ensuredConversationRef.current) return;
    ensuredConversationRef.current = true;
    setBootstrapError(null);
    createConversation({ otherUserId: advisorUserId })
      .unwrap()
      .then((c) => {
        if (c?.id) {
          setPendingConversationId(c.id);
          setSelectedConversationId(c.id);
        }
        invalidateChatLists();
      })
      .catch((e: unknown) => {
        ensuredConversationRef.current = false;
        const status = (e as { status?: number })?.status;
        const { message } = chatErrorMessage(e, "");
        if (status === 400) {
          setBootstrapError(
            "You have no assigned advisor yet. Chat will be available once an advisor is assigned.",
          );
        } else if (status === 403) {
          setBootstrapError("You can only chat with your assigned advisor.");
        } else if (status === 401) {
          setBootstrapError("Please sign in again.");
        } else {
          setBootstrapError(message || "Could not open chat. Try again later.");
        }
      });
  }, [
    allowed,
    advisorSettled,
    advisorError,
    advisorUserId,
    user?.id,
    inboxLoading,
    inboxFetching,
    inboxError,
    conversationWithAdvisorId,
    createConversation,
    invalidateChatLists,
  ]);

  useEffect(() => {
    setExtraMessages([]);
    setComposerText("");
  }, [activeConversationId]);

  useEffect(() => {
    return () => {
      for (const t of Object.values(typingFallbackClearRef.current)) {
        clearTimeout(t);
      }
      typingFallbackClearRef.current = {};
    };
  }, []);

  const typingPeer = useMemo(
    () =>
      !!(
        activeConversationId &&
        peerTypingByConversationId[activeConversationId]
      ),
    [activeConversationId, peerTypingByConversationId],
  );

  const clearPeerTypingForConversation = useCallback((conversationId: string) => {
    const t = typingFallbackClearRef.current[conversationId];
    if (t) {
      clearTimeout(t);
      delete typingFallbackClearRef.current[conversationId];
    }
    setPeerTypingByConversationId((prev) => {
      if (!prev[conversationId]) return prev;
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
  }, []);

  const activeConversationIdRef = useRef<string | null>(null);
  activeConversationIdRef.current = activeConversationId;

  const onSocketMessage = useCallback(
    (payload: { conversationId: string; message: ChatMessage }) => {
      const { conversationId, message } = payload;
      if (!message || typeof message !== "object") return;
      clearPeerTypingForConversation(conversationId);
      const normRaw = normalizeChatMessage(message);
      const norm: ChatMessage = normRaw.id
        ? normRaw
        : {
            ...normRaw,
            id: `rt-${conversationId}-${Date.now()}-${
              globalThis.crypto?.randomUUID?.() ??
              `${Math.random()}`.slice(2)
            }`,
          };
      const convActive = activeConversationIdRef.current;
      if (conversationId === convActive) {
        setExtraMessages((prev) => {
          const i = prev.findIndex((m) => m.id === norm.id);
          if (i === -1) return [...prev, norm];
          return prev.map((m, idx) =>
            idx === i ? preferRicherMessage(m, norm) : m,
          );
        });
      }
      invalidateChatLists();
      if (document.visibilityState === "visible") void refetchUnread();
    },
    [invalidateChatLists, clearPeerTypingForConversation, refetchUnread],
  );

  const onSocketRead = useCallback(() => {
    invalidateChatLists();
  }, [invalidateChatLists]);

  const onSocketTyping = useCallback(
    (payload: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (!user?.id) return;
      if (payload.userId === user.id) return;
      const conversationId = payload.conversationId;
      if (!conversationId) return;

      if (payload.isTyping) {
        const prevT = typingFallbackClearRef.current[conversationId];
        if (prevT) clearTimeout(prevT);
        typingFallbackClearRef.current[conversationId] = setTimeout(() => {
          clearPeerTypingForConversation(conversationId);
        }, 4500);

        setPeerTypingByConversationId((prev) => ({
          ...prev,
          [conversationId]: true,
        }));
      } else {
        clearPeerTypingForConversation(conversationId);
      }
    },
    [user?.id, clearPeerTypingForConversation],
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

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId],
  );

  /** Advisor name from GET /chat/partner/advisor — avoid showing another admin from an old thread. */
  const peerName = useMemo(() => {
    const fromApi = (
      assignedAdvisor?.name ||
      assignedAdvisor?.email ||
      ""
    ).trim();
    if (fromApi) return fromApi;
    if (!user?.id) return "Your advisor";
    const p = peerParticipant(activeConversation, user.id);
    return (p?.name || p?.email || "Your advisor").trim() || "Your advisor";
  }, [assignedAdvisor, activeConversation, user?.id]);

  const mergedMessages = useMemo(
    () => mergeMessagesUnique(initialMessages, extraMessages),
    [initialMessages, extraMessages],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mergedMessages.length, typingPeer, isOpen]);

  useEffect(() => {
    if (!isOpen || !activeConversationId || !allowed) return;
    const unread = activeConversation?.unreadCount ?? 0;
    if (unread <= 0) return;
    if (document.visibilityState !== "visible") return;
    void markRead({ conversationId: activeConversationId });
  }, [isOpen, activeConversationId, allowed, activeConversation?.unreadCount, markRead]);

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
    } catch (e) {
      setComposerText(text);
      const { status, message } = chatErrorMessage(e, "Message not sent.");
      if (status === 401) toast.error("Please sign in again.");
      else if (status === 403)
        toast.error("You can only chat with your assigned advisor.");
      else toast.error(message);
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

  const inboxErrMsg =
    inboxErr && typeof inboxErr === "object" && "data" in inboxErr
      ? String((inboxErr as { data?: { message?: string } }).data?.message ?? "")
      : "";
  const msgErrMsg =
    msgErr && typeof msgErr === "object" && "data" in msgErr
      ? String((msgErr as { data?: { message?: string } }).data?.message ?? "")
      : "";
  const advisorErrStatus =
    advisorErr && typeof advisorErr === "object" && "status" in advisorErr
      ? (advisorErr as { status?: number }).status
      : undefined;
  const advisorNotFound = advisorErrStatus === 404;
  const advisorErrMsg =
    advisorErr && typeof advisorErr === "object" && "data" in advisorErr
      ? String((advisorErr as { data?: { message?: string } }).data?.message ?? "")
      : "";

  const headerTitle = advisorUserId ? peerName : "Chat";

  const showChatComposer =
    !!activeConversationId &&
    !!advisorUserId &&
    !advisorError &&
    !bootstrapError;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[300] flex flex-col items-end gap-3 md:bottom-6 md:right-6"
      aria-live="polite"
    >
      {isOpen ? (
        <div
          className="pointer-events-auto flex max-h-[min(600px,74vh)] w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl"
          role="dialog"
          aria-label="Chat with your assigned advisor"
        >
          <div className="flex shrink-0 items-center gap-2 px-3 py-3 text-white bg-primary-800">
            <div className="min-w-0 flex-1 pl-1">
              <p className="truncate text-sm font-semibold leading-tight">
                {headerTitle}
              </p>
              {advisorUserId ? (
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Your assigned advisor
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              {!advisorSettled ? (
                <div className="flex justify-center py-16">
                  <Spin />
                </div>
              ) : advisorError && !advisorNotFound ? (
                <Alert
                  type="error"
                  message={
                    advisorErrMsg || "Could not load your advisor. Try again."
                  }
                />
              ) : advisorNotFound || !advisorUserId ? (
                <NoAdvisorChatEmpty />
              ) : bootstrapError ? (
                <Alert type="error" message={bootstrapError} />
              ) : inboxError && !activeConversationId ? (
                <Alert
                  type="error"
                  message={inboxErrMsg || "Could not load conversations"}
                />
              ) : !activeConversationId && (inboxLoading || creating) ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <Spin />
                  <p className="text-center text-xs text-gray-500">
                    Opening chat with your advisor…
                  </p>
                </div>
              ) : !activeConversationId ? (
                <div className="flex justify-center py-16">
                  <Spin />
                </div>
              ) : (
                <>
                  <ThreadIntroBanner administratorName={peerName} />
                  {msgLoading ? (
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
                    <ul className="flex list-none flex-col gap-1.5 p-0">
                    {mergedMessages.map((m, index) => {
                      const mine =
                        m.senderUserId === user!.id || m.sender?.id === user!.id;
                      const dayKey = getMessageDayKey(m.createdAt);
                      const prevKey =
                        index > 0
                          ? getMessageDayKey(
                              mergedMessages[index - 1]?.createdAt,
                            )
                          : null;
                      const showDaySeparator =
                        !!dayKey &&
                        (prevKey === null || dayKey !== prevKey);
                      const bubbleTime = formatBubbleTime(m.createdAt);
                      return (
                        <Fragment key={m.id}>
                          {showDaySeparator && m.createdAt ? (
                            <li className="flex justify-center py-2">
                              <span className="rounded-lg bg-gray-200/90 px-3 py-1 text-center text-[11px] font-semibold text-gray-600 shadow-sm">
                                {formatThreadDaySeparatorLabel(
                                  new Date(m.createdAt),
                                )}
                              </span>
                            </li>
                          ) : null}
                          <li>
                            <div
                              className={cn(
                                "flex items-end",
                                mine ? "justify-end" : "justify-start",
                              )}
                            >
                              <div
                                className={cn(
                                  "flex max-w-[82%] flex-col rounded-2xl px-2.5 pt-2 pb-1.5 text-sm shadow-sm",
                                  mine
                                    ? "rounded-br-sm bg-primary text-white"
                                    : "rounded-bl-sm border border-gray-200 bg-white text-primary-900",
                                )}
                              >
                                <p className="whitespace-pre-wrap break-words px-0.5 leading-relaxed">
                                  {messageDisplayText(m)}
                                </p>
                                {bubbleTime ? (
                                  <div className="mt-1 flex justify-end">
                                    <time
                                      className={cn(
                                        "text-[10px] font-medium tabular-nums tracking-tight",
                                        mine
                                          ? "text-white/70"
                                          : "text-gray-400",
                                      )}
                                      dateTime={
                                        m.createdAt
                                          ? new Date(m.createdAt).toISOString()
                                          : undefined
                                      }
                                    >
                                      {bubbleTime}
                                    </time>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </li>
                        </Fragment>
                      );
                    })}
                      </ul>
                    )}
                    {typingPeer ? (
                      <TypingIndicatorBubble peerName={peerName} />
                    ) : null}
                    <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {showChatComposer ? (
              <div className="flex shrink-0 items-center gap-2 px-3 py-3 bg-primary-800">
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
                  placeholder="Write a message…"
                  disabled={
                    sending || msgLoading || !activeConversationId || creating
                  }
                  className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-200/50 focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={
                    sending ||
                    msgLoading ||
                    !composerText.trim() ||
                    !activeConversationId ||
                    creating
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white text-primary transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-white/10 disabled:text-primary-200"
                  aria-label="Send"
                >
                  {sending ? <Spin size="small" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
            ) : null}
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
          <span
            className="absolute -right-0.5 -top-0.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white"
            aria-hidden
          >
            {unreadTotal > 99 ? "99+" : unreadTotal}
          </span>
        ) : null}
      </button>
    </div>
  );
}
