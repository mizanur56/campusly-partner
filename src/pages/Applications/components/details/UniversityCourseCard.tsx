import { ArrowRight, Building2 } from "lucide-react";

type DetailField = {
  label: string;
  value?: string;
};

type UniversityCourseCardProps = {
  fields: DetailField[];
  onViewProgram?: () => void;
  showViewProgram?: boolean;
};

const UniversityCourseCard = ({
  fields,
  onViewProgram,
  showViewProgram = true,
}: UniversityCourseCardProps) => {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <Building2 size={16} />
          </div>
          <h2 className="text-base font-semibold text-neutral-900">
            University &amp; Program Details
          </h2>
        </div>

        {showViewProgram && onViewProgram && (
          <button
            type="button"
            onClick={onViewProgram}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
          >
            View Program Details
            <ArrowRight size={15} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <div
            key={field.label}
            className="rounded-xl border border-neutral-100 bg-neutral-50/50 px-4 py-3.5"
          >
            <p className="text-xs font-medium text-neutral-500">{field.label}</p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">
              {field.value || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UniversityCourseCard;
