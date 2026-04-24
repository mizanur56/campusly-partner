import { baseApi } from "../../api/baseApi";

export interface ChatParticipant {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  profileUrl?: string | null;
  [key: string]: unknown;
}

export interface ChatConversation {
  id: string;
  lastMessageAt?: string | null;
  lastMessagePreview?: string | null;
  staffUser?: ChatParticipant | null;
  otherUser?: ChatParticipant | null;
  unreadCount?: number;
  [key: string]: unknown;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  text?: string;
  body?: string;
  senderUserId?: string;
  senderId?: string;
  createdAt?: string;
  updatedAt?: string;
  sender?: ChatParticipant | null;
  [key: string]: unknown;
}

export type ChatListMeta = {
  total?: number;
  page?: number;
  limit?: number;
};

export type ChatConversationsResult = {
  conversations: ChatConversation[];
  meta: ChatListMeta;
};

function unwrapData<T>(response: unknown): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

function normalizeParticipant(raw: unknown): ChatParticipant | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = String(o.id ?? o.userId ?? "");
  if (!id) return null;
  return { ...(o as ChatParticipant), id };
}

function normalizeConversation(raw: unknown): ChatConversation {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  return {
    ...o,
    id: String(o.id ?? ""),
    staffUser: normalizeParticipant(o.staffUser),
    otherUser: normalizeParticipant(o.otherUser),
    lastMessageAt: (o.lastMessageAt as string) ?? null,
    lastMessagePreview: (o.lastMessagePreview as string) ?? null,
    unreadCount: typeof o.unreadCount === "number" ? o.unreadCount : 0,
  };
}

/** Unify API `body` / `text` / socket payloads for UI + dedupe */
export function normalizeChatMessage(raw: unknown): ChatMessage {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const fromBody = o.body;
  const fromText = o.text;
  const text =
    (typeof fromText === "string" ? fromText : "") ||
    (typeof fromBody === "string" ? fromBody : "") ||
    "";
  let senderUserId =
    (typeof o.senderUserId === "string" ? o.senderUserId : null) ??
    (typeof o.senderId === "string" ? o.senderId : undefined);
  if (!senderUserId && o.sender && typeof o.sender === "object") {
    const s = o.sender as Record<string, unknown>;
    if (typeof s.id === "string") senderUserId = s.id;
    else if (typeof s.userId === "string") senderUserId = s.userId;
  }
  return {
    ...o,
    id: String(o.id ?? o._id ?? ""),
    text,
    body: typeof fromBody === "string" ? fromBody : undefined,
    senderUserId,
    sender: (o.sender as ChatParticipant) ?? null,
    createdAt: typeof o.createdAt === "string" ? o.createdAt : undefined,
  };
}

function normalizeMessage(raw: unknown): ChatMessage {
  return normalizeChatMessage(raw);
}

function parseMeta(raw: unknown): ChatListMeta {
  if (!raw || typeof raw !== "object") return {};
  const m = raw as Record<string, unknown>;
  return {
    total: typeof m.total === "number" ? m.total : undefined,
    page: typeof m.page === "number" ? m.page : undefined,
    limit: typeof m.limit === "number" ? m.limit : undefined,
  };
}

/**
 * Handles `{ data: T[], meta }`, `{ data: { data/items, meta } }`, or plain arrays.
 */
function parsePaginatedList<T>(
  response: unknown,
  normalizeRow: (row: unknown) => T,
  arrayKeys: string[],
): { items: T[]; meta: ChatListMeta } {
  const root =
    response && typeof response === "object"
      ? (response as Record<string, unknown>)
      : {};
  let meta = parseMeta(root.meta);
  let inner: unknown =
    "data" in root && root.data !== undefined ? root.data : response;

  if (Array.isArray(inner)) {
    return { items: inner.map(normalizeRow), meta };
  }

  if (inner && typeof inner === "object") {
    const block = inner as Record<string, unknown>;
    meta = { ...meta, ...parseMeta(block.meta) };
    for (const key of arrayKeys) {
      const arr = block[key];
      if (Array.isArray(arr)) {
        return { items: arr.map(normalizeRow), meta };
      }
    }
    const nested = block.data ?? block.items;
    if (Array.isArray(nested)) {
      return { items: nested.map(normalizeRow), meta };
    }
  }

  return { items: [], meta };
}

