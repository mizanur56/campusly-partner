# Cross-Portal Auth (4 Phases)

This document describes the production auth behavior across:

- Main website: `https://campustransfer.com`
- Admin portal: `https://admin.campustransfer.com`
- Student portal: `https://student.campustransfer.com`
- Partner portal: `https://partner.campustransfer.com`

---

## Environment Mode (Production Switch)

Cross-portal login routing (`/auth/login?tab=...`) is controlled by `node_env`.

- For portal apps (admin/student/partner), production behavior is active when:
  - `VITE_NODE_ENV=production` **or**
  - Vite runtime mode is `production` (`import.meta.env.MODE`)
- Config now uses fallback consistently:
  - `node_env: import.meta.env.VITE_NODE_ENV ?? import.meta.env.MODE`

Important:

- `student.campustransfer/.env.production` includes `VITE_NODE_ENV=production`.
- Partner/Admin production env files already had `VITE_NODE_ENV=production`.
- Recommended explicit production vars per portal:
  - `VITE_PORTAL` (`admin` / `student` / `partner`)
  - `VITE_DASHBOARD_PROTOCOL=https`
  - `VITE_SUBDOMAIN_ADMIN=admin`
  - `VITE_SUBDOMAIN_STUDENT=student`
  - `VITE_SUBDOMAIN_PARTNER=partner`
  - `VITE_PORTAL_ROLE_COOKIE=role_msbhh`

### Production env files checklist

- `admin.campustransfer/.env.production`
- `student.campustransfer/.env.production`
- `partner.campustransfer/.env.production`
- `campustransfer-frontend/.env.production`
- `server.campustransfer/.env.production`

---

## Phase 1: Single Login System

### 1.1 Main website login endpoints

- Student login tab:
  - `https://campustransfer.com/auth/login/`
- Partner login tab:
  - `https://campustransfer.com/auth/login/?tab=partner`

Main website posts to server `/auth/login` with `credentials: include`, so shared cookies are set on root domain.

### 1.2 Admin login endpoint

- Admin login only from admin portal:
  - `https://admin.campustransfer.com/login`

### 1.3 Cookie/session source of truth

Server sets shared cookies (root domain scope):

- `refreshToken` (httpOnly)
- `role_msbhh` (user role used for portal routing)

This lets all portals resolve the correct destination after login.

---

## Phase 2: Logged-in User Redirect to Correct Portal

### 2.1 Redirect rule

If logged-in role and current portal do not match, redirect to role home portal:

- ADMIN / SUPER_ADMIN / AGENT / EMPLOYEE -> admin portal
- STUDENT -> student portal
- PARTNER / PARTNER_TEAM_MEMBER -> partner portal

### 2.2 Production-only enforcement

- Cross-portal hard redirects are applied only in production flows.
- Dev/local remains SPA-local where applicable.

### 2.3 Stale cookie protection (important fix)

To avoid wrong redirects when user is actually logged out:

- `redirectFromPortalRoleCookieIfNeeded()` now first checks local auth evidence:
  - local `token` or persisted auth state exists
- If no local auth evidence, **no cookie-based portal redirect**

Result:

- Visiting `admin.campustransfer.com` while not logged in no longer jumps to student/partner due to stale `role_msbhh`.

---

## Phase 3: Logout System (Portal + Main Website)

### 3.1 Logout from any portal

On portal logout:

1. Call server `/auth/logout` (revoke DB refresh token, clear session cookies)
2. Set short-lived cross-subdomain signal cookie: `ct_logout=1`
3. Clear local auth storage
4. Redirect to login entry

### 3.2 Global logout propagation

Other portals check `ct_logout` on protected flow/focus and then:

- clear local auth
- clear `ct_logout`
- force login path

So logout in one place effectively logs out everywhere.

### 3.3 Main website logout landing (production)

Main website logout now sends user to:

- `https://campustransfer.com/auth/login` (production)

So website logout always lands on auth page cleanly.

---

## Phase 4: Back to Website / Back to Portal

### 4.1 Portal -> Back to Website

Portal user dropdown "Back to website" goes to:

- `https://campustransfer.com`

### 4.2 Main website -> Go to dashboard/portal

Main website dropdown resolves portal by user role:

- Admin role -> `https://admin.campustransfer.com`
- Student role -> `https://student.campustransfer.com`
- Partner role -> `https://partner.campustransfer.com`

### 4.3 If user hits wrong portal manually

When authenticated and role-home portal differs, app hard-redirects to correct portal.

---

## Quick Test Checklist (Production)

1. Login as admin from admin login -> go to student/partner URL -> should return to admin portal.
2. Login as student from main site login -> "Go to dashboard" should open student portal.
3. Login as partner from main site `?tab=partner` -> should open partner portal.
4. Logout from any one portal -> open others -> should require login.
5. While fully logged out, open `admin.campustransfer.com` directly -> must stay on admin login (no forced student redirect).

