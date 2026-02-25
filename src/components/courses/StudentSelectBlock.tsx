import React, { useState, useRef, useEffect } from "react";
import SelectedStudentCard, {
  type SelectedStudent,
} from "./SelectedStudentCard";

export const DUMMY_STUDENTS: SelectedStudent[] = [
  {
    id: "1",
    name: "Md Abdul Khalak",
    email: "md.abdulkhalakfgvc1999@gmail.com",
  },
  {
    id: "2",
    name: "Md Abdul Khaliq",
    email: "abdul.khaliq@example.com",
  },
  {
    id: "3",
    name: "Tareeq Mahmud",
    email: "tareeq.mahmud@example.com",
  },
  {
    id: "4",
    name: "Fatima Rahman",
    email: "fatima.rahman@example.com",
  },
  {
    id: "5",
    name: "Hassan Ahmed",
    email: "hassan.ahmed@example.com",
  },
];

interface StudentSelectBlockProps {
  selectedStudent: SelectedStudent | null;
  onSelect: (student: SelectedStudent | null) => void;
}

export default function StudentSelectBlock({
  selectedStudent,
  onSelect,
}: StudentSelectBlockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (selectedStudent) {
    return (
      <SelectedStudentCard
        student={selectedStudent}
        onRemove={() => onSelect(null)}
      />
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50/80 p-3.5 text-left hover:border-primary-300 hover:bg-primary-50/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex w-8 h-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </span>
          <div>
            <span className="font-medium text-sm text-gray-900">
              Select Student
            </span>
            <p className="text-xs text-gray-500 mt-0.5">
              We&apos;ll pre-fill the data from their profile.
            </p>
          </div>
          <svg
            className={`ml-auto w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1.5 w-full rounded-lg border border-gray-200 bg-white py-1 max-h-52 overflow-y-auto no-scrollbar">
          {DUMMY_STUDENTS.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => {
                onSelect(student);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2.5 text-left hover:bg-primary-50/80 flex items-center gap-3 transition-colors rounded-md mx-1"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                <img
                  src={`https://i.pravatar.cc/80?u=${student.id}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {student.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{student.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
