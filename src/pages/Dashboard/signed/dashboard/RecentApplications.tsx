import { FileText, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetMyAllApplicationsQuery } from "../../../../redux/features/application/applicationApi";
import { getApiImageUrl } from "../../../../utils/getApiImageUrl";
import Panel from "./Panel";
import { humanizeStatus, statusColor } from "./tokens";

type AppRow = {
  id: string;
  applicationId?: string;
  status?: string;
  intake?: string;
  createdAt?: string;
  course?: {
    university?: { name?: string; UniversityLogo?: { url?: string } };
    course?: { name?: string };
  };
};

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function StatusBadge({ status }: { status?: string }) {
  const color = statusColor(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {humanizeStatus(status)}
    </span>
  );
}

export default function RecentApplications() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetMyAllApplicationsQuery({
    page: 1,
    limit: 6,
  });

  const rows: AppRow[] = data?.data ?? [];

  return (
    <Panel
      title="Recent Applications"
      subtitle="Latest student submissions"
      icon={<FileText className="h-[18px] w-[18px]" aria-hidden />}
      accent="#2563eb"
      flush
      action={
        <button
          type="button"
          onClick={() => navigate("/applications")}
          className="rounded-[6px] px-2.5 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10"
        >
          View all
        </button>
      }
    >
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-3 rounded-[6px] border border-neutral-100 p-3 dark:border-white/5"
              >
                <div className="h-9 w-9 rounded-[6px] bg-neutral-100 dark:bg-neutral-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-40 rounded bg-neutral-100 dark:bg-neutral-800" />
                  <div className="h-2.5 w-24 rounded bg-neutral-100 dark:bg-neutral-800" />
                </div>
                <div className="h-5 w-16 rounded-full bg-neutral-100 dark:bg-neutral-800" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <GraduationCap className="mb-2 h-9 w-9 text-neutral-300 dark:text-neutral-600" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No applications submitted yet.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:border-white/5 dark:text-neutral-500">
                <th className="px-4 py-2.5 font-semibold">University</th>
                <th className="px-4 py-2.5 font-semibold">Program</th>
                <th className="px-4 py-2.5 font-semibold">Intake</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 text-right font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const logo = r.course?.university?.UniversityLogo?.url;
                const uniName = r.course?.university?.name ?? "N/A";
                return (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/applications/${r.id}`)}
                    className="cursor-pointer border-b border-neutral-50 transition-colors last:border-0 hover:bg-neutral-50/80 dark:border-white/5 dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-neutral-100 text-[10px] font-semibold text-neutral-500 dark:bg-neutral-800">
                          {logo ? (
                            <img
                              src={getApiImageUrl(logo)}
                              alt={uniName}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            uniName.slice(0, 2).toUpperCase()
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="max-w-[160px] truncate font-medium text-neutral-900 dark:text-white">
                            {uniName}
                          </p>
                          {r.applicationId ? (
                            <p className="text-[11px] text-neutral-400">
                              #{r.applicationId}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block max-w-[160px] truncate text-neutral-600 dark:text-neutral-300">
                        {r.course?.course?.name ?? "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                      {r.intake ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-500 dark:text-neutral-400">
                      {fmtDate(r.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Panel>
  );
}
