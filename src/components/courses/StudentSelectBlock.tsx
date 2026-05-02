import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { config } from "../../config";
import { isPartnerStudentProfileComplete } from "../../lib/partnerStudentProfileGates";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import {
  useGetAllStudentsByPartnerIdQuery,
  useLazyGetStudentProfileQuery,
} from "../../redux/features/profile/studentProfileApi";
import { useGetStudentsWithActiveTasksQuery } from "../../redux/features/tasks/partnerTasksApi";
import { getApiImageUrl } from "../../utils/getApiImageUrl";
import SelectedStudentCard, {
  type SelectedStudent,
} from "./SelectedStudentCard";

const DEFAULT_STUDENT_AVATAR = "/user.png";

function resolvePartnerListStudentAvatar(
  record: Record<string, unknown>,
): string {
  const fromTopImage = getApiImageUrl(record.image as any);
  if (fromTopImage) return fromTopImage;

  const user = record.user as Record<string, unknown> | undefined;
  if (user) {
    const fromUserImage = getApiImageUrl(user.image as any);
    if (fromUserImage) return fromUserImage;
    const userPhoto = user.profile_photo;
    if (typeof userPhoto === "string" && userPhoto.trim()) {
      const u = getApiImageUrl(userPhoto);
      if (u) return u;
    }
  }

  const topPhoto = record.profile_photo;
  if (typeof topPhoto === "string" && topPhoto.trim()) {
    const u = getApiImageUrl(topPhoto);
    if (u) return u;
  }

  const imageId = record.imageId;
  if (imageId && config.image_access_url) {
    const base = String(config.image_access_url).replace(/\/$/, "");
    return `${base}/media/${String(imageId)}`;
  }

  return "";
}

type ListStudent = {
  id: string;
  name: string;
  email: string;
  /** Resolved image URL or `DEFAULT_STUDENT_AVATAR` */
  avatarSrc: string;
};

interface StudentSelectBlockProps {
  selectedStudent: SelectedStudent | null;
  onSelect: (student: SelectedStudent | null) => void;
}

export default function StudentSelectBlock({
  selectedStudent,
  onSelect,
}: StudentSelectBlockProps) {
  const user = useSelector(selectCurrentUser);
  const isTeamMember = user?.role === "PARTNER_TEAM_MEMBER";

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  /** Fetched full profiles for list rows that are not complete from list payload alone */
  const [fetchedProfileById, setFetchedProfileById] = useState<
    Record<string, unknown | null>
  >({});
  const [profilesResolving, setProfilesResolving] = useState(false);

  const [fetchProfile] = useLazyGetStudentProfileQuery();

  const {
    data: allStudents,
    isLoading: isPartnerLoading,
    isFetching: isPartnerFetching,
    isError: isPartnerError,
  } = useGetAllStudentsByPartnerIdQuery(
    { partnerId: user?.id as string },
    { skip: !user?.id },
  );

  const {
    data: assignedStudents = [],
    isLoading: isTeamLoading,
    isFetching: isTeamFetching,
    isError: isTeamError,
  } = useGetStudentsWithActiveTasksQuery(
    isTeamMember ? { assignedToMe: true } : undefined,
    { skip: !isTeamMember },
  );

  const sourceRecords = useMemo((): Record<string, unknown>[] => {
    return (allStudents?.data as Record<string, unknown>[]) || [];
  }, [allStudents?.data]);

  useEffect(() => {
    if (!isOpen) {
      setFetchedProfileById({});
      setProfilesResolving(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const raw = sourceRecords;
    if (!raw.length) {
      setFetchedProfileById({});
      setProfilesResolving(false);
      return;
    }

    const incomplete = raw.filter((r) => !isPartnerStudentProfileComplete(r));
    if (incomplete.length === 0) {
      setFetchedProfileById({});
      setProfilesResolving(false);
      return;
    }

    let cancelled = false;
    setFetchedProfileById({});
    setProfilesResolving(true);

    Promise.all(
      incomplete.map((r) =>
        fetchProfile(String(r.id))
          .unwrap()
          .then((data) => [String(r.id), data] as const)
          .catch(() => [String(r.id), null] as const),
      ),
    ).then((pairs) => {
      if (cancelled) return;
      const next: Record<string, unknown | null> = {};
      pairs.forEach(([id, data]) => {
        next[id] = data;
      });
      setFetchedProfileById(next);
      setProfilesResolving(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, sourceRecords, fetchProfile]);

  const studentsList: ListStudent[] = useMemo(() => {
    return sourceRecords
      .filter((r) => {
        const id = String(r.id);
        if (isPartnerStudentProfileComplete(r)) return true;
        const extra = fetchedProfileById[id];
        if (extra === undefined) return false;
        if (extra === null) return false;
        return isPartnerStudentProfileComplete(extra);
      })
      .map((r) => {
        const id = String(r.id);
        const extra = fetchedProfileById[id];
        const avatarRecord: Record<string, unknown> =
          extra && typeof extra === "object"
            ? { ...r, ...(extra as Record<string, unknown>) }
            : r;
        const resolved = resolvePartnerListStudentAvatar(avatarRecord);
        return {
          id,
          name: String((r.user as { name?: string } | undefined)?.name ?? ""),
          email: String(r.email ?? ""),
          avatarSrc: resolved || DEFAULT_STUDENT_AVATAR,
        };
      });
  }, [sourceRecords, fetchedProfileById]);

  const students = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return studentsList;
    return studentsList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q),
    );
  }, [studentsList, search]);

  const isLoading =
    Boolean(user?.id) && (isPartnerLoading || isPartnerFetching);
  const isError = isPartnerError;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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
        onClick={() => {
          if (!isLoading && !isError) setIsOpen(!isOpen);
        }}
        className="w-full rounded-xl border border-dashed border-[#D1D5DB] bg-white p-3.5 text-left hover:border-primary-300 hover:bg-primary-50/40 transition-colors"
        disabled={isLoading || isError}
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
              {isLoading
                ? "Loading students..."
                : isError
                  ? "Unable to load students."
                  : "Only students with a complete profile are listed."}
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
          <div className="px-2 pb-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or ID"
              className="w-full rounded-md border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          {profilesResolving ? (
            <div className="px-3 py-2 text-xs text-gray-500">
              Checking profile completion…
            </div>
          ) : null}
          {students.map((student) => {
            const mapped: SelectedStudent = {
              id: student.id,
              name: student.name,
              email: student.email,
              avatar: student.avatarSrc,
            };
            return (
              <button
                key={student.id}
                type="button"
                onClick={() => {
                  onSelect(mapped);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2.5 text-left hover:bg-primary-50/80 flex items-center gap-3 transition-colors rounded-md mx-1"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={student.avatarSrc}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {student.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {student.email || "—"}
                  </p>
                </div>
              </button>
            );
          })}
          {!isLoading &&
            !isError &&
            !profilesResolving &&
            students.length === 0 && (
              <div className="px-3 py-2 text-xs text-gray-500">
                No students with a complete profile match your search.
              </div>
            )}
        </div>
      )}
    </div>
  );
}
