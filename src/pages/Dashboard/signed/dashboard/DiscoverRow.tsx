import { BookMarked, Building2, Globe2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  PartnerDashboardDestination,
  PartnerDashboardSubject,
  PartnerDashboardUniversity,
} from "../../../../redux/features/profile/partnerProfileApi";
import { getApiImageUrl } from "../../../../utils/getApiImageUrl";
import Panel from "./Panel";
import { accents } from "./tokens";

function rankColor(i: number) {
  return ["#237d3b", "#2563eb", "#7c3aed", "#0d9488", "#f59e0b"][i] ?? "#94a3b8";
}

function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3">
          <div className="h-9 w-9 rounded-[6px] bg-neutral-100 dark:bg-neutral-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-2.5 w-20 rounded bg-neutral-100 dark:bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
      {text}
    </p>
  );
}

export default function DiscoverRow({
  universities,
  subjects,
  destinations,
  isLoading,
}: {
  universities: PartnerDashboardUniversity[];
  subjects: PartnerDashboardSubject[];
  destinations: PartnerDashboardDestination[];
  isLoading: boolean;
}) {
  const navigate = useNavigate();
  const maxSubject = Math.max(1, ...subjects.map((s) => s.applicationCount || 0));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Popular universities */}
      <Panel
        title="Popular Universities"
        subtitle="Most applied destinations"
        icon={<Building2 className="h-[18px] w-[18px]" aria-hidden />}
        accent={accents.green}
        action={
          <button
            type="button"
            onClick={() => navigate("/programs-schools")}
            className="rounded-[6px] px-2.5 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10"
          >
            Explore
          </button>
        }
      >
        {isLoading && universities.length === 0 ? (
          <ListSkeleton />
        ) : universities.length === 0 ? (
          <EmptyState text="No university data yet." />
        ) : (
          <ul className="space-y-2.5">
            {universities.slice(0, 5).map((u, i) => (
              <li key={u.id} className="flex items-center gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-[11px] font-bold text-white"
                  style={{ backgroundColor: rankColor(i) }}
                >
                  {i + 1}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-neutral-100 text-[10px] font-semibold text-neutral-500 dark:bg-neutral-800">
                  {u.logoUrl ? (
                    <img
                      src={getApiImageUrl(u.logoUrl)}
                      alt={u.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    u.name.slice(0, 2).toUpperCase()
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-white">
                    {u.name}
                  </p>
                  <p className="truncate text-[11px] text-neutral-400">
                    {u.countryName}
                  </p>
                </div>
                {u.applicationCount ? (
                  <span className="shrink-0 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-400">
                    {u.applicationCount}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Popular programs */}
      <Panel
        title="Popular Programs"
        subtitle="Top courses by demand"
        icon={<BookMarked className="h-[18px] w-[18px]" aria-hidden />}
        accent={accents.violet}
      >
        {isLoading && subjects.length === 0 ? (
          <ListSkeleton />
        ) : subjects.length === 0 ? (
          <EmptyState text="No program data yet." />
        ) : (
          <ul className="space-y-3.5">
            {subjects.slice(0, 5).map((s) => {
              const pct = Math.round(
                ((s.applicationCount || 0) / maxSubject) * 100,
              );
              return (
                <li key={s.id}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-[13px] font-medium text-neutral-800 dark:text-neutral-200">
                      {s.name}
                    </p>
                    <span className="shrink-0 text-[11px] font-semibold text-neutral-400">
                      {s.applicationCount || 0}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.max(pct, 6)}%`,
                        background:
                          "linear-gradient(90deg,#7c3aed,#a855f7)",
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {/* Top destinations */}
      <Panel
        title="Top Destinations"
        subtitle="Where students are heading"
        icon={<Globe2 className="h-[18px] w-[18px]" aria-hidden />}
        accent={accents.teal}
      >
        {isLoading && destinations.length === 0 ? (
          <ListSkeleton />
        ) : destinations.length === 0 ? (
          <EmptyState text="No destination data yet." />
        ) : (
          <ul className="space-y-2.5">
            {destinations.slice(0, 5).map((d) => (
              <li key={d.id} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-500 dark:bg-neutral-800">
                  {d.imageUrl ? (
                    <img
                      src={getApiImageUrl(d.imageUrl)}
                      alt={d.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    d.code || d.name.slice(0, 2).toUpperCase()
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-neutral-800 dark:text-neutral-200">
                  {d.name}
                </span>
                <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                  #{d.priority ?? 0}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
