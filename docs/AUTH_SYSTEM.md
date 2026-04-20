# Partner Portal — Authentication System

End-to-end reference for the partner SPA's auth: which files participate, what each one owns, and how the runtime flow behaves (login, session restore, token refresh, cross-subdomain routing, and logout).

> SPA target: `partner.<app_domain>` (e.g. `partner.gubdi.com`)
> Sibling portals: `student.<app_domain>`, `admin.<app_domain>`
> Public marketing / login hub: `<app_domain>` (e.g. `gubdi.com/auth/login/?tab=partner`)

---

## 1. File Map

### 1.1 Config

| File                    | Responsibility                                                                                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/config/index.ts`   | Exports the `config` object: `api`, `app_domain`, `node_env`, `image_access_url`, `tiny_api_key`. Single source for env-derived values.                                                            |
| `.env` / `.env-example` | `VITE_API_URL`, `VITE_PUBLIC_APP_DOMAIN`, `VITE_NODE_ENV`, and optional overrides `VITE_SUBDOMAIN_ADMIN / STUDENT / PARTNER`, `VITE_PORTAL_ROLE_COOKIE`, `VITE_DASHBOARD_PROTOCOL`, `VITE_PORTAL`. |

### 1.2 Redux state + API

| File                                   | Responsibility                                                                                                                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/redux/features/auth/authSlice.ts` | `auth` slice with `{ user, token }`, actions `setUser`, `logout`, `setProfile`, `setRole`, and selectors `selectCurrentUser`, `useCurrentToken`.                                                                                |
| `src/redux/features/auth/authApi.ts`   | RTK Query endpoints: `login`, `register`, `forgotPassword`, `resetPassword`, `changePassword`, `setPasswordByInvitation`.                                                                                                       |
| `src/redux/api/baseApi.ts`             | `fetchBaseQuery` with `credentials: "include"`, `Authorization: Bearer <token>` header, `X-Client-Details` (IP + UA + URL + timestamp), `X-Action` (endpoint name). Implements **401 → refresh → retry → 401 ⇒ global logout**. |

### 1.3 Auth libraries (`src/lib`)

| File                    | Responsibility                                                                                                                                                                                                                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authLocalStorage.ts`   | `persistAuthLocalStorage(user, token)` / `clearAuthLocalStorage()` — writes/clears `localStorage["token"]` and `localStorage["user"]`.                                                                                                                                                                                 |
| `authSessionRefresh.ts` | Shape helpers (`buildUserData`, `extractAccessTokenFromRefreshJson`, `extractUserFromMeJson`) and `refreshAuthSession(api)` — a mutex-guarded refresh → `/auth/me` → Redux + localStorage update.                                                                                                                      |
| `logoutCookie.ts`       | Cross-subdomain logout broadcast cookie `ct_logout` (60 s): `setLogoutCookie`, `clearLogoutCookie`, `hasLogoutCookie`, plus `callLogoutApi()` → `POST /auth/logout`.                                                                                                                                                   |
| `portalRouting.ts`      | Heart of cross-portal routing. Resolves current portal from subdomain / `VITE_PORTAL`, maps roles → home portal, reads the `role_msbhh` cookie, and provides `getPortalLoginUrl`, `redirectFromPortalRoleCookieIfNeeded`, `redirectToCorrectPortalIfNeeded`, `isPartnerPortalSession`, `getPortalRoleMismatchMessage`. |

### 1.4 Providers & Routes

| File                                       | Responsibility                                                                                                                                                                                                                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/providers/SessionRestoreProvider.tsx` | Wraps the app. On mount: (a) cookie-based cross-portal redirect, (b) match Redux ↔ localStorage, (c) call `/auth/me` with bearer, (d) on 401 call `/auth/refresh-token`, (e) re-hydrate Redux + localStorage, (f) fall back to partner login URL. Shows a spinner while `checking`. |
| `src/routes/ProtectedRoute.tsx`            | For authenticated routes. Listens for `ct_logout` on focus, then enforces: token present → user is a partner session → role/permission check → render children, or redirect to the correct portal / login.                                                                          |
| `src/routes/GuestOnlyAuthRoute.tsx`        | For `/login`, `/register`, `/forgot-password`, `/reset-password`, `/set-password`. If already authenticated, redirects to home or to the correct portal.                                                                                                                            |
| `src/routes/routes.tsx`                    | Route tree. Guest routes wrap with `GuestOnlyAuthRoute`; everything else under `/` uses `ProtectedRoute`.                                                                                                                                                                           |

