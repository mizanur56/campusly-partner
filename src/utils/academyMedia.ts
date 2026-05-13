import { config } from "../config";

/**
 * Origin used for static uploads (NOT the `/api` prefix — files are served at `/uploads/...`).
 */
function assetBaseOrigin(): string {
  const img = String(config.image_access_url || "").trim().replace(/\/$/, "");
  if (img) {
    // Allow full URL or origin-only env
    try {
      if (img.startsWith("http")) return new URL(img).origin;
    } catch {
      /* fallthrough */
    }
    return img;
  }

  const api = String(config.api || "").trim();
  if (api.startsWith("http://") || api.startsWith("https://")) {
    try {
      const u = new URL(api);
      return u.origin;
    } catch {
      return api.replace(/\/$/, "");
    }
  }

  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

/**
 * Express serves disk `uploads/` at HTTP `/uploads` (see server `app.ts`).
 * Media rows often store `/file.mp4` or `/folder/file.mp4` without the `uploads` segment.
 */
function normalizeUploadsPublicPath(p: string): string {
  const s = p.trim();
  if (!s.startsWith("/")) return `/uploads/${s}`;
  if (s.startsWith("/uploads/") || s === "/uploads") return s;
  return `/uploads${s}`;
}

/**
 * Absolute playback URL for academy lesson media (uploaded files / API-relative paths).
 * Leaves `http(s)`, partner static `/images/…`, and already `/uploads/…` paths consistent.
 */
export function resolveAcademyMediaUrl(path?: string | null): string {
  if (!path?.trim()) return "";
  const p = path.trim();
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/images/")) return p;

  const base = assetBaseOrigin();
  const pathPart = normalizeUploadsPublicPath(p);
  if (!base) return pathPart;
  return `${base.replace(/\/$/, "")}${pathPart}`;
}
