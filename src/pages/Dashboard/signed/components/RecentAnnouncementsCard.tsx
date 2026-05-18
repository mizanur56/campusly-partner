import { Link } from "react-router-dom";
import { useGetAnnouncementsQuery } from "../../../../redux/features/announcements/announcementsApi";
import { config } from "../../../../config";
import { stripHtmlTags } from "../../../../lib/htmlContent";
import CardShell from "./CardShell";

type Announcement = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  date: string;
};

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB");
  } catch {
    return "";
  }
}

function initialsFromName(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "U";
  return n
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function RecentAnnouncementsCard() {

  const { data: announcements, isLoading } = useGetAnnouncementsQuery(undefined);


  const displayAnnouncements = announcements?.data?.slice(0, 5);

  
  return (
    <CardShell
      title="Recent Announcements"
      right={
        <Link
          to="/announcements"
          className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-300"
        >
          View all →
        </Link>
      }
    >
      <div className="space-y-3">
        {displayAnnouncements?.map((a: any) => {
          const rawPreview = a.body ?? a.description ?? a.subtitle ?? "";
          const previewText = stripHtmlTags(rawPreview);

          return (
          <div
            key={a.id}
            className="flex items-start justify-between gap-4 rounded-xl px-1 py-2"
          >
            <div className="flex min-w-0 items-start gap-3">
              {a?.university?.UniversityLogo?.url ? (
                <img
                  src={`${config.image_access_url}${a.university.UniversityLogo.url}`}
                  alt={a?.university?.name ?? "University"}
                  className="mt-1 h-10 w-10 shrink-0 rounded-full object-cover bg-gray-100 dark:bg-gray-800"
                  loading="lazy"
                />
              ) : (
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {initialsFromName(a?.university?.name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {a.title}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {`${previewText.slice(0, 100)}${previewText.length > 100 ? "..." : ""}`}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <span className="inline-flex rounded-full bg-[#E9F2EB] px-2 py-0.5 text-[10px] font-semibold text-[#237D3B] dark:bg-emerald-950/30 dark:text-emerald-300">
                {a.category ?? a.type ?? "UPDATE"}
              </span>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                {formatDate(a.createdAt) || a.intakeYear || ""}
              </p>
            </div>
          </div>
          );
        })}
      </div>
    </CardShell>
  );
}

