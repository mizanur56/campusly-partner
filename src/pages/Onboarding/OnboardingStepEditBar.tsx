import { X } from "lucide-react";
import { FiEdit } from "react-icons/fi";

const editIconClass = "h-4 w-4 shrink-0 text-[#237D3B]";
const cancelIconClass =
  "h-4 w-4 shrink-0 text-red-600 dark:text-red-400";

const actionBtnClass =
  "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-[13px] font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:ring-offset-neutral-900";

export function OnboardingStepEditBar({
  show,
  isEditing,
  onEdit,
  onCancel,
  className = "",
}: {
  show: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  /** e.g. mb-0 when placed in a flex header row */
  className?: string;
}) {
  if (!show) return null;

  return (
    <div className={`mb-2 mr-2 flex justify-end ${className}`.trim()}>
      {isEditing ? (
        <button
          type="button"
          onClick={onCancel}
          className={actionBtnClass}
          aria-label="Cancel editing"
        >
          <X className={cancelIconClass} strokeWidth={2} aria-hidden />
          Cancel
        </button>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className={actionBtnClass}
          aria-label="Edit this step"
        >
          <FiEdit className={editIconClass} aria-hidden />
          Edit
        </button>
      )}
    </div>
  );
}
