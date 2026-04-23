import CardShell from "./CardShell";
import { PartnerDashboardUniversity } from "../../../../redux/features/profile/partnerProfileApi";
import { getApiImageUrl } from "../../../../utils/getApiImageUrl";

export default function UniversitiesCard({
  universities,
  isLoading,
}: {
  universities: PartnerDashboardUniversity[];
  isLoading: boolean;
}) {
  return (
    <CardShell title="Universities">
      <div className="space-y-3">
        {isLoading && universities.length === 0
          ? Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-2 animate-pulse">
                <div className="h-8 w-8 shrink-0 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="space-y-1">
                  <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            ))
          : universities.map((u) => (
              <div key={u.id} className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  {u.logoUrl ? (
                    <img
                      src={getApiImageUrl(u.logoUrl)}
                      alt={u.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-[10px] font-medium">
                      {u.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {u.name}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {u.countryName}
                  </p>
                </div>
              </div>
            ))}

        {!isLoading && universities.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No university data yet.
          </p>
        )}
      </div>
    </CardShell>
  );
}

