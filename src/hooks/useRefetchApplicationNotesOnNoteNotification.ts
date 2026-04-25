import { useEffect, useRef } from "react";
import { applicationApi } from "../redux/features/application/applicationApi";
import { useAppDispatch } from "../redux/features/hooks";

function isNoteSocketPayload(detail: unknown): boolean {
  if (!detail || typeof detail !== "object") return false;
  const e = (detail as { event?: unknown }).event;
  return e === "NOTE_CREATED" || e === "NOTE_REPLY";
}

function parseApplicationIdFromPayload(detail: unknown): string | null {
  if (!detail || typeof detail !== "object") return null;
  const d = detail as { applicationId?: unknown; link?: unknown };
  if (typeof d.applicationId === "string" && d.applicationId.length > 0) {
    return d.applicationId;
  }
  if (typeof d.link === "string") {
    const m = d.link.match(/\/applications\/([^/?#]+)/i);
    if (m?.[1]) return m[1];
  }
  return null;
}

/**
 * When the current user receives a note notification (socket → notification-received),
 * refetch notes only if they are viewing that application's details page.
 */
export function useRefetchApplicationNotesOnNoteNotification(
  activeApplicationId: string | undefined
): void {
  const dispatch = useAppDispatch();
  const activeRef = useRef(activeApplicationId);
  activeRef.current = activeApplicationId;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const refetchNotes = (appId: string) => {
      dispatch(
        applicationApi.endpoints.getApplicationNotes.initiate(appId, {
          subscribe: false,
          forceRefetch: true,
        })
      );
    };

    const onNotification = (ev: Event) => {
      if (!isNoteSocketPayload((ev as CustomEvent).detail)) return;
      const appId = parseApplicationIdFromPayload((ev as CustomEvent).detail);
      if (!appId) return;
      const current = activeRef.current;
      if (!current || current !== appId) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        refetchNotes(appId);
      }, 120);
    };

    window.addEventListener("notification-received", onNotification, true);
    return () => {
      window.removeEventListener("notification-received", onNotification, true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [dispatch]);
}
