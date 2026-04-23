import CardShell from "./CardShell";
import { PartnerDashboardDestination } from "../../../../redux/features/profile/partnerProfileApi";
import { getApiImageUrl } from "../../../../utils/getApiImageUrl";

export default function DestinationCard({
  destinations,
  isLoading,
}: {
  destinations: PartnerDashboardDestination[];
  isLoading: boolean;
}) {
  return (
    <CardShell title="Destination">
      <div className="space-y-3">
        {isLoading && destinations.length === 0
          ? Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between animate-pulse"
              >
                <span className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                <span className="h-4 w-10 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            ))
          : destinations.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    {d.imageUrl ? (
                      <img
                        src={getApiImageUrl(d.imageUrl)}
                        alt={d.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                        {d.code || d.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="truncate text-gray-700 dark:text-gray-300">
                    {d.name}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                  {d.priority ?? 0}
                </span>
              </div>
            ))}

        {!isLoading && destinations.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No destination data yet.
          </p>
        )}
      </div>
    </CardShell>
  );
}

