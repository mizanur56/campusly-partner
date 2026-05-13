/** Partner: Upload Documents tab skeletons (Tailwind-only). */

function PulseCardRow() {
  return (
    <div className="p-3 border border-gray-200 flex justify-between items-center rounded-md animate-pulse bg-white">
      <div className="flex flex-col gap-2">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-100 rounded w-24" />
      </div>
      <div className="h-6 w-6 shrink-0 bg-gray-200 rounded" />
    </div>
  );
}

export function PersonalDocumentsSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <PulseCardRow />
      <PulseCardRow />
      <PulseCardRow />
    </div>
  );
}

export function AcademicCertificatesSectionSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1].map((block) => (
        <div key={block} className="mb-6 last:mb-0">
          <div className="h-3 bg-gray-200 rounded w-36 mb-3 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PulseCardRow />
            <PulseCardRow />
          </div>
        </div>
      ))}
    </div>
  );
}
