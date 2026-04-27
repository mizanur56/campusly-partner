import React from "react";

export interface SelectedStudent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface SelectedStudentCardProps {
  student: SelectedStudent | null;
  onRemove?: () => void;
}

const DEFAULT_AVATAR = "/user.png";

export default function SelectedStudentCard({
  student,
  onRemove,
}: SelectedStudentCardProps) {
  if (!student) return null;

  const avatarSrc = student.avatar?.trim() ? student.avatar : DEFAULT_AVATAR;

  return (
    <div className="rounded-lg border border-primary-200 bg-primary-50/40 p-3">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden bg-gray-100">
          <img
            src={avatarSrc}
            alt={student.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-gray-900 truncate">
            {student.name}
          </p>
          <p className="text-xs text-gray-500 truncate">{student.email}</p>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex-shrink-0 w-7 h-7 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
            aria-label="Remove student"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