### 1.5 Pages

| File                                                                                                         | Responsibility                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/Auth/Login.tsx`                                                                                   | Login form (Ant Design) → `useLoginMutation` → mismatch-guard via `isPartnerPortalSession` → persist + dispatch `setUser` → `redirectToCorrectPortalIfNeeded` → navigate to `/` or `/my-tasks` (team members). |
| `src/pages/Auth/Register.tsx`                                                                                | Partner onboarding self-signup (`partners/register`).                                                                                                                                                          |
| `src/pages/Auth/ForgetPassword.tsx` / `ResetPassword.tsx` / `ChangePassword.tsx` / `SetPasswordByInvite.tsx` | Password lifecycle flows against the same `authApi` endpoints.                                                                                                                                                 |

### 1.6 UI touch-points

| File                                               | Responsibility                                                                                                                                                                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/components/common/Dropdowns/UserDropdown.tsx` | Profile / "Back to website" / **Logout**. Logout calls `callLogoutApi()`, `setLogoutCookie()`, `clearAuthLocalStorage()`, dispatches `logout()` + `baseApi.util.resetApiState()`, then `window.location.href = getPortalLoginUrl()`. |

---

## 2. Cookies & Storage

| Storage      | Name                                       | Scope                              | Set by               | Purpose                                                                                                                                                                       |
| ------------ | ------------------------------------------ | ---------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cookie       | `refreshToken`                             | `.<app_domain>` (httpOnly, secure) | API on login/refresh | Silent session refresh.                                                                                                                                                       |
| Cookie       | `role_msbhh` _(`VITE_PORTAL_ROLE_COOKIE`)_ | `.<app_domain>`                    | API on login         | Cross-subdomain role hint (`STUDENT`, `PARTNER`, `ADMIN`, …). Used by the SPA to redirect a visitor to the right portal **without** needing a token on the current subdomain. |
| Cookie       | `ct_logout`                                | `.<app_domain>` (60 s)             | SPA on logout        | Broadcasts "you were logged out elsewhere" to sibling tabs/portals.                                                                                                           |
| localStorage | `token`                                    | per-origin                         | SPA                  | Bearer access token.                                                                                                                                                          |
| localStorage | `user`                                     | per-origin                         | SPA                  | Cached user object to hydrate Redux before `/auth/me` returns.                                                                                                                |

> Because `refreshToken` and `role_msbhh` are set on `.<app_domain>`, every subdomain (partner / student / admin) sees them. `token` and `user` in localStorage are per-origin, so each SPA holds its own session.

---

## 3. Role → Portal Map (`portalRouting.ts`)

```ts
ROLE_HOME_PORTAL = {
  ADMIN / SUPER_ADMIN / SUPERADMIN / AGENT / EMPLOYEE → "admin",
  STUDENT                                             → "student",
  PARTNER / PARTNER_TEAM_MEMBER                       → "partner",
}
```

Extra rules:

- `isPartnerPortalSession(user)` — true when `user.type === "employee"` (partner-org staff authenticated as `EMPLOYEE`) **or** the user's role resolves to the partner portal.
- `EMPLOYEE` is treated as "admin" HQ staff **except** when this SPA runs as partner and `user.type === "employee"` — those are partner-org staff and stay here.
- Unknown roles that contain `PARTNER` also resolve to partner.

---

## 4. Login Flow

```
Partner SPA                  API                Redux / localStorage
──────────────              ─────               ───────────────────
POST /auth/login  ───────▶
                   ◀─────── { data: { user, token } }
                                                 setUser(user, token)
                                                 persistAuthLocalStorage(user, token)
   │
   ▼
isPartnerPortalSession(user)?
   ├─ no  → toast(getPortalRoleMismatchMessage) and stop
   └─ yes → redirectToCorrectPortalIfNeeded(user)
              ├─ redirect to <sibling>.<app_domain>/ OR
              └─ stay here → navigate(targetPath)  (`/my-tasks` for team members, else `/` or `?redirect=…`)
```

Mismatch toast text is centralized in `getPortalRoleMismatchMessage` so every SPA shows the same copy.

---

## 5. Session Restore (`SessionRestoreProvider`)