function listConversationsFromResponse(
  response: unknown,
): ChatConversationsResult {
  const { items, meta } = parsePaginatedList(
    response,
    normalizeConversation,
    ["conversations", "data", "items"],
  );
  return { conversations: items, meta };
}

export type ChatMessagesListResponse = {
  items?: ChatMessage[];
  messages?: ChatMessage[];
  data?: ChatMessage[];
  meta?: ChatListMeta;
};

function listMessagesFromResponse(body: unknown): ChatMessage[] {
  const u = unwrapData<ChatMessagesListResponse | ChatMessage[]>(body);
  if (Array.isArray(u)) return u.map(normalizeMessage);
  const arr = u?.items ?? u?.messages ?? u?.data ?? ([] as ChatMessage[]);
  return (Array.isArray(arr) ? arr : []).map(normalizeMessage);
}

function coerceUnreadNumber(v: unknown): number | null {
  if (typeof v === "number" && !Number.isNaN(v)) return Math.max(0, Math.floor(v));
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (!Number.isNaN(n)) return Math.max(0, Math.floor(n));
  }
  return null;
}

/** Parse GET /chat/unread (and similar) across common API wrapper shapes. */
function normalizeUnread(body: unknown): number {
  const pickFromObject = (o: unknown): number | null => {
    if (!o || typeof o !== "object") return null;
    const r = o as Record<string, unknown>;
    const keys = [
      "total",
      "unread",
      "count",
      "unreadCount",
      "totalUnread",
      "unreadMessages",
      "unreadTotal",
      "chatUnread",
    ];
    for (const k of keys) {
      const n = coerceUnreadNumber(r[k]);
      if (n != null) return n;
    }
    return null;
  };

  const u = unwrapData(body);
  const direct = coerceUnreadNumber(u);
  if (direct != null) return direct;

  const fromU = pickFromObject(u);
  if (fromU != null) return fromU;

  if (body && typeof body === "object" && !("data" in (body as object))) {
    const fromRoot = pickFromObject(body);
    if (fromRoot != null) return fromRoot;
  }

  return 0;
}

/** Assigned advisor for partner chat (`GET /chat/partner/advisor`). */
export interface PartnerChatAdvisor {
  userId: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  profileUrl?: string | null;
  designation?: string | null;
  meetingLink?: string | null;
}

export type PartnerChatAdvisorResult = {
  advisor: PartnerChatAdvisor | null;
};

function normalizePartnerChatAdvisorResponse(
  response: unknown,
): PartnerChatAdvisorResult {
  const block = unwrapData<{ advisor?: unknown }>(response);
  const raw = block?.advisor;
  if (!raw || typeof raw !== "object") {
    return { advisor: null };
  }
  const o = raw as Record<string, unknown>;
  const userId =
    typeof o.userId === "string"
      ? o.userId.trim()
      : typeof o.id === "string"
        ? o.id.trim()
        : "";
  if (!userId) return { advisor: null };
  return {
    advisor: {
      userId,
      name: typeof o.name === "string" ? o.name : null,
      email: typeof o.email === "string" ? o.email : null,
      role: typeof o.role === "string" ? o.role : null,
      profileUrl: typeof o.profileUrl === "string" ? o.profileUrl : null,
      designation: typeof o.designation === "string" ? o.designation : null,
      meetingLink:
        o.meetingLink === null || typeof o.meetingLink === "string"
          ? (o.meetingLink as string | null)
          : null,
    },
  };
}

