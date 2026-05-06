import CardShell from "./CardShell";
import { PartnerDashboardTeamMember } from "../../../../redux/features/profile/partnerProfileApi";
import { Users } from "lucide-react";

export default function TeamMembersCard({
  teamMembers,
  isLoading,
}: {
  teamMembers: PartnerDashboardTeamMember[];
  isLoading: boolean;
}) {
  return (
    <CardShell title="Team Members" titleIcon={<Users className="h-5 w-5" aria-hidden />}>
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3 animate-pulse">
              <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-1">
                <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-32 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            </div>
          ))
        ) : teamMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Users className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              There are no team members yet.
            </p>
          </div>
        ) : (
          teamMembers.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {m.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {m.fullName}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {m.email}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </CardShell>
  );
}

