import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";

const KPI_CARDS = [
  { label: "Tasks", value: "0", sub: "Pending tasks", color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { label: "Applications", value: "3", sub: "Total submissions", color: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  { label: "Accepted", value: "20", sub: "Approved applications", color: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { label: "Rejected", value: "10", sub: "Declined applications", color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  { label: "Students", value: "20", sub: "Active students", color: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
];

const SUPPORT_PANEL = [
  { name: "Ramesh Khadka", role: "Account manager (SRM)", phone: "+881787939155", email: "ramesh92@gmail.com", avatar: "RK" },
  { name: "Dipak Sharma", role: "Application team member", phone: "+881787939155", email: "dipak.s97@gmail.com", avatar: "DS" },
];

const ANNOUNCEMENTS = [
  { institution: "European College of Innovation", text: "Dear Team, Key points MOI for...", tag: "INSTITUTIONS UPDATES", date: "9/8/2025" },
  { institution: "Malita International College", text: "Dear Team, Key points MOI for...", tag: "INSTITUTIONS UPDATES", date: "9/6/2025" },
  { institution: "Uniplural Academy Ltd", text: "Dear Team, Key points MOI for...", tag: "INSTITUTIONS UPDATES", date: "9/6/2025" },
];

const TEAM_MEMBERS = [
  { name: "Suman Thapa", email: "suman@example.com" },
  { name: "Anish Maharjan", email: "anish@example.com" },
  { name: "Bikash Rai", email: "bikash@example.com" },
  { name: "Nirajan KC", email: "nirajan@example.com" },
  { name: "Aayush Bhandari", email: "aayush@example.com" },
];

const DESTINATIONS = [
  { country: "Malta", count: 450 },
  { country: "Hungary", count: 100 },
  { country: "United Kingdom", count: 15000 },
  { country: "United States", count: 500 },
  { country: "Canada", count: 300 },
];

const UNIVERSITIES = [
  { name: "ECI College", location: "Malta" },
  { name: "Think Talent Institution", location: "Malta" },
  { name: "Uniplural Academy Ltd", location: "Malta" },
  { name: "Macquarie University", location: "Australia" },
  { name: "Monash University", location: "Australia" },
];

const COURSES = [
  { course: "Level 5 Diploma in Information...", institution: "European College of Innovation" },
  { course: "Level 5 Diploma in Business..", institution: "European College of Innovation" },
];

export default function SignedDashboardView() {
  const user = useSelector(selectCurrentUser);
  const userName = user?.name ?? "Partner User";

  return (
    <div className="min-h-[calc(100vh-4rem)] -mx-4 px-4 pb-8 pt-0 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
      <div className="w-full">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">
          Welcome, {userName} !
        </h1>

        {/* KPI Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {KPI_CARDS.map((kpi) => (
            <div
              key={kpi.label}
              className={`rounded-xl p-4 ${kpi.color}`}
            >
              <p className="text-xl font-semibold">{kpi.value} {kpi.label}</p>
              <p className="mt-0.5 text-sm opacity-90">{kpi.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Your Support Panel */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Your Support Panel
            </h2>
            <div className="mt-4 space-y-4">
              {SUPPORT_PANEL.map((person) => (
                <div key={person.name} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {person.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{person.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{person.role}</p>
                    <div className="mt-2 flex gap-3">
                      <a href={`tel:${person.phone.replace(/\s/g, "")}`} className="text-xs text-primary-600 hover:underline">
                        Call
                      </a>
                      <a href={`mailto:${person.email}`} className="text-xs text-primary-600 hover:underline">
                        Email
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Recent Announcements
              </h2>
              <Link to="#" className="text-sm font-medium text-primary-600 hover:underline">
                View all →
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {ANNOUNCEMENTS.map((a) => (
                <div key={a.institution} className="flex gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    Logo
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.institution}</p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{a.text}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        {a.tag}
                      </span>
                      <span className="text-xs text-gray-400">{a.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Team Members */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Team Members
            </h2>
            <div className="mt-4 space-y-3">
              {TEAM_MEMBERS.map((m) => (
                <div key={m.name} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {m.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Destination */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Destination
            </h2>
            <div className="mt-4 space-y-2">
              {DESTINATIONS.map((d) => (
                <div key={d.country} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{d.country}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Universities */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Universities
            </h2>
            <div className="mt-4 space-y-2">
              {UNIVERSITIES.map((u) => (
                <div key={u.name} className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    Logo
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{u.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Courses
            </h2>
            <Link to="#" className="text-sm font-medium text-primary-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {COURSES.map((c, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{c.course}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{c.institution}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
