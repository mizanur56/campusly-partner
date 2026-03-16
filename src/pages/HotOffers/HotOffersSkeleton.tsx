import { Skeleton } from "antd";

export default function HotOffersSkeleton() {
  return (
    <div className="space-y-8 pb-8">
      {/* Country tabs */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton.Button key={i} active className="!h-10 !w-28 !rounded-full" />
        ))}
      </div>

      {/* Focus Institution */}
      <section>
        <Skeleton.Input active className="!mb-1 !h-6 !w-48 !min-w-0" />
        <Skeleton.Input active className="!mb-4 !h-4 !w-72 !min-w-0" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-[24px] border border-neutral-100 bg-white overflow-hidden"
            >
              <Skeleton.Image active className="!aspect-[3/2] !w-full !min-h-[120px]" />
              <div className="p-3 md:p-4">
                <Skeleton.Input active className="!mb-2 !h-5 !w-full !min-w-0" />
                <Skeleton.Input active className="!mb-1 !h-4 !w-20 !min-w-0" />
                <Skeleton.Input active className="!h-4 !w-24 !min-w-0" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Intakes */}
      <section>
        <Skeleton.Input active className="!mb-1 !h-6 !w-56 !min-w-0" />
        <Skeleton.Input active className="!mb-4 !h-4 !w-80 !min-w-0" />
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton.Button key={i} active className="!h-10 !w-24 !rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border border-neutral-100 bg-white p-4">
              <Skeleton.Avatar active size={56} shape="square" className="!rounded-lg" />
              <Skeleton.Input active className="!h-5 !flex-1 !min-w-0" />
            </div>
          ))}
        </div>
      </section>

      {/* Program Spotlight */}
      <section>
        <Skeleton.Input active className="!mb-1 !h-6 !w-52 !min-w-0" />
        <Skeleton.Input active className="!mb-4 !h-4 !w-64 !min-w-0" />
        <div className="rounded-[24px] border border-neutral-100 bg-white p-5 md:p-6">
          <div className="flex items-start gap-3 mb-4">
            <Skeleton.Avatar active size={48} shape="square" className="!rounded-xl" />
            <div className="flex-1">
              <Skeleton.Input active className="!mb-2 !h-5 !w-[75%] !min-w-0" />
              <Skeleton.Input active className="!h-4 !w-1/2 !min-w-0" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-neutral-50 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} active title={{ width: 60 }} paragraph={false} />
            ))}
          </div>
          <Skeleton.Button active className="!h-10 !w-28 !rounded-lg" />
        </div>
      </section>

      {/* Services */}
      <section>
        <Skeleton.Input active className="!mb-1 !h-6 !w-40 !min-w-0" />
        <Skeleton.Input active className="!mb-4 !h-4 !w-72 !min-w-0" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-[24px] border border-neutral-100 bg-white overflow-hidden"
            >
              <Skeleton.Image active className="!aspect-[3/2] !w-full !min-h-[100px]" />
              <div className="p-3 md:p-4">
                <Skeleton.Input active className="!mb-2 !h-5 !w-full !min-w-0" />
                <Skeleton.Input active className="!mb-3 !h-4 !w-20 !min-w-0" />
                <Skeleton.Button active className="!h-9 !w-full !rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className="rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50">
        <div className="flex flex-col md:flex-row min-h-[140px]">
          <div className="flex-1 p-5 md:p-6 flex flex-col justify-center gap-2">
            <Skeleton.Input active className="!h-7 !w-48 !min-w-0" />
            <Skeleton.Input active className="!h-4 !w-full !max-w-md !min-w-0" />
            <Skeleton.Input active className="!h-4 !w-[75%] !max-w-sm !min-w-0" />
            <Skeleton.Button active className="!mt-2 !h-10 !w-32 !rounded-lg" />
          </div>
          <div className="w-full md:w-[280px] shrink-0 h-40 md:h-auto md:min-h-[140px]">
            <Skeleton.Image active className="!h-full !w-full !min-h-[140px]" />
          </div>
        </div>
      </section>
    </div>
  );
}
