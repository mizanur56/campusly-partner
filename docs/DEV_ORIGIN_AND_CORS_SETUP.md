## Dev origin & CORS setup for partner panel

This note documents the local dev changes so you can easily compare **previous vs current** when updating later.

### 1. Env: default app domain

**File:** `.env` (in `partner.campustransfer`)

```diff
- VITE_PUBLIC_APP_DOMAIN=localhost
+ VITE_PUBLIC_APP_DOMAIN=https://campustransfer.com/
```

**Meaning:**  
Local dev now pretends to run under `https://campustransfer.com/` instead of `http://localhost:4005` when we build URLs based on `config.app_domain`.

---

### 2. Config: app_domain + API base URL

**File:** `src/config/index.ts`

```ts
export const config = {
  // 🌐 Application
  // Default origin falls back to production domain if env is not set
  app_domain: import.meta.env.VITE_PUBLIC_APP_DOMAIN || "https://campustransfer.com/",

  // In dev, hit Vite proxy (/api). In prod, hit real API URL.
  api: import.meta.env.DEV ? "/api" : import.meta.env.VITE_API_URL,

  image_access_url: import.meta.env.VITE_IMAGE_ACCESS_URL,
  // ...
} as const;
```

- **Before:** `api` always used `VITE_API_URL` directly → browser called `https://campustransferapi...` from `http://localhost:4005` → CORS.
- **Now (dev):** browser only calls `/api/...` on `http://localhost:4005`, and Vite proxies that to the real API (see next step).

---

### 3. Vite dev proxy (CORS-free API calls)

**File:** `vite.config.ts`

```ts
export default defineConfig({
  base: "/",
  plugins: [react(), svgr(/* ... */)],
  server: {
    proxy: {
      "/api": {
        target: "https://campustransferapi.thezoomit.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
```

**Effect:**
- Frontend calls: `http://localhost:4005/api/...`
- Vite forwards server‑side → `https://campustransferapi.thezoomit.com/api/...`
- Browser origin stays `http://localhost:4005` → **no CORS error**, backend sees request from Vite dev server.

In production, this proxy is not used; `config.api` points directly at `VITE_API_URL` again.

---

### 4. Client details header: force origin to campustransfer.com

**File:** `src/redux/api/baseApi.ts` (`getClientDetails`)

```ts
const getClientDetails = async (): Promise<ClientDetails> => {
  const ipAddress = await getClientIP();
  const userAgent = navigator.userAgent || "Unknown";
  const browserUrl = (() => {
    try {
      const current = window.location.href;
      const url = new URL(current);
      const origin = config.app_domain || "https://campustransfer.com/";
      const cleanOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin;
      return `${cleanOrigin}${url.pathname}${url.search}${url.hash}`;
    } catch {
      return config.app_domain || "https://campustransfer.com/";
    }
  })();

  return {
    ipAddress,
    userAgent,
    browserUrl,
    accessedAt: new Date().toISOString(),
  };
};
```

- **Before:** `browserUrl` = `window.location.href` → `http://localhost:4005/...` in dev.
- **Now:** `browserUrl` always uses origin from `config.app_domain`  
  → `https://campustransfer.com/...` (with same path/query/hash).

This matches your server’s allowed origin while you still develop on `localhost:4005`.

---

### How to revert quickly

If you ever want to go back to pure localhost behaviour:

1. In `.env`:
   ```env
   VITE_PUBLIC_APP_DOMAIN=localhost
   ```
2. In `src/config/index.ts`:
   ```ts
   api: import.meta.env.VITE_API_URL,
   ```
3. In `vite.config.ts`: remove the `server.proxy` block.
4. In `baseApi.ts`: set `browserUrl = window.location.href;` again.

Then restart `npm run dev`.

