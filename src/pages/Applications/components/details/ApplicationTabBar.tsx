import clsx from "clsx";
import { ClipboardList, FileText, StickyNote } from "lucide-react";

export type ApplicationTabKey = "requirements" | "records" | "notes";

const TABS: {
  key: ApplicationTabKey;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "requirements",
    label: "Documents",
    icon: <ClipboardList size={15} />,
  },
  {
    key: "records",
    label: "Student Records",
    icon: <FileText size={15} />,
  },
  {
    key: "notes",
    label: "Notes",
    icon: <StickyNote size={15} />,
  },
];

type ApplicationTabBarProps = {
  activeTab: ApplicationTabKey;
  onChange: (tab: ApplicationTabKey) => void;
};

const ApplicationTabBar = ({ activeTab, onChange }: ApplicationTabBarProps) => {
  return (
    <div className="rounded-md border border-neutral-200/80 bg-white p-1.5 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:gap-1.5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={clsx(
                "inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition",
                isActive
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
              )}
            >
              {tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationTabBar;
