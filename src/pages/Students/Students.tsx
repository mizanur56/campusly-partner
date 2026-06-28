import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import clsx from "clsx";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  MoreVertical,
  Search,
  UserCheck,
  UserCircle2,
  Users,
  UserX,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreateStudentModal from "../../components/common/Modals/CreateStudentModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { config } from "../../config";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { useGetAllStudentsByPartnerIdQuery } from "../../redux/features/profile/studentProfileApi";
import { useGetStudentsWithActiveTasksQuery } from "../../redux/features/tasks/partnerTasksApi";

interface StudentRecord {
  key: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  passportNo: string;
  assignedTo: string;
  status: string;
  lastLogin: string;
  neverLoggedIn: boolean;
  image: string;
}

interface AssignedStudentRecord {
  key: string;
  id: string;
  studentId: string;
  studentName: string;
  activeTaskCount: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name?: string): string {
  if (!name || name === "-") return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_GRADIENTS = [
  "from-[#95d66d] to-[#5fa836]",
  "from-sky-400 to-blue-600",
  "from-violet-400 to-purple-600",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-600",
  "from-teal-400 to-cyan-600",
];

function gradientFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i)) % 997;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

interface AvatarProps {
  name: string;
  image?: string;
}

function Avatar({ name, image }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  if (image && !errored) {
    return (
      <img
        src={image}
        alt={name}
        onError={() => setErrored(true)}
        className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
      />
    );
  }
  return (
    <span
      className={clsx(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
        gradientFor(name),
      )}
    >
      {getInitials(name)}
    </span>
  );
}

