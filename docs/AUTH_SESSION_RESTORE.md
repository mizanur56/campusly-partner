# Session restore: stale client state vs HttpOnly cookies

**Summary:** The access token in `localStorage` / Redux can still make `GET /auth/me` succeed for a while even when the **HttpOnly refresh cookie** is gone, so the server session is effectively invalid. The UI used to stay “logged in” and some failure paths did not clear `localStorage`. This document describes that problem and the same style of fix across the **Partner**, **Admin**, and **Student** SPAs.

**Scope:** `partner.campustransfer`, `admin.campustransfer`, `student.campustransfer`  
**Implementation:** `src/providers/SessionRestoreProvider.tsx` (each repo)

---

## 1. What was wrong

### 1.1 Trusting only local state

Some builds short-circuited session restore when Redux `user`/`token` matched `localStorage` (`token` + `user` JSON). In that case the app skipped calling `/auth/me` on load and marked the gate as `done`.

**Effect:** After the user cleared **cookies** (or the refresh cookie expired / was revoked) but old keys remained in `localStorage` and redux-persist, the UI could still show a signed-in shell until something else failed—or indefinitely if the access JWT was still accepted by `/auth/me` without a refresh cookie being required on that call.

### 1.2 Access JWT vs refresh cookie

The access token in `localStorage` is readable to JS. The **refresh** session is usually carried by an **HttpOnly** cookie: JavaScript cannot read it, and `document.cookie` will not show it.

So:

- **Cannot** reliably infer “no cookies” from `document.cookie` alone (and using `VITE_NODE_ENV=production` on localhost made any “require role cookie” style checks dangerous).
- **Can** prove the refresh cookie is still accepted by the server by calling `POST /auth/refresh-token` with `credentials: "include"` once after a successful `/auth/me` **when** the session was **not** just established via a `401 → refresh → /auth/me` chain (that chain already proved the cookie).

### 1.3 Failure path did not clear client storage

On session-restore failure, some code paths redirected to login but did not consistently run `clearAuthLocalStorage()` + `logout()`, so persisted Redux + `localStorage` could disagree with “you should be logged out”.

---

## 2. What we changed

### 2.1 Always validate with the server (protected bootstrap)

Removed the “local Redux matches localStorage → skip API” optimization for the main restore path. On non-public bootstrap, the app runs the restore pipeline so `/auth/me` (and refresh when needed) actually runs.

**Trade-off:** One extra `/auth/me` (and sometimes one refresh) per full page load on protected entry—acceptable for correctness.

### 2.2 Refresh “proof” after a first-hit `/auth/me` success

After `GET /auth/me` succeeds **without** having just gone through `401 → refresh-token → /auth/me`:

1. Call `POST /auth/refresh-token` once (same as normal refresh; `credentials: "include"`).
2. If that request is **not OK**, treat the session as invalid: clear storage, dispatch `logout`, then either stay on public auth routes or redirect to the portal login URL.
3. If the response includes a new access token, adopt it before persisting so the client stays aligned with the server rotation policy.

**Partner / Admin:** explicit `callRefresh()` + `extractAccessTokenFromRefreshJson` in `SessionRestoreProvider`.  
**Student:** `refreshAuthSession(API_BASE)` is used for the same proof (shared mutex in `authSessionRefresh.ts`).

### 2.3 Centralized cleanup on failure

The “go to login / stay on public auth” helper now **always** runs `clearAuthLocalStorage()` and `dispatch(logout())` before redirecting or unblocking the public auth UI.

### 2.4 `useLayoutEffect` scope

Cross-portal redirect from the readable **portal role** cookie (when present) still runs in `useLayoutEffect` to reduce wrong-portal flashes. We do **not** use missing role cookie as a hard logout signal (HttpOnly / wrong host / env pitfalls).

---

## 3. Related docs

- Partner: `docs/AUTH_SYSTEM.md` §5 (session restore overview).
- Admin: `docs/AUTH_SYSTEM.md`.
- CORS / local hosts: `docs/DEV_ORIGIN_AND_CORS_SETUP.md` (partner repo).

---

## 4. Backend expectations

- `POST /auth/refresh-token` should succeed when the refresh cookie is valid (typical).
- If your API **refuses** refresh while the access token is still far from expiry, the extra proof call could force logout on every load—adjust the API or gate the proof behind an env flag (not implemented by default).

If that edge case appears, document the API rule here and consider relaxing the proof step in coordination with backend.