Runs once per app boot. Status starts as `"checking"` (except on public auth paths) and shows a centered spinner until resolved.

### 5.1 Synchronous phase — `useLayoutEffect`

Fires before paint so we can redirect without flashing protected UI.

1. `redirectFromPortalRoleCookieIfNeeded()` — if the `role_msbhh` cookie points to a portal **other than the current subdomain**, `window.location.replace` to that portal. Returns immediately. _(This check runs even for public auth paths so a student landing on `partner.<app_domain>/login` still gets routed to `student.<app_domain>`.)_
2. If on a public auth path, stop.
3. If Redux+localStorage session already matches, optionally call `redirectToCorrectPortalIfNeeded(user)` then mark `done`.

### 5.2 Async phase — `useEffect`

1. If session already valid locally → `done`.
2. If this is a public auth path and there is no token at all → `done` (let the page render).
3. Otherwise `restore()`:
   1. `GET /auth/me` with the current bearer.
   2. If `401` → `POST /auth/refresh-token` (cookie-based) → retry `/auth/me` with the new bearer.
   3. Any failure along the way → `goLoginOrStayOnPublicAuth()` which:
      - stays on `/login` if we already are there, otherwise
      - tries `redirectFromPortalRoleCookieIfNeeded()` (student cookie? go to student subdomain), otherwise
      - `window.location.href = getPortalLoginUrl()`.
   4. On success:
      - `redirectToCorrectPortalIfNeeded(user)` — if the freshly-loaded user belongs on a sibling subdomain, go there now.
      - Else if `!isPartnerPortalSession(user)` — clear local session and send to partner login.
      - Else dispatch `setUser`, persist to localStorage, and mark `done`.

### 5.3 Concurrency guard

`refreshAuthSession` in `authSessionRefresh.ts` uses a single shared promise so simultaneous 401s (e.g. many queries in flight) do not trigger multiple `/auth/refresh-token` calls.

---

## 6. Runtime 401 Handling (`baseApi.ts`)

Every RTK Query request is routed through `baseQueryWithRefreshToken`:

1. Execute the request.
2. If the response is not a 401, return it (toast on 404).
3. If the endpoint is in `NO_REFRESH_ON_401_ENDPOINTS`
   (`login`, `register`, `forgotPassword`, `resetPassword`, `setPasswordByInvitation`) — skip refresh, treat 401 as the credential error it is.
4. Otherwise call `refreshAuthSession(api)`:
   - On success — replay the original request.
   - On failure, or still 401 after replay — `handle401Logout`:
     - Toast a friendly / session-expired message.
     - `dispatch(logout())`, `clearAuthLocalStorage()`.
     - `window.location.href = getPortalLoginUrl()`.

---

## 7. Route Guards

### 7.1 `ProtectedRoute`

1. Focus/mount: if `ct_logout` cookie exists → clear local session and dispatch `logout()`.
2. If there is no `token` or `user` → try `redirectFromPortalRoleCookieIfNeeded()` (send student/admin visitors home); if that does nothing → `window.location.href = getPortalLoginUrl()`.
3. If running as partner but `!isPartnerPortalSession(user)` → clear, then same cookie-redirect-or-login fallback.
4. `redirectToCorrectPortalIfNeeded(user)` — if the signed-in user actually belongs to admin/student, send them there.
5. `checkAccess(user, roles, employeePermissions)` — hard-denies with `<Navigate to="/404" />` when the route specifies `roles` or `employeePermissions` that this user does not satisfy.
6. Render children.

### 7.2 `GuestOnlyAuthRoute`

1. If guest → render children (`Login`, `Register`, etc.).
2. If authed but not a partner session → logout locally and go to `getPortalLoginUrl()`.
3. If authed but belongs on another portal → `redirectToCorrectPortalIfNeeded`.
4. Otherwise `<Navigate to="/" />`.

---

## 8. Logout Flow

Triggered from `UserDropdown`:

```
UserDropdown ─▶ callLogoutApi()           (POST /auth/logout, cookie cleared server-side)
            ─▶ setLogoutCookie()          (ct_logout=1 for 60 s on .<app_domain>)
            ─▶ clearAuthLocalStorage()    (token, user)
            ─▶ localStorage.removeItem("partner-preview-mode")
            ─▶ dispatch(logout())
            ─▶ dispatch(baseApi.util.resetApiState())
            ─▶ window.location.href = getPortalLoginUrl()
                                           → https://<app_domain>/auth/login/?tab=partner
```

