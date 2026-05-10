import { Modal, Skeleton } from "antd";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { config } from "../../config";
import { isPartnerStudentProfileComplete } from "../../lib/partnerStudentProfileGates";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { useDebounced } from "../../redux/features/hooks";
import {
  useGetAllStudentsByPartnerIdQuery,
  useLazyGetStudentProfileQuery,
} from "../../redux/features/profile/studentProfileApi";
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
  /**
   * Load partner students even before opening the picker (e.g. inside Apply modal).
   * Shows an inline skeleton until the list is ready.
   */
  eagerFetch?: boolean;
  /**
   * When this block lives inside another Ant Design Modal, bump z-index and portal
   * so the student picker opens above the parent mask/dialog.
   */
  nestedUnderModal?: boolean;
}

export default function StudentSelectBlock({
  selectedStudent,
  onSelect,
  eagerFetch = false,
  nestedUnderModal = false,
}: StudentSelectBlockProps) {
  const user = useSelector(selectCurrentUser);

  const [modalOpen, setModalOpen] = useState(false);
  const listQueryActive = modalOpen || eagerFetch;
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced({ searchQuery: search, delay: 400 });

  /** Fetched full profiles for list rows that are not complete from list payload alone */
  const [fetchedProfileById, setFetchedProfileById] = useState<
    Record<string, unknown | null>
  >({});

  const [fetchProfile] = useLazyGetStudentProfileQuery();

  const {
    data: allStudents,
    /** True only when this query key has no data yet — avoids skeleton flash on refetch */
    isLoading: isPartnerListLoading,
    isError: isPartnerError,
  } = useGetAllStudentsByPartnerIdQuery(
    {
      partnerId: user?.id as string,
      search: debouncedSearch.trim() || undefined,
      page: 1,
      limit: 100,
    },
    {
      skip: !user?.id || !listQueryActive,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    },
  );

  const sourceRecords = useMemo((): Record<string, unknown>[] => {
    return (allStudents?.data as Record<string, unknown>[]) || [];
  }, [allStudents?.data]);

  const sourceRecordsRef = useRef(sourceRecords);
  sourceRecordsRef.current = sourceRecords;

  /** Stable key so profile effect does not re-run when RTK returns a new array reference with the same rows */
  const sourceRecordIds = useMemo(
    () => sourceRecords.map((r) => String(r.id)).join("\n"),
    [sourceRecords],
  );

  useEffect(() => {
    if (!listQueryActive) {
      setFetchedProfileById({});
    }
  }, [listQueryActive]);

  useEffect(() => {
    if (!listQueryActive) return;

    const raw = sourceRecordsRef.current;
    if (!raw.length) {
      setFetchedProfileById({});
      return;
    }

    const incomplete = raw.filter((r) => !isPartnerStudentProfileComplete(r));
    if (incomplete.length === 0) {
      setFetchedProfileById((prev) => {
        const allowed = new Set(raw.map((r) => String(r.id)));
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          if (!allowed.has(k)) delete next[k];
        }
        return next;
      });
      return;
    }

    let cancelled = false;

    Promise.all(
      incomplete.map((r) =>
        fetchProfile(String(r.id))
          .unwrap()
          .then((data) => [String(r.id), data] as const)
          .catch(() => [String(r.id), null] as const),
      ),
    ).then((pairs) => {
      if (cancelled) return;
      setFetchedProfileById((prev) => {
        const next = { ...prev };
        const allowed = new Set(raw.map((r) => String(r.id)));
        for (const k of Object.keys(next)) {
          if (!allowed.has(k)) delete next[k];
        }
        pairs.forEach(([id, data]) => {
          next[id] = data;
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [listQueryActive, sourceRecordIds, fetchProfile]);

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

  const isError = isPartnerError;

  /** Synchronous: incomplete rows whose profile detail has not been merged yet (no async state lag → no skeleton flash) */
  const profileFetchPending = useMemo(() => {
    if (!sourceRecords.length) return false;
    return sourceRecords.some((r) => {
      if (isPartnerStudentProfileComplete(r)) return false;
      const id = String(r.id);
      return fetchedProfileById[id] === undefined;
    });
  }, [sourceRecords, fetchedProfileById]);

  /** Single skeleton: RTK first paint, or still waiting on profile fetches with no eligible row to show yet */
  const showUnifiedSkeleton =
    Boolean(user?.id) &&
    (isPartnerListLoading || (profileFetchPending && studentsList.length === 0));

  if (selectedStudent) {
    return (
      <SelectedStudentCard
        student={selectedStudent}
        onRemove={() => onSelect(null)}
      />
    );
  }

  if (eagerFetch && showUnifiedSkeleton) {
    return (
      <div
        className="w-full rounded-xl border border-primary-border bg-white p-3.5"
        aria-busy
        aria-label="Loading students"
      >
        <div className="flex items-center gap-2.5">
          <Skeleton.Avatar active size={32} />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton.Input active size="small" block className="!h-4 !max-w-[160px]" />
            <Skeleton.Input active size="small" block className="!h-3 !max-w-[220px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="w-full rounded-xl border border-dashed border-primary-border bg-white p-3.5 text-left transition-colors hover:border-primary-300 hover:bg-primary-50/40"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <svg
              className="h-4 w-4"
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
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium text-gray-900">Select Student</span>
          </div>
        </div>
      </button>

      <Modal
        title="Select Student"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSearch("");
        }}
        footer={null}
        width={520}
        centered
        destroyOnHidden
        getContainer={() => document.body}
        zIndex={nestedUnderModal ? 2600 : undefined}
        styles={{ body: { paddingTop: 12 } }}
      >
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or ID"
            disabled={Boolean(isError)}
            className="w-full rounded-xl border border-primary-border bg-white py-2.5 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 transition focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:bg-gray-50"
          />
        </div>

        <div className="max-h-[min(360px,calc(100vh-280px))] overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/50">
          {isError ? (
            <div className="px-4 py-8 text-center text-sm text-gray-600">Unable to load students. Try again later.</div>
          ) : showUnifiedSkeleton ? (
            <div className="space-y-0 divide-y divide-gray-100 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-3">
                  <Skeleton.Avatar active size={40} />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton.Input active size="small" block className="!h-4 !max-w-[180px]" />
                    <Skeleton.Input active size="small" block className="!h-3 !max-w-[240px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {studentsList.map((student) => {
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
                      setModalOpen(false);
                      setSearch("");
                    }}
                    className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-primary-50/80"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
                      <img src={student.avatarSrc} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-medium text-gray-900">{student.name}</p>
                      <p className="truncate text-xs text-gray-500">{student.email || "—"}</p>
                    </div>
                  </button>
                );
              })}
              {studentsList.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-gray-500">
                  No students with a complete profile match your search.
                </div>
              ) : null}
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
