import { Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { config } from "../../../../config";
import { useGetAnnouncementsQuery } from "../../../../redux/features/announcements/announcementsApi";
import { stripHtmlTags } from "../../../../lib/htmlContent";
import Panel from "./Panel";

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function initials(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "U";
  return n
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function AnnouncementsCenter() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetAnnouncementsQuery({ page: 1, limit: 5 });
  const items = data?.data?.slice(0, 5) ?? [];

  return (
    <Panel
      title="Announcements"
      subtitle="Updates from universities & Campus Transfer"
      icon={<Megaphone className="h-[18px] w-[18px]" aria-hidden />}
      accent="#f59e0b"
      action={
        <button
          type="button"
          onClick={() => navigate("/announcements")}
          className="rounded-[6px] px-2.5 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10"
        >
          View all
        </button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex animate-pulse items-start gap-3">
              <div className="h-10 w-10 rounded-[6px] bg-neutral-100 dark:bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 rounded bg-neutral-100 dark:bg-neutral-800" />
                <div className="h-2.5 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Megaphone className="mb-2 h-9 w-9 text-neutral-300 dark:text-neutral-600" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No announcements right now.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-100 dark:divide-white/5">
          {items.map((a: any) => {
            const preview = stripHtmlTags(
              a.body ?? a.description ?? a.subtitle ?? "",
            );
            const logo = a?.university?.UniversityLogo?.url;
            return (
              <li
                key={a.id}
                className="flex cursor-pointer items-start gap-3 py-3 first:pt-0 last:pb-0"
                onClick={() => navigate("/announcements")}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-amber-50 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                  {logo ? (
                    <img
                      src={`${config.image_access_url}${logo}`}
                      alt={a?.university?.name ?? "University"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    initials(a?.university?.name)
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[13px] font-semibold text-neutral-900 dark:text-white">
                      {a.title}
                    </p>
                    <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:bg-white/10 dark:text-neutral-300">
                      {a.category ?? a.type ?? "Update"}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                    {preview.slice(0, 130)}
                    {preview.length > 130 ? "…" : ""}
                  </p>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    {fmtDate(a.createdAt) || a.intakeYear || ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