function statusStyle(status: string): { dot: string; pill: string } {
  const s = status.toLowerCase();
  if (s === "active")
    return {
      dot: "bg-emerald-500",
      pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  if (s === "inactive")
    return {
      dot: "bg-rose-500",
      pill: "bg-rose-50 text-rose-700 border-rose-200",
    };
  if (s.includes("pend"))
    return {
      dot: "bg-amber-500",
      pill: "bg-amber-50 text-amber-700 border-amber-200",
    };
  return {
    dot: "bg-slate-400",
    pill: "bg-slate-50 text-slate-600 border-slate-200",
  };
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

interface SummaryCardProps {
  label: string;
  value: number;
  icon: typeof Users;
  iconClass: string;
  accentClass: string;
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  iconClass,
  accentClass,
}: SummaryCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-md border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={clsx(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-30",
          accentClass,
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div
          className={clsx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            iconClass,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

const SELECT_CLASS =
  "h-11 w-full appearance-none rounded-md border border-slate-200 bg-white pl-3.5 pr-9 text-sm font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-[#7bc44e] focus:ring-2 focus:ring-[#95d66d]/30 sm:w-44";

export default function Students() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isTeamMember = user?.role === "PARTNER_TEAM_MEMBER";

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createStudentOpen, setCreateStudentOpen] = useState(false);
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: assignedStudents = [], isFetching: isFetchingAssigned } =
    useGetStudentsWithActiveTasksQuery(
      isTeamMember ? { assignedToMe: true } : undefined,
      { skip: !isTeamMember },
    );

  const {
    data: allStudents,
    isLoading: isPartnerStudentsLoading,
    isFetching: isPartnerStudentsFetching,
  } = useGetAllStudentsByPartnerIdQuery(
    { partnerId: user?.id as string },
    { skip: !user?.id || isTeamMember },
  );

  const allRows: StudentRecord[] = useMemo(() => {
    return ((allStudents?.data as any[]) ?? []).map((student: any) => {
      const lastLoginIso = student.lastLogin ?? null;
      return {
        key: student.id,
        id: student.id,
        name:
          [student.firstName, student.lastName].filter(Boolean).join(" ").trim() ||
          student.user?.name ||
          student.email ||
          "-",
        email: student.email ?? student.user?.email ?? "-",
        phone: student.phone ?? student.user?.phone ?? "-",
        passportNo: student.passportNo ?? "-",
        assignedTo: student.advisor?.name ?? "-",
        status:
          student.user?.isActive === false
            ? "Inactive"
            : student.status ?? "Active",
        lastLogin: formatDate(lastLoginIso),
        neverLoggedIn: !lastLoginIso,
        image: student.image?.url
          ? `${config.image_access_url}${student.image.url}`
          : "",
      };
    });
  }, [allStudents?.data]);

  const statusOptions = useMemo(
    () => Array.from(new Set(allRows.map((r) => r.status))).sort(),
    [allRows],
  );
  const assigneeOptions = useMemo(
    () =>
      Array.from(new Set(allRows.map((r) => r.assignedTo))).sort((a, b) =>
        a === "-" ? 1 : b === "-" ? -1 : a.localeCompare(b),
      ),
    [allRows],
  );

  const filteredRows: StudentRecord[] = useMemo(() => {
    let rows = allRows;
    if (statusFilter) rows = rows.filter((r) => r.status === statusFilter);
    if (assignedFilter)
      rows = rows.filter((r) => r.assignedTo === assignedFilter);
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      rows = rows.filter(
        (row) =>
          row.name.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q) ||
          row.phone.toLowerCase().includes(q) ||
          row.passportNo.toLowerCase().includes(q) ||
          row.assignedTo.toLowerCase().includes(q) ||
          row.status.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [allRows, statusFilter, assignedFilter, searchText]);

  const assignedRows: AssignedStudentRecord[] = useMemo(() => {
    const rows = assignedStudents.map((student) => ({
      key: student.studentId,
      id: student.studentId,
      studentId: student.studentId,
      studentName: student.studentName,
      activeTaskCount: student.activeTaskCount,
    }));
    if (!searchText.trim()) return rows;
    const q = searchText.toLowerCase();
    return rows.filter((row) => row.studentName.toLowerCase().includes(q));
  }, [assignedStudents, searchText]);

  const stats = useMemo(() => {
    if (isTeamMember) {
      const total = assignedRows.length;
      const withTasks = assignedRows.filter(
        (r) => r.activeTaskCount > 0,
      ).length;
      const totalTasks = assignedRows.reduce(
        (sum, r) => sum + r.activeTaskCount,
        0,
      );
      return {
        total,
        primary: withTasks,
        secondary: totalTasks,
        tertiary: total - withTasks,
      };
    }
    return {
      total: allRows.length,
      primary: allRows.filter((r) => r.status.toLowerCase() === "active").length,
      secondary: allRows.filter((r) => r.status.toLowerCase() === "inactive")
        .length,
      tertiary: allRows.filter((r) => r.neverLoggedIn).length,
    };
  }, [isTeamMember, allRows, assignedRows]);

  const baseRows = isTeamMember ? assignedRows : filteredRows;
  const totalRows = baseRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const pagedRows = useMemo(
    () => baseRows.slice((page - 1) * pageSize, page * pageSize),
    [baseRows, page, pageSize],
  );

  const loading = isTeamMember
    ? isFetchingAssigned
    : Boolean(user?.id) &&
      (isPartnerStudentsLoading || isPartnerStudentsFetching);

  const hasActiveFilters = Boolean(
    searchText.trim() || statusFilter || assignedFilter,
  );

  useEffect(() => {
    setPage(1);
  }, [searchText, statusFilter, assignedFilter, pageSize, isTeamMember]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuKey(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleViewProfile = (record: StudentRecord | AssignedStudentRecord) => {
    const studentId = "studentId" in record ? record.studentId : record.id;
    navigate(`/students/${studentId}/profile`, { state: { student: record } });
  };

  const resetFilters = () => {
    setSearchText("");
    setStatusFilter("");
    setAssignedFilter("");
  };

  const colSpan = isTeamMember ? 3 : 7;
  const rangeStart = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalRows);

  return (
    <div>
      <PageMeta
        title="Students - Campus Transfer Partner"
        description="View and manage your students, applications, and enrollment status in the Campus Transfer Partner panel."
      />
      <PageHeader
        title="Students"
        subtitle="Easily manage every student in your team."
        extra={
          !isTeamMember ? (
            <Button
              type="primary"
              onClick={() => setCreateStudentOpen(true)}
              icon={<PlusOutlined />}
            >
              Add student
            </Button>
          ) : null
        }
        breadcrumbs={[{ title: "Dashboard", path: "/" }, { title: "Students" }]}
      />

      {!isTeamMember && (
        <CreateStudentModal
          open={createStudentOpen}
          onClose={() => setCreateStudentOpen(false)}
        />
      )}

      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Students"
          value={stats.total}
          icon={Users}
          iconClass="bg-[#e8f7df] text-[#5fa836]"
          accentClass="bg-[#95d66d]"
        />
        <SummaryCard
          label={isTeamMember ? "With Active Tasks" : "Active Students"}
          value={stats.primary}
          icon={UserCheck}
          iconClass="bg-emerald-50 text-emerald-600"
          accentClass="bg-emerald-400"
        />
        <SummaryCard
          label={isTeamMember ? "Total Active Tasks" : "Inactive Students"}
          value={stats.secondary}
          icon={isTeamMember ? Clock : UserX}
          iconClass={
            isTeamMember
              ? "bg-amber-50 text-amber-600"
              : "bg-rose-50 text-rose-600"
          }
          accentClass={isTeamMember ? "bg-amber-400" : "bg-rose-400"}
        />
        <SummaryCard
          label={isTeamMember ? "No Active Tasks" : "Never Logged In"}
          value={stats.tertiary}
          icon={Clock}
          iconClass="bg-slate-100 text-slate-500"
          accentClass="bg-slate-400"
        />
      </div>

      {/* Main card */}
      <div className="rounded-md border border-slate-200 bg-white shadow-sm">
        {/* Search + filters */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              ref={searchRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by name, email, status or phone"
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50/60 pl-11 pr-10 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#7bc44e] focus:bg-white focus:ring-2 focus:ring-[#95d66d]/30"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {!isTeamMember && (
            <>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={SELECT_CLASS}
                >
                  <option value="">All status</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <div className="relative">
                <select
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value)}
                  className={SELECT_CLASS}
                >
                  <option value="">All assignees</option>
                  {assigneeOptions.map((a) => (
                    <option key={a} value={a}>
                      {a === "-" ? "Unassigned" : a}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() =>
              hasActiveFilters ? resetFilters() : searchRef.current?.focus()
            }
            className={clsx(
              "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-all",
              hasActiveFilters
                ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                : "bg-[#5fa836] text-white shadow-sm hover:bg-[#4f9762]",
            )}
          >
            {hasActiveFilters ? (
              <>
                <X size={16} />
                Clear
              </>
            ) : (
              <>
                <Filter size={16} />
                Filter
              </>
            )}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {isTeamMember ? (
                  <>
                    <th className="px-4 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Active Tasks</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Contact</th>
                    <th className="px-4 py-3.5">Passport No</th>
                    <th className="px-4 py-3.5">Assigned To</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Last Login</th>
                  </>
                )}
                <th className="w-16 px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    {Array.from({ length: colSpan }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                        <Users className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        No students found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters."
                          : "Students you add will appear here."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : isTeamMember ? (
                (pagedRows as AssignedStudentRecord[]).map((record) => (
                  <tr
                    key={record.key}
                    className="group transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleViewProfile(record)}
                        className="flex items-center gap-3 text-left"
                      >
                        <span
                          className={clsx(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
                            gradientFor(record.studentName),
                          )}
                        >
                          {getInitials(record.studentName)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-[#5fa836]">
                            {record.studentName}
                          </span>
                          <span className="block truncate text-xs text-slate-400">
                            ID: {record.studentId.slice(0, 8)}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        {record.activeTaskCount} task
                        {record.activeTaskCount !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <RowActions
                      record={record}
                      openMenuKey={openMenuKey}
                      setOpenMenuKey={setOpenMenuKey}
                      menuRef={menuRef}
                      onView={handleViewProfile}
                    />
                  </tr>
                ))
              ) : (
                (pagedRows as StudentRecord[]).map((record) => {
                  const ss = statusStyle(record.status);
                  return (
                    <tr
                      key={record.key}
                      className="group transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleViewProfile(record)}
                          className="flex items-center gap-3 text-left"
                        >
                          <Avatar name={record.name} image={record.image} />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-[#5fa836]">
                              {record.name}
                            </span>
                            <span className="block truncate text-xs text-slate-400">
                              ID: {record.id.slice(0, 8)}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm text-slate-700">
                          {record.email}
                        </div>
                        <div className="text-xs text-slate-400">
                          {record.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">
                        {record.passportNo}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <UserCircle2 size={16} />
                          </span>
                          <span className="truncate text-sm text-slate-700">
                            {record.assignedTo === "-"
                              ? "Unassigned"
                              : record.assignedTo}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                            ss.pill,
                          )}
                        >
                          <span
                            className={clsx("h-1.5 w-1.5 rounded-full", ss.dot)}
                          />
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm text-slate-600">
                          {record.lastLogin}
                        </div>
                        <div className="text-xs text-slate-400">
                          {record.neverLoggedIn ? "Never logged in" : "Last seen"}
                        </div>
                      </td>
                      <RowActions
                        record={record}
                        openMenuKey={openMenuKey}
                        setOpenMenuKey={setOpenMenuKey}
                        menuRef={menuRef}
                        onView={handleViewProfile}
                      />
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3.5 sm:flex-row">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="hidden sm:inline">
              {totalRows === 0
                ? "No results"
                : `Showing ${rangeStart}-${rangeEnd} of ${totalRows} students`}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Rows</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-[#7bc44e] focus:ring-2 focus:ring-[#95d66d]/30"
                >
                  {[10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            {getPageNumbers(page, totalPages).map((p, i) =>
              p === "..." ? (
                <span
                  key={`e-${i}`}
                  className="flex h-9 w-9 items-center justify-center text-sm text-slate-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={clsx(
                    "flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors",
                    p === page
                      ? "bg-[#5fa836] text-white shadow-sm"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {p}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RowActionsProps {
  record: StudentRecord | AssignedStudentRecord;
  openMenuKey: string | null;
  setOpenMenuKey: (key: string | null) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onView: (record: StudentRecord | AssignedStudentRecord) => void;
}

function RowActions({
  record,
  openMenuKey,
  setOpenMenuKey,
  menuRef,
  onView,
}: RowActionsProps) {
  const isOpen = openMenuKey === record.key;
  return (
    <td className="px-4 py-3.5 text-right">
      <div className="relative inline-block" ref={isOpen ? menuRef : undefined}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenuKey(isOpen ? null : record.key);
          }}
          className={clsx(
            "flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600",
            isOpen && "bg-slate-100 text-slate-600",
          )}
          aria-label="Row actions"
        >
          <MoreVertical size={18} />
        </button>
        {isOpen && (
          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setOpenMenuKey(null);
                onView(record);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Eye size={16} className="text-slate-400" />
              View Profile
            </button>
          </div>
        )}
      </div>
    </td>
  );
}
