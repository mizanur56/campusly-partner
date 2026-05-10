import { config } from "../config";

/** Absolute playback URL for academy lesson media stored as `/uploads/...` (same rules as admin preview). */
export function resolveAcademyMediaUrl(path?: string | null): string {
  if (!path?.trim()) return "";
  const p = path.trim();
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  const base = String(config.image_access_url || config.api || "").replace(/\/$/, "");
  if (!base) return p.startsWith("/") ? p : `/${p}`;
  return `${base}${p.startsWith("/") ? p : `/${p}`}`;
}