`ProtectedRoute` listens for `ct_logout` on window focus in every open tab across subdomains; seeing the cookie forces a local logout so the user is not stranded in a signed-in UI after they logged out elsewhere.

---

## 9. Cross-Portal Redirect Decision Table

| Scenario (current = `partner.<app_domain>`)          | `role_msbhh` cookie | local token/user | Outcome                                                                                                                               |
| ---------------------------------------------------- | ------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Landing on `/`                                       | `STUDENT`           | none             | Redirect to `https://student.<app_domain>/` via `redirectFromPortalRoleCookieIfNeeded` (layout effect).                               |
| Landing on `/login`                                  | `ADMIN`             | none             | Same — redirect to `https://admin.<app_domain>/`.                                                                                     |
| Landing on `/`                                       | `PARTNER`           | none             | Cookie matches current → no redirect. Session restore → `/auth/me` 401 → refresh → success or fallback to `/auth/login/?tab=partner`. |
| Landing on `/`                                       | none                | none             | No cookie to follow → `getPortalLoginUrl()` → `<app_domain>/auth/login/?tab=partner`.                                                 |
| Signed-in as `STUDENT` (e.g. after refresh response) | any                 | present          | `redirectToCorrectPortalIfNeeded(user)` sends to `student.<app_domain>`.                                                              |
| Signed-in as `PARTNER`                               | `PARTNER`           | present          | Passes all guards, renders dashboard.                                                                                                 |
| Any, after logout elsewhere                          | `ct_logout=1`       | present          | On focus → clear local session → next guard run falls through to login flow.                                                          |

---

## 10. Partner Login URL

`getPortalLoginUrl()` is the single source for where to send unauthenticated users:

```ts
PORTAL_LOGIN_PATH = "/auth/login/?tab=partner";

// production (VITE_NODE_ENV=production):
//   https://<normalized app_domain>/auth/login/?tab=partner
// development:
//   <window.location.origin>/auth/login/?tab=partner
```

This URL is used by: `SessionRestoreProvider`, `ProtectedRoute`, `GuestOnlyAuthRoute`, `UserDropdown` logout, `baseApi` 401 handler, and `authSessionRefresh` when the refreshed session is not a partner session.

---

## 11. Adding / Changing Things Safely

- **New role:** extend `ROLE_HOME_PORTAL` in `portalRouting.ts`. That one map drives guards, cookie redirects, and login mismatch messaging.
- **New auth endpoint:** add it to `authApi.ts`. If it can 401 for bad credentials (rather than expired session), add the endpoint name to `NO_REFRESH_ON_401_ENDPOINTS` in `baseApi.ts` so a refresh loop is not attempted.
- **New public (guest) page:** add its path to `PUBLIC_AUTH_PATHS` in `SessionRestoreProvider.tsx` and wrap the route in `GuestOnlyAuthRoute` in `routes.tsx`.
- **Changing the cookie name:** set `VITE_PORTAL_ROLE_COOKIE` across all three SPAs (partner / student / admin) and the backend that issues the cookie — they must agree.
- **Local dev across subdomains:** see `docs/DEV_ORIGIN_AND_CORS_SETUP.md` for hosts + CORS setup so `.<app_domain>` cookies resolve the way production does.

---

## 12. Quick Reference — Function Cheat Sheet

```ts
// portalRouting.ts
getPortalLoginUrl(); // where to send guests
inferCurrentPortal(); // "admin" | "student" | "partner"
homePortalForRole(role); // role → portal
isPartnerPortalSession(user); // does this user belong here?
redirectFromPortalRoleCookieIfNeeded(); // cookie-only redirect (pre-login)
redirectToCorrectPortalIfNeeded(user); // post-login redirect
getPortalRoleMismatchMessage(role); // toast copy on wrong portal

// authSessionRefresh.ts
refreshAuthSession(api); // mutex-guarded refresh + /auth/me
buildUserData(raw); // normalize API user shape

// authLocalStorage.ts
persistAuthLocalStorage(user, token);
clearAuthLocalStorage();

// logoutCookie.ts
callLogoutApi();
setLogoutCookie() / clearLogoutCookie() / hasLogoutCookie();
```
