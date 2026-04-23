import CardShell from "./CardShell";
import { PartnerDashboardSubject } from "../../../../redux/features/profile/partnerProfileApi";

export default function TopSubjectsCard({
  subjects,
  isLoading,
}: {
  subjects: PartnerDashboardSubject[];
  isLoading: boolean;
}) {
  return (
    <CardShell
      title="Courses"
      right={
        <button
          type="button"
          className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-300"
        >
          View all →
        </button>
      }
    >
      <div className="space-y-2">
        {isLoading && subjects.length === 0
          ? Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800 animate-pulse"
              >
                <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            ))
          : subjects.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800"
              >
                <p className="min-w-0 truncate text-sm font-medium text-gray-900 dark:text-white">
                  {c.name}
                </p>
                {/* <p className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                  {c.applicationCount}
                </p> */}
              </div>
            ))}

        {!isLoading && subjects.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No course data yet.
          </p>
        )}
      </div>
    </CardShell>
  );
}

