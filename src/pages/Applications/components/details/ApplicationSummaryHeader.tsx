import { Image } from "antd";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Hash,
  RefreshCw,
  User,
} from "lucide-react";

type MetaItem = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

type ApplicationSummaryHeaderProps = {
  universityName?: string;
  universityLogoUrl?: string;
  programName?: string;
  statusLabel: string;
  statusClassName: string;
  metaItems: MetaItem[];
  onRefresh: () => void;
  isRefreshing: boolean;
};

const ApplicationSummaryHeader = ({
  universityName,
  universityLogoUrl,
  programName,
  statusLabel,
  statusClassName,
  metaItems,
  onRefresh,
  isRefreshing,
}: ApplicationSummaryHeaderProps) => {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {universityLogoUrl ? (
            <Image
              src={universityLogoUrl}
              alt={universityName ?? "University"}
              width={56}
              height={56}
              preview={false}
              className="!h-14 !w-14 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-50">
              <GraduationCap className="h-7 w-7 text-primary-600" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-500">
              {universityName || "—"}
            </p>
            <h1 className="mt-0.5 text-lg font-semibold leading-snug text-neutral-900 sm:text-xl">
              {programName || "—"}
            </h1>
            <div className="mt-2.5">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClassName}`}
              >
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={isRefreshing ? "animate-spin" : ""}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-neutral-100 pt-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metaItems.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-neutral-500">{item.label}</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-neutral-900">
                {item.value || "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const summaryMetaIcons = {
  applicationId: <Hash size={16} />,
  modeOfStudy: <BookOpen size={16} />,
  intake: <Calendar size={16} />,
  student: <User size={16} />,
  studyType: <GraduationCap size={16} />,
};

export default ApplicationSummaryHeader;
