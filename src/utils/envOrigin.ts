/** Shared URL helpers for config (API base → origin). */

export function trimOrigin(url: string | undefined): string {
  if (!url?.trim()) return "";
  return url.replace(/\/$/, "");
}

export function httpUrlOrigin(apiBase: string): string {
  if (!apiBase.startsWith("http")) return "";
  try {
    return new URL(apiBase).origin;
  } catch {
    return "";
  }
}
