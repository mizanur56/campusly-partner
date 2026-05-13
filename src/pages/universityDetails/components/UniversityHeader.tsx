import type { BreadcrumbItem } from "../../../types/course";
import PageBreadcrumbs from "./PageBreadcrumbs";

interface UniversityHeaderProps {
  data: { name: string; country: string; logo: string };
  breadcrumbs?: BreadcrumbItem[];
}

export default function UniversityHeader({ data, breadcrumbs }: UniversityHeaderProps) {
  return (
    <header className="space-y-6">
      {breadcrumbs ? <PageBreadcrumbs items={breadcrumbs} /> : null}
      <div className="relative flex w-full flex-col items-start justify-between gap-6 md:flex-row md:items-center md:gap-0">
        <div className="relative flex flex-1 items-center gap-4">
          <img className="relative h-16 w-16 rounded-full object-cover md:h-20 md:w-20" alt={`${data.name} logo`} src={data.logo} />
          <div className="flex flex-1 flex-col items-start justify-center gap-1 md:gap-2">
            <h1 className="text-[26px] font-semibold text-[#20242A] md:text-[30px]">{data.name}</h1>
            <p className="text-[16px] text-[#4B5563] md:text-[18px]">{data.country}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
