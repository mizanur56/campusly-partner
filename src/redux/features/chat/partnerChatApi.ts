import { baseApi } from "../../api/baseApi";

export interface ChatParticipant {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
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

function unwrapData<T>(response: unknown): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

function normalizeConversation(raw: unknown): ChatConversation {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  return {
    ...o,
    id: String(o.id ?? ""),
    staffUser: (o.staffUser as ChatParticipant) ?? null,
    otherUser: (o.otherUser as ChatParticipant) ?? null,
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
  return {
    ...o,
    id: String(o.id ?? ""),
    text,
    body: typeof fromBody === "string" ? fromBody : undefined,
    senderUserId:
      (typeof o.senderUserId === "string" ? o.senderUserId : null) ??
      (typeof o.senderId === "string" ? o.senderId : undefined),
    createdAt: typeof o.createdAt === "string" ? o.createdAt : undefined,
  };
}

function normalizeMessage(raw: unknown): ChatMessage {
  return normalizeChatMessage(raw);
}

export type ChatConversationsListResponse = {
  items?: ChatConversation[];
  conversations?: ChatConversation[];
  data?: ChatConversation[];
  meta?: { total?: number; page?: number; limit?: number };
};

export type ChatMessagesListResponse = {
  items?: ChatMessage[];
  messages?: ChatMessage[];
  data?: ChatMessage[];
  meta?: { total?: number; page?: number; limit?: number };
};

function listConversationsFromResponse(
  body: unknown,
): ChatConversation[] {
  const u = unwrapData<ChatConversationsListResponse | ChatConversation[]>(
    body,
  );
  if (Array.isArray(u)) return u.map(normalizeConversation);
  const arr =
    u?.items ?? u?.conversations ?? u?.data ?? ([] as ChatConversation[]);
  return (Array.isArray(arr) ? arr : []).map(normalizeConversation);
}

function listMessagesFromResponse(body: unknown): ChatMessage[] {
  const u = unwrapData<ChatMessagesListResponse | ChatMessage[]>(body);
  if (Array.isArray(u)) return u.map(normalizeMessage);
  const arr = u?.items ?? u?.messages ?? u?.data ?? ([] as ChatMessage[]);
  return (Array.isArray(arr) ? arr : []).map(normalizeMessage);
}

function normalizeUnread(body: unknown): number {
  const u = unwrapData<{ total?: number; unread?: number; count?: number }>(
    body,
  );
  if (typeof u === "number") return u;
  if (u && typeof u === "object") {
    if (typeof u.total === "number") return u.total;
    if (typeof u.unread === "number") return u.unread;
    if (typeof u.count === "number") return u.count;
  }
  return 0;
}

const partnerChatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatConversations: builder.query<
      ChatConversation[],
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
        result
          ? [
              ...result.map((c) => ({
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
        normalizeConversation(
          unwrapData<unknown>(response) ?? response,
        ),
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
      invalidatesTags: [
        { type: "chatConversations", id: "LIST" },
        { type: "chatUnread", id: "TOTAL" },
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
      invalidatesTags: [
        { type: "chatConversations", id: "LIST" },
        { type: "chatUnread", id: "TOTAL" },
      ],
    }),
  }),
});

export const {
  useGetChatConversationsQuery,
  useLazyGetChatConversationsQuery,
  useGetChatUnreadQuery,
  useGetChatMessagesQuery,
  useLazyGetChatMessagesQuery,
  useCreateOrGetChatConversationMutation,
  useSendChatMessageMutation,
  useMarkChatConversationReadMutation,
} = partnerChatApi;

export { partnerChatApi };
