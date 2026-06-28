import {
  BookOpen,
  CreditCard,
  FilePlus2,
  LucideIcon,
  Megaphone,
  UserPlus,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Action = {
  label: string;
  desc: string;
  icon: LucideIcon;
  accent: string;
  onClick: () => void;
};

export default function QuickActions({
  onAddStudent,
}: {
  onAddStudent: () => void;
}) {
  const navigate = useNavigate();

  const actions: Action[] = [
    {
      label: "Add Student",
      desc: "Onboard a new student",
      icon: UserPlus,
      accent: "#237d3b",
      onClick: onAddStudent,
    },
    {
      label: "New Application",
      desc: "Start an application",
      icon: FilePlus2,
      accent: "#2563eb",
      onClick: () => navigate("/applications"),
    },
    {
      label: "Browse Programs",
      desc: "Explore universities",
      icon: BookOpen,
      accent: "#7c3aed",
      onClick: () => navigate("/programs-schools"),
    },
    {
      label: "Manage Tasks",
      desc: "Track your to-dos",
      icon: Users,
      accent: "#0d9488",
      onClick: () => navigate("/my-tasks"),
    },
    {
      label: "Announcements",
      desc: "Latest updates",
      icon: Megaphone,
      accent: "#f59e0b",
      onClick: () => navigate("/announcements"),
    },
    {
      label: "Payments",
      desc: "Commissions & invoices",
      icon: CreditCard,
      accent: "#e11d48",
      onClick: () => navigate("/payments/commission"),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            className="group flex items-center gap-3 rounded-[6px] border border-neutral-200/80 bg-white p-3 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_8px_20px_rgba(16,24,40,0.08)] dark:border-white/10 dark:bg-neutral-900 dark:hover:border-primary-500/40"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] transition-transform duration-200 group-hover:scale-105"
              style={{ backgroundColor: `${a.accent}14`, color: a.accent }}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-neutral-900 dark:text-white">
                {a.label}
              </p>
              <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                {a.desc}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
