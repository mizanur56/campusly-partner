import { Clock, DollarSign, FileText, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import SocialShare from "../../../components/common/Shared/SocialShare";

const iconMap: Record<string, ReactNode> = {
  "upcoming intake": <Clock className="h-7 w-7 text-[#20242A] md:h-8 md:w-8" />,
  "english requirement": <FileText className="h-7 w-7 text-[#20242A] md:h-8 md:w-8" />,
  "tuition fee": <DollarSign className="h-7 w-7 text-[#20242A] md:h-8 md:w-8" />,
};

const getIcon = (label: string) => {
  const normalized = label.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (normalized.includes(key)) return icon;
  }
  return <MapPin className="h-7 w-7 text-[#20242A] md:h-8 md:w-8" />;
};

export default function UniversitySidebar({
  sidebarInfo,
  shareUrl,
  universityName,
}: {
  sidebarInfo: Array<{ label: string; value: string }>;
  shareUrl?: string;
  universityName?: string;
}) {
  return (
    <div className="w-full md:w-[406px]">
      <aside className="sticky top-30 flex flex-col gap-6">
        <div className="flex flex-col gap-6 rounded-lg border border-primary-border bg-white p-6 md:p-8">
          <div className="flex flex-col gap-6">
            {sidebarInfo.map((info, index) => (
              <div key={index} className="flex w-full items-start gap-4">
                <div className="mt-0.5 shrink-0">{getIcon(info.label)}</div>
                <div className="flex-1">
                  <p className="mb-1 text-[14px] text-[#4B5563]">{info.label}</p>
                  <p className="text-[16px] font-semibold text-[#20242A] md:text-[18px]">{info.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {shareUrl ? (
          <div className="mt-2">
            <h1 className="mb-2 text-[20px] font-semibold text-[#20242A] md:text-[24px]">Share</h1>
            <SocialShare url={shareUrl} title={universityName} />
          </div>
        ) : null}
      </aside>
    </div>
  );
}