const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartnerChatAdvisor: builder.query<PartnerChatAdvisorResult, void>({
      query: () => ({ url: "/chat/partner/advisor", method: "GET" }),
      transformResponse: (response: unknown) =>
        normalizePartnerChatAdvisorResponse(response),
      providesTags: [{ type: "chatPartnerAdvisor", id: "CURRENT" }],
    }),

    getChatConversations: builder.query<
      ChatConversationsResult,
      { page?: number; limit?: number } | void
    >({
      query: (arg) => {
        const page = arg?.page ?? 1;
        const limit = arg?.limit ?? 30;
        return {
          url: "/chat/conversations",
          params: { page, limit },
        };
      },
      transformResponse: (response: unknown) =>
        listConversationsFromResponse(response),
      providesTags: (result) =>
        result?.conversations?.length
          ? [
              ...result.conversations.map((c) => ({
                type: "chatConversations" as const,
                id: c.id,
              })),
              { type: "chatConversations" as const, id: "LIST" },
            ]
          : [{ type: "chatConversations" as const, id: "LIST" }],
    }),

    getChatUnread: builder.query<number, void>({
      query: () => ({ url: "/chat/unread", method: "GET" }),
      transformResponse: (response: unknown) => normalizeUnread(response),
      providesTags: [{ type: "chatUnread", id: "TOTAL" }],
    }),

    getChatMessages: builder.query<
      ChatMessage[],
      { conversationId: string; page?: number; limit?: number }
    >({
      query: ({ conversationId, page = 1, limit = 50 }) => ({
        url: `/chat/conversations/${conversationId}/messages`,
        params: { page, limit },
      }),
      transformResponse: (response: unknown) =>
        listMessagesFromResponse(response),
      providesTags: (_result, _err, { conversationId }) => [
        { type: "chatMessages", id: conversationId },
      ],
      /** Drop cache when leaving the thread so reopen always hits the API (avoids stale `[]`). */
      keepUnusedDataFor: 0,
    }),

    createOrGetChatConversation: builder.mutation<
      ChatConversation,
      { otherUserId: string }
    >({
      query: (body) => ({
        url: "/chat/conversations",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizeConversation(unwrapData<unknown>(response) ?? response),
      invalidatesTags: [
        { type: "chatConversations", id: "LIST" },
        { type: "chatUnread", id: "TOTAL" },
      ],
    }),

    sendChatMessage: builder.mutation<
      ChatMessage,
      { conversationId: string; text: string }
    >({
      query: ({ conversationId, text }) => ({
        url: `/chat/conversations/${conversationId}/messages`,
        method: "POST",
        body: { text },
      }),
      transformResponse: (response: unknown) =>
        normalizeMessage(unwrapData<unknown>(response) ?? response),
      invalidatesTags: (_result, _err, { conversationId }) => [
        { type: "chatConversations", id: "LIST" },
        { type: "chatUnread", id: "TOTAL" },
        { type: "chatMessages", id: conversationId },
      ],
    }),

    markChatConversationRead: builder.mutation<
      unknown,
      { conversationId: string }
    >({
      query: ({ conversationId }) => ({
        url: `/chat/conversations/${conversationId}/read`,
        method: "PATCH",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          chatApi.util.updateQueryData("getChatUnread", undefined, () => 0),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: [
        { type: "chatConversations", id: "LIST" },
        { type: "chatUnread", id: "TOTAL" },
      ],
    }),
  }),
});

export const {
  useGetPartnerChatAdvisorQuery,
  useGetChatConversationsQuery,
  useLazyGetChatConversationsQuery,
  useGetChatUnreadQuery,
  useGetChatMessagesQuery,
  useLazyGetChatMessagesQuery,
  useCreateOrGetChatConversationMutation,
  useSendChatMessageMutation,
  useMarkChatConversationReadMutation,
} = chatApi;

export { chatApi };
