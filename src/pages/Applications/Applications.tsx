import clsx from "clsx";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileStack,
  Filter,
  MoreVertical,
  Pencil,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import DeleteModal from "../../components/shared/DeleteModal";
import { config } from "../../config";
import {
  useDeleteApplicationMutation,
  useGetMyAllApplicationsQuery,
} from "../../redux/features/application/applicationApi";

const BRAND = "#4bb032";

interface ApplicationRecord {
  id: string;
  applicationId: string;
  status: string;
  course?: {
    university?: {
      name?: string;
      UniversityLogo?: { url: string };
      country?: { name?: string };
    };
    course?: { name?: string };
    country?: { name?: string };
  };
  campus?: string;
  intake?: string;
  createdAt?: string;
}

type StatusStyle = {
  label: string;
  pill: string;
  dot: string;
};

const STATUS_CONFIG: Record<string, StatusStyle> = {
  APPLY: {
    label: "Apply",
    pill: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  REVIEW: {
    label: "Review",
    pill: "border-indigo-200 bg-indigo-50 text-indigo-700",
    dot: "bg-indigo-500",
  },
  PENDING_TRAVEL_LETTER: {
    label: "Pending Travel Letter",
    pill: "border-orange-200 bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  },
  PENDING_OFFER_LETTER: {
    label: "Pending Offer Letter",
    pill: "border-pink-200 bg-pink-50 text-pink-700",
    dot: "bg-pink-500",
  },
  SUCCESS: {
    label: "Success",
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    pill: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
};

const humanizeStatus = (status?: string) => {
  if (!status) return "—";
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const getStatusStyle = (status: string): StatusStyle =>
  STATUS_CONFIG[status] ?? {
    label: humanizeStatus(status),
    pill: "border-slate-200 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
  };

const getLogoSrc = (logoUrl?: string | null) => {
  if (!logoUrl) return undefined;
  if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
    return logoUrl;
  }
  if (config.image_access_url) {
    return `${config.image_access_url}${logoUrl}`;
  }
  return logoUrl;
};

const getCountry = (record: ApplicationRecord) =>
  record.course?.country?.name ??
  record.course?.university?.country?.name ??
  "";

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

const SELECT_CLASS =
  "h-11 w-full appearance-none rounded-md border border-slate-200 bg-white pl-3.5 pr-9 text-sm font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-[#7bc44e] focus:ring-2 focus:ring-[#95d66d]/30";

/* --------------------------------- StatCard --------------------------------- */

interface StatCardProps {
  label: string;
  value: ReactNode;
  description: string;
  icon: ReactNode;
  iconClass: string;
  accentClass: string;
  loading?: boolean;
}

function StatCard({
  label,
  value,
  description,
  icon,
  iconClass,
  accentClass,
  loading,
}: StatCardProps) {
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
          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-slate-100" />
          ) : (
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
              {value}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
        <div
          className={clsx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-md",
            iconClass,
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------- Page ----------------------------------- */

export default function Applications() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [intakeFilter, setIntakeFilter] = useState("");
  const [universityFilter, setUniversityFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationRecord | null>(null);
  const [deleteApplication, { isLoading: isDeletingApplication }] =
    useDeleteApplicationMutation();

  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching } = useGetMyAllApplicationsQuery({
    page: currentPage,
    limit,
    status: selectedStatus,
    search: searchText,
  });

  // Read-only, status-scoped queries reuse the existing endpoint purely to read
  // accurate `meta.total` counts for the summary cards (no backend changes).
  const { data: totalStats } = useGetMyAllApplicationsQuery({
    page: 1,
    limit: 1,
    status: "",
    search: "",
  });
  const { data: approvedStats } = useGetMyAllApplicationsQuery({
    page: 1,
    limit: 1,
    status: "SUCCESS",
    search: "",
  });
  const { data: rejectedStats } = useGetMyAllApplicationsQuery({
    page: 1,
    limit: 1,
    status: "REJECTED",
    search: "",
  });

  const tableData: ApplicationRecord[] = data?.data || [];
  const total = data?.meta?.total ?? 0;

  const totalApplications = totalStats?.meta?.total ?? 0;
  const approvedCount = approvedStats?.meta?.total ?? 0;
  const rejectedCount = rejectedStats?.meta?.total ?? 0;
  const processingCount = Math.max(
    totalApplications - approvedCount - rejectedCount,
    0,
  );
  const statsLoading = !totalStats;

  // Client-side refinements over the loaded page (keeps API calls unchanged).
  const intakeOptions = useMemo(() => {
    const set = new Set<string>();
    tableData.forEach((r) => r.intake && set.add(r.intake));
    return Array.from(set);
  }, [tableData]);

  const universityOptions = useMemo(() => {
    const set = new Set<string>();
    tableData.forEach((r) => {
      const name = r.course?.university?.name;
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [tableData]);

  const displayedData = useMemo(() => {
    let rows = [...tableData];
    if (intakeFilter) rows = rows.filter((r) => r.intake === intakeFilter);
    if (universityFilter)
      rows = rows.filter((r) => r.course?.university?.name === universityFilter);

    switch (sortBy) {
      case "newest":
        rows.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        );
        break;
      case "oldest":
        rows.sort(
          (a, b) =>
            new Date(a.createdAt ?? 0).getTime() -
            new Date(b.createdAt ?? 0).getTime(),
        );
        break;
      case "university":
        rows.sort((a, b) =>
          (a.course?.university?.name ?? "").localeCompare(
            b.course?.university?.name ?? "",
          ),
        );
        break;
      default:
        break;
    }
    return rows;
  }, [tableData, intakeFilter, universityFilter, sortBy]);

  const hasActiveFilters = Boolean(
    selectedStatus || intakeFilter || universityFilter || sortBy || searchText,
  );

  const resetFilters = () => {
    setSelectedStatus("");
    setIntakeFilter("");
    setUniversityFilter("");
    setSortBy("");
    setSearchText("");
    setCurrentPage(1);
  };

  /* pagination */
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);
  const isBusy = isLoading || isFetching;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div>
      <PageMeta
        title="Applications - Campus Transfer Partner"
        description="View and manage student applications, status, and submissions in the Campus Transfer Partner panel."
      />

      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-[28px]">
            Applications
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Track, manage and review all of your student applications in one
            place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/programs-schools")}
          style={{ backgroundColor: BRAND }}
          className="group inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-95 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#95d66d]/40"
        >
          Find More Programs
          <ArrowUpRight
            size={17}
            className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </button>
      </div>

      {/* Stats cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={totalApplications.toLocaleString()}
          description="All submitted applications"
          loading={statsLoading}
          icon={<FileStack className="h-5 w-5" />}
          iconClass="bg-[#e8f7df] text-[#5fa836]"
          accentClass="bg-[#95d66d]"
        />
        <StatCard
          label="Processing"
          value={processingCount.toLocaleString()}
          description="Currently in review"
          loading={statsLoading}
          icon={<Clock className="h-5 w-5" />}
          iconClass="bg-amber-50 text-amber-600"
          accentClass="bg-amber-400"
        />
        <StatCard
          label="Approved"
          value={approvedCount.toLocaleString()}
          description="Successful applications"
          loading={statsLoading}
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconClass="bg-blue-50 text-blue-600"
          accentClass="bg-blue-400"
        />
        <StatCard
          label="Rejected / Pending"
          value={rejectedCount.toLocaleString()}
          description="Needs attention"
          loading={statsLoading}
          icon={<XCircle className="h-5 w-5" />}
          iconClass="bg-rose-50 text-rose-600"
          accentClass="bg-rose-400"
        />
      </div>

      {/* Main card */}
      <div className="rounded-md border border-slate-200 bg-white shadow-sm">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              ref={searchRef}
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, course, university or status"
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50/60 pl-11 pr-10 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#7bc44e] focus:bg-white focus:ring-2 focus:ring-[#95d66d]/30"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => {
                  setSearchText("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex lg:items-center">
            <div className="relative lg:w-40">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className={SELECT_CLASS}
              >
                <option value="">All status</option>
                <option value="APPLY">Apply</option>
                <option value="REVIEW">Review</option>
                <option value="PENDING_OFFER_LETTER">Pending Offer Letter</option>
                <option value="PENDING_TRAVEL_LETTER">
                  Pending Travel Letter
                </option>
                <option value="SUCCESS">Success</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative lg:w-36">
              <select
                value={intakeFilter}
                onChange={(e) => setIntakeFilter(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">All intakes</option>
                {intakeOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative lg:w-44">
              <select
                value={universityFilter}
                onChange={(e) => setUniversityFilter(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">All universities</option>
                {universityOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative lg:w-40">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">Sort by</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="university">University A–Z</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

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
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="w-[200px] px-4 py-3.5">School / University</th>
                <th className="w-[160px] px-4 py-3.5">Program</th>
                <th className="px-4 py-3.5">Application ID</th>
                <th className="px-4 py-3.5">Intake</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="w-16 px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isBusy ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : displayedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-md bg-slate-50">
                        <FileStack className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        No applications found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters."
                          : "Find a program to create your first application."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedData.map((record, idx) => {
                  const logoSrc = getLogoSrc(
                    record.course?.university?.UniversityLogo?.url,
                  );
                  const universityName =
                    record.course?.university?.name || "N/A";
                  const country = getCountry(record);
                  const statusStyle = getStatusStyle(record.status);
                  const isOpen = openMenuId === record.id;

                  return (
                    <tr
                      key={record.id}
                      onClick={() => navigate(`/applications/${record.id}`)}
                      className={clsx(
                        "group cursor-pointer transition-colors hover:bg-slate-50/70",
                        idx % 2 === 1 && "bg-slate-50/30",
                      )}
                    >
                      <td className="w-[200px] px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                            {logoSrc ? (
                              <img
                                src={logoSrc}
                                alt={universityName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-slate-400">
                                {universityName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div
                              className="truncate text-sm font-semibold text-slate-800"
                              title={universityName}
                            >
                              {universityName}
                            </div>
                            <div className="truncate text-xs text-slate-400">
                              {country || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="w-[160px] px-4 py-3.5">
                        <div
                          className="truncate text-sm font-medium text-slate-700"
                          title={record.course?.course?.name || "N/A"}
                        >
                          {record.course?.course?.name || "N/A"}
                        </div>
                        <div className="text-xs text-slate-400">Program</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-[6px] border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-semibold text-slate-600">
                          {record.applicationId}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {record.intake ? (
                          <span className="inline-flex items-center rounded-[6px] border border-slate-200 bg-white px-3 py-0.5 text-xs font-medium text-slate-600">
                            {record.intake}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-0.5 text-xs font-semibold",
                            statusStyle.pill,
                          )}
                        >
                          <span
                            className={clsx(
                              "h-1.5 w-1.5 rounded-full",
                              statusStyle.dot,
                            )}
                          />
                          {statusStyle.label}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className="relative inline-block"
                          ref={isOpen ? menuRef : undefined}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(isOpen ? null : record.id);
                            }}
                            className={clsx(
                              "flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600",
                              isOpen && "bg-slate-100 text-slate-600",
                            )}
                            aria-label="Row actions"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {isOpen && (
                            <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  navigate(`/applications/${record.id}`);
                                }}
                                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                              >
                                <Eye size={16} className="text-slate-400" />
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  navigate(
                                    `/applications/${record.id}?tab=requirements`,
                                  );
                                }}
                                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                              >
                                <Pencil size={16} className="text-slate-400" />
                                Edit
                              </button>
                              <div className="my-1 h-px bg-slate-100" />
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setSelectedApplication(record);
                                  setDeleteModalOpen(true);
                                }}
                                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50"
                              >
                                <Trash2 size={16} className="text-rose-500" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3.5 sm:flex-row">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="hidden sm:inline">
              {total === 0
                ? "No applications"
                : `Showing ${startItem}-${endItem} of ${total} applications`}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Rows</span>
              <div className="relative">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-9 appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-[#7bc44e] focus:ring-2 focus:ring-[#95d66d]/30"
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            {getPageNumbers(currentPage, totalPages).map((p, i) =>
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
                  onClick={() => setCurrentPage(p)}
                  className={clsx(
                    "flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors",
                    p === currentPage
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
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage >= totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <DeleteModal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          if (!selectedApplication?.id) {
            toast.error("Application not selected");
            return;
          }

          try {
            await deleteApplication(selectedApplication.id).unwrap();
            toast.success("Application deleted successfully");
            setDeleteModalOpen(false);
            setSelectedApplication(null);
          } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete application");
          }
        }}
        loading={isDeletingApplication}
        title="Delete Application"
        message="Are you sure you want to delete this application?"
      />
    </div>
  );
}
