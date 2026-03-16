import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import {
  useGetPartnerDashboardQuery,
  Advisor,
  PartnerDashboardDestination,
  PartnerDashboardUniversity,
  PartnerDashboardSubject,
} from "../../redux/features/profile/partnerProfileApi";
import { getApiImageUrl } from "../../utils/getApiImageUrl";
import CreateStudentModal from "../../components/common/Modals/CreateStudentModal";

const KPI_CONFIG = [
  {
    key: "tasks_pending",
    label: "Tasks",
    sub: "Pending tasks",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    key: "applications_total",
    label: "Applications",
    sub: "Total submissions",
    color:
      "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    key: "accepted_applications",
    label: "Accepted",
    sub: "Approved applications",
    color:
      "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    key: "rejected_applications",
    label: "Rejected",
    sub: "Declined applications",
    color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  {
    key: "active_students",
    label: "Students",
    sub: "Active students",
    color:
      "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
] as const;

export default function SignedDashboardView() {
  const user = useSelector(selectCurrentUser);
  const userName = user?.name ?? "Partner User";
  const navigate = useNavigate();
  const [createStudentOpen, setCreateStudentOpen] = useState(false);
  const { data: dashboard, isLoading } = useGetPartnerDashboardQuery();

  const kpiCards = useMemo(
    () =>
      KPI_CONFIG.map((cfg) => {
        const value =
          (dashboard?.topStats as any)?.[cfg.key] !== undefined
            ? (dashboard?.topStats as any)?.[cfg.key]
            : 0;
        return { ...cfg, value };
      }),
    [dashboard],
  );

  const supportPanel: Advisor[] = dashboard?.supportPanel ?? [];
  const teamMembers = dashboard?.teamMembers ?? [];
  const topDestinations: PartnerDashboardDestination[] =
    dashboard?.topDestinations ?? [];
  const topUniversities: PartnerDashboardUniversity[] =
    dashboard?.topUniversities ?? [];
  const topSubjects: PartnerDashboardSubject[] = dashboard?.topSubjects ?? [];

  const handleCreateStudentSuccess = () => {
    navigate("/students");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] -mx-4 px-4 pb-8 pt-0 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
      <div className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">
            Welcome, {userName} !
          </h1>
          <button
            type="button"
            onClick={() => setCreateStudentOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            <span>+</span>
            <span>Add Student</span>
          </button>
        </div>
        <CreateStudentModal
          open={createStudentOpen}
          onClose={() => setCreateStudentOpen(false)}
          onSuccess={handleCreateStudentSuccess}
        />

        {/* KPI Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {isLoading
            ? KPI_CONFIG.map((kpi) => (
                <div
                  key={kpi.key}
                  className={`rounded-xl p-4 card-shadow ${kpi.color} animate-pulse`}
                >
                  <div className="h-6 w-16 rounded bg-white/60" />
                  <div className="mt-2 h-4 w-24 rounded bg-white/40" />
                </div>
              ))
            : kpiCards.map((kpi) => (
                <div
                  key={kpi.key}
                  className={`rounded-xl p-4 card-shadow ${kpi.color}`}
                >
                  <p className="text-xl font-semibold">
                    {kpi.value} {kpi.label}
                  </p>
                  <p className="mt-0.5 text-sm opacity-90">{kpi.sub}</p>
                </div>
              ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Your Support Panel */}
          <div className="rounded-[24px] border border-neutral-100 bg-white p-5 card-shadow dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Your Support Panel
            </h2>
            <div className="mt-4 space-y-4">
              {supportPanel.length === 0 && !isLoading && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No advisor assigned yet.
                </p>
              )}
              {isLoading && supportPanel.length === 0
                ? Array.from({ length: 2 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 animate-pulse"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-40 rounded bg-gray-100 dark:bg-gray-800" />
                      </div>
                    </div>
                  ))
                : supportPanel.map((person) => {
                    const initials = person.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("");
                    return (
                      <div key={person.id} className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {person.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Account manager
                          </p>
                          <div className="mt-2 flex gap-3">
                            {person.phone && (
                              <a
                                href={`tel:${person.phone.replace(/\s/g, "")}`}
                                className="text-xs text-primary-600 hover:underline"
                              >
                                Call
                              </a>
                            )}
                            <a
                              href={`mailto:${person.email}`}
                              className="text-xs text-primary-600 hover:underline"
                            >
                              Email
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Team Members */}
          <div className="rounded-[24px] border border-neutral-100 bg-white p-5 card-shadow dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Team Members
            </h2>
            <div className="mt-4 space-y-3">
              {isLoading && teamMembers.length === 0
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 animate-pulse"
                    >
                      <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="space-y-1">
                        <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-32 rounded bg-gray-100 dark:bg-gray-800" />
                      </div>
                    </div>
                  ))
                : teamMembers.map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {m.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {m.fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {m.email}
                        </p>
                      </div>
                    </div>
                  ))}
              {!isLoading && teamMembers.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No team members added yet.
                </p>
              )}
            </div>
          </div>

          {/* Destination */}
          <div className="rounded-[24px] border border-neutral-100 bg-white p-5 card-shadow dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Destination
            </h2>
            <div className="mt-4 space-y-2">
              {isLoading && topDestinations.length === 0
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between animate-pulse"
                    >
                      <span className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                      <span className="h-4 w-8 rounded bg-gray-100 dark:bg-gray-800" />
                    </div>
                  ))
                : topDestinations.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          {d.imageUrl ? (
                            <img
                              src={getApiImageUrl(d.imageUrl)}
                              alt={d.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                              {d.code || d.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {d.name}
                        </span>
                      </div>
                    </div>
                  ))}
              {!isLoading && topDestinations.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No destination data yet.
                </p>
              )}
            </div>
          </div>

          {/* Universities */}
          <div className="rounded-[24px] border border-neutral-100 bg-white p-5 card-shadow dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Universities
            </h2>
            <div className="mt-4 space-y-2">
              {isLoading && topUniversities.length === 0
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 animate-pulse"
                    >
                      <div className="h-8 w-8 shrink-0 rounded bg-gray-100 dark:bg-gray-800" />
                      <div className="space-y-1">
                        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                      </div>
                    </div>
                  ))
                : topUniversities.map((u) => (
                    <div key={u.id} className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        {u.logoUrl ? (
                          <img
                            src={getApiImageUrl(u.logoUrl)}
                            alt={u.name}
                            className="h-full w-full object-cover"
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
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {u.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {u.countryName}
                        </p>
                      </div>
                    </div>
                  ))}
              {!isLoading && topUniversities.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No university data yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Top Subjects / Courses */}
        <div className="mt-6 rounded-[24px] border border-neutral-100 bg-white p-5 card-shadow dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Top Subjects
            </h2>
          </div>
          <div className="mt-4 space-y-2">
            {isLoading && topSubjects.length === 0
              ? Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800 animate-pulse"
                  >
                    <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                ))
              : topSubjects.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {c.applicationCount} applications
                    </p>
                  </div>
                ))}
            {!isLoading && topSubjects.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No subject data yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
