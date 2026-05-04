import { Calendar, Clock, Building2, BookOpen } from "lucide-react";
import { cn } from "../../utils/cn";
import SocialShare from "../common/Shared/SocialShare";

interface SidebarInfo {
  tuitionFee: string;
  startDate: string;
  duration: string;
  campus: string;
  modeOfStudy: string;
}

interface CourseSidebarProps {
  info: SidebarInfo;
  className?: string;
  shareUrl?: string;
  courseTitle?: string;
}

export default function CourseSidebar({
  info,
  className,
  shareUrl,
  courseTitle,
}: CourseSidebarProps) {
  return (
    <aside className={cn("", className)}>
      <div className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6">
        {/* Tuition Fee */}
        <div className="flex flex-col gap-1">
          <p className="text-[14px] md:text-[14px] font-normal text-neutral-500">
            Tuition Fee
          </p>
          <p className="mt-1 text-[17px] md:text-[24px] font-semibold text-[#237D3B]">
            {info.tuitionFee}
          </p>
        </div>

        {/* Start Date */}
        <div className="flex items-start gap-3">
          <Calendar className="h-6 w-6 text-[#292F36]" />

          <div>
            <p className="text-[14px] md:text-[14px] font-normal text-neutral-500">
              Start date
            </p>
            <p className="mt-1 text-[17px] md:text-[18px] font-semibold text-neutral-900">
              {info.startDate}
            </p>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-start gap-3">
          <Clock className="h-6 w-6 text-[#292F36]" />

          <div>
            <p className="text-[14px] md:text-[14px] font-normal text-neutral-500">
              Duration
            </p>
            <p className="mt-1 text-[17px] md:text-[18px] font-semibold text-neutral-900">
              {info.duration}
            </p>
          </div>
        </div>

        {/* Campus */}
        <div className="flex items-start gap-3">
          <Building2 className="h-6 w-6 text-[#292F36] shrink-0" />

          <div>
            <p className="text-[14px] md:text-[14px] font-normal text-neutral-500">
              Campus
            </p>
            <p className="mt-1 text-[17px] md:text-[18px] font-semibold text-neutral-900 leading-relaxed">
              {info.campus}
            </p>
          </div>
        </div>

        {/* Mode of Study */}
        <div className="flex items-start gap-3">
          <BookOpen className="h-6 w-6 text-[#292F36]" />

          <div>
            <p className="text-[14px] md:text-[14px] font-normal text-neutral-500">
              Mode of study
            </p>
            <p className="mt-1 text-[17px] md:text-[18px] font-semibold text-neutral-900">
              {info.modeOfStudy}
            </p>
          </div>
        </div>
      </div>

      {/* Share Section */}
      {shareUrl && (
        <div className="pt-5">
          <h3 className="text-[22px] md:text-[24px] font-semibold text-neutral-900 mb-4">
            Share
          </h3>
          <div>
            <SocialShare url={shareUrl} title={courseTitle} />
          </div>
        </div>
      )}
    </aside>
  );
}
