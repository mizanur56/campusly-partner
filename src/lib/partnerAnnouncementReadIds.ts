/** localStorage key — keep in sync with announcement UIs that mark items read. */
export const PARTNER_ANNOUNCEMENT_READ_IDS_KEY =
  "partner_announcements_read_ids_v1";

export function getStoredAnnouncementReadIds(): string[] {
  try {
    const raw = window.localStorage.getItem(PARTNER_ANNOUNCEMENT_READ_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export function persistAnnouncementReadIds(ids: string[]): void {
  try {
    window.localStorage.setItem(
      PARTNER_ANNOUNCEMENT_READ_IDS_KEY,
      JSON.stringify(ids),
    );
  } catch {
    // ignore
  }
}
