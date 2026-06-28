// import { PlusOutlined } from "@ant-design/icons";
// import { Button } from "antd";
// import { ArrowUpRight, CalendarDays, Sparkles } from "lucide-react";
// import { PartnerDashboardTopStats } from "../../../../redux/features/profile/partnerProfileApi";

// function greeting(): string {
//   const h = new Date().getHours();
//   if (h < 12) return "Good morning";
//   if (h < 17) return "Good afternoon";
//   return "Good evening";
// }

// function todayLabel(): string {
//   return new Date().toLocaleDateString("en-GB", {
//     weekday: "long",
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   });
// }

// export default function WelcomeHero({
//   userName,
//   topStats,
//   isLoading,
//   onAddStudent,
//   onNewApplication,
// }: {
//   userName: string;
//   topStats?: PartnerDashboardTopStats;
//   isLoading: boolean;
//   onAddStudent: () => void;
//   onNewApplication: () => void;
// }) {
//   const firstName = userName.split(" ")[0] || userName;

//   const micro = [
//     { label: "Active students", value: topStats?.active_students ?? 0 },
//     { label: "Applications", value: topStats?.applications_total ?? 0 },
//     { label: "Pending tasks", value: topStats?.tasks_pending ?? 0 },
//   ];

//   return (
//     <div className="relative overflow-hidden rounded-[6px] border border-primary-700/20 bg-[linear-gradient(120deg,#19592a_0%,#237d3b_48%,#2f9b50_100%)] px-5 py-6 text-white shadow-[0_8px_30px_rgba(25,89,42,0.25)] sm:px-7 sm:py-7">
//       {/* Decorative glow shapes */}
//       <div
//         aria-hidden
//         className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"
//       />
//       <div
//         aria-hidden
//         className="pointer-events-none absolute -bottom-24 right-32 h-56 w-56 rounded-full bg-emerald-300/10 blur-2xl"
//       />
//       <div
//         aria-hidden
//         className="pointer-events-none absolute inset-0 opacity-[0.07]"
//         style={{
//           backgroundImage:
//             "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
//           backgroundSize: "22px 22px",
//         }}
//       />

//       <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
//         <div className="min-w-0">
//           <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
//             <CalendarDays className="h-3.5 w-3.5" aria-hidden />
//             {todayLabel()}
//           </div>

//           <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
//             {greeting()}, {firstName}
//             <span className="ml-1 inline-block">👋</span>
//           </h1>
//           <p className="mt-1.5 max-w-xl text-sm text-white/80">
//             Here's what's happening across your students, applications and team
//             today. Stay on top of every opportunity.
//           </p>

//           <div className="mt-5 flex flex-wrap items-center gap-3">
//             <Button
//               type="primary"
//               size="large"
//               icon={<PlusOutlined />}
//               onClick={onAddStudent}
//               className="!h-10 !rounded-[6px] !border-none !bg-white !font-semibold !text-primary-700 !shadow-sm hover:!bg-emerald-50"
//             >
//               Add Student
//             </Button>
//             <button
//               type="button"
//               onClick={onNewApplication}
//               className="inline-flex h-10 items-center gap-1.5 rounded-[6px] border border-white/30 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
//             >
//               New Application
//               <ArrowUpRight className="h-4 w-4" aria-hidden />
//             </button>
//           </div>
//         </div>

//         {/* Micro-stats card */}
//         <div className="grid shrink-0 grid-cols-3 gap-3 rounded-[6px] border border-white/15 bg-white/10 p-3 backdrop-blur-sm sm:gap-5 sm:p-4 lg:min-w-[330px]">
//           {micro.map((m) => (
//             <div key={m.label} className="px-1 text-center sm:px-2">
//               <div className="flex items-center justify-center gap-1">
//                 <Sparkles className="h-3.5 w-3.5 text-emerald-200" aria-hidden />
//                 <span className="text-2xl font-bold leading-none tabular-nums sm:text-[26px]">
//                   {isLoading ? "—" : m.value}
//                 </span>
//               </div>
//               <p className="mt-1.5 text-[11px] font-medium leading-tight text-white/70">
//                 {m.label}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }



import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import {
  ArrowUpRight,
  CalendarDays,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { PartnerDashboardTopStats } from "../../../../redux/features/profile/partnerProfileApi";

function greeting(): string {
  const h = new Date().getHours();

  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";

  return "Good evening";
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function WelcomeHero({
  userName,
  topStats,
  isLoading,
  onAddStudent,
  onNewApplication,
}: {
  userName: string;
  topStats?: PartnerDashboardTopStats;
  isLoading: boolean;
  onAddStudent: () => void;
  onNewApplication: () => void;
}) {
  const firstName = userName.split(" ")[0] || userName;

  const micro = [
    {
      label: "Active Students",
      value: topStats?.active_students ?? 0,
      icon: GraduationCap,
    },
    {
      label: "Applications",
      value: topStats?.applications_total ?? 0,
      icon: TrendingUp,
    },
    {
      label: "Pending Tasks",
      value: topStats?.tasks_pending ?? 0,
      icon: Sparkles,
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-[6px] border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:p-8">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-transparent to-emerald-50 dark:from-primary-950/20 dark:to-emerald-950/20" />

      <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-primary-100/40 blur-3xl dark:bg-primary-900/10" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Content */}
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 rounded-[6px] border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            <CalendarDays className="h-3.5 w-3.5" />
            {todayLabel()}
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {greeting()}, {firstName} 👋
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            Monitor student progress, manage applications, and stay on top of
            upcoming opportunities from one unified workspace.
          </p>

          {/* <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={onAddStudent}
              className="!h-10 !rounded-[6px] !font-semibold"
            >
              Add Student
            </Button>

            <button
              type="button"
              onClick={onNewApplication}
              className="inline-flex h-10 items-center gap-2 rounded-[6px] border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              New Application
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div> */}
        </div>

        {/* Right Analytics Card */}
        {/* <div className="grid w-full max-w-md grid-cols-3 gap-3">
          {micro.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-[6px] border border-neutral-200 bg-white p-4 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-[6px] bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <Icon className="h-4 w-4" />
                </div>

                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {isLoading ? "—" : item.value}
                </h3>

                <p className="mt-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div> */}
      </div>
    </div>
  );
}