import { Skeleton } from "antd";

interface Props {
  /** Optional: approximate number of rows/sections to render */
  rows?: number;
}

export default function OnboardingFormSkeleton({ rows = 3 }: Props) {
  return (
    <div className="space-y-6">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Skeleton.Input active className="!h-10 !w-full !rounded-lg" />
          </div>
          <div>
            <Skeleton.Input active className="!h-10 !w-full !rounded-lg" />
          </div>
        </div>
      ))}
      <div className="mt-8 flex justify-end gap-3">
        <Skeleton.Button active className="!h-9 !w-24 !rounded-full" />
        <Skeleton.Button active className="!h-9 !w-28 !rounded-full" />
      </div>
    </div>
  );
}

