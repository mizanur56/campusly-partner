import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileStack,
  Pencil,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  XCircle,
} from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
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
  badge: string;
  dot: string;
};

const STATUS_CONFIG: Record<string, StatusStyle> = {
  APPLY: {
    label: "Apply",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
    dot: "bg-blue-500",
  },
  REVIEW: {
    label: "Review",
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    dot: "bg-indigo-500",
  },
  PENDING_TRAVEL_LETTER: {
    label: "Pending Travel Letter",
    badge: "bg-orange-50 text-orange-700 ring-orange-200",
    dot: "bg-orange-500",
  },
  PENDING_OFFER_LETTER: {
    label: "Pending Offer Letter",
    badge: "bg-pink-50 text-pink-700 ring-pink-200",
    dot: "bg-pink-500",
  },
  SUCCESS: {
    label: "Success",
    badge: "bg-green-50 text-green-700 ring-green-200",
    dot: "bg-green-500",
  },
  REJECTED: {
    label: "Rejected",
    badge: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500",
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
    badge: "bg-neutral-100 text-neutral-600 ring-neutral-200",
    dot: "bg-neutral-400",
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

/* ---------------------------------- UI bits --------------------------------- */

function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 scale-95 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover/tt:scale-100 group-hover/tt:opacity-100">
        {label}
      </span>
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  description: string;
  icon: ReactNode;
  accent: { icon: string; blob: string };
  loading?: boolean;
}

function StatCard({
  label,
  value,
  description,
  icon,
  accent,
  loading,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-neutral-400">
            {label}
          </p>
          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded-md bg-neutral-100" />
          ) : (
            <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-neutral-900">
              {value}
            </p>
          )}
          <p className="mt-1 text-xs font-medium text-neutral-400">
            {description}
          </p>
        </div>
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent.icon}`}
        >
          {icon}
        </span>
      </div>
      <span
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.08] blur-2xl ${accent.blob}`}
        aria-hidden
      />
    </div>
  );
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  className?: string;
}

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  className = "",
}: FilterSelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-neutral-200 bg-white pl-3.5 pr-9 text-sm font-medium text-neutral-700 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-[#4bb032] focus:ring-2 focus:ring-[#4bb032]/15"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
      />
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
  const [showFilters, setShowFilters] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationRecord | null>(null);
  const [deleteApplication, { isLoading: isDeletingApplication }] =
    useDeleteApplicationMutation();

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
    return Array.from(set).map((v) => ({ label: v, value: v }));
  }, [tableData]);

  const universityOptions = useMemo(() => {
    const set = new Set<string>();
    tableData.forEach((r) => {
      const name = r.course?.university?.name;
      if (name) set.add(name);
    });
    return Array.from(set).map((v) => ({ label: v, value: v }));
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

  const hasActiveFilters =
    !!selectedStatus ||
    !!intakeFilter ||
    !!universityFilter ||
    !!sortBy ||
    !!searchText;

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

  const pageNumbers = useMemo<(number | "...")[]>(() => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i += 1) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const isBusy = isLoading || isFetching;

  return (
    <div className="space-y-6">
      <PageMeta
        title="Applications - Campus Transfer Partner"
        description="View and manage student applications, status, and submissions in the Campus Transfer Partner panel."
      />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
            Applications
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            Track, manage and review all of your student applications in one
            place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/programs-schools")}
          style={{ backgroundColor: BRAND }}
          className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-95 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#4bb032]/30"
        >
          Find More Programs
          <ArrowUpRight
            size={17}
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={totalApplications.toLocaleString()}
          description="All submitted applications"
          loading={statsLoading}
          icon={<FileStack size={22} />}
          accent={{ icon: "bg-primary-50 text-primary-700", blob: "bg-primary-500" }}
        />
        <StatCard
          label="Processing"
          value={processingCount.toLocaleString()}
          description="Currently in review"
          loading={statsLoading}
          icon={<Clock size={22} />}
          accent={{ icon: "bg-amber-50 text-amber-600", blob: "bg-amber-400" }}
        />
        <StatCard
          label="Approved"
          value={approvedCount.toLocaleString()}
          description="Successful applications"
          loading={statsLoading}
          icon={<CheckCircle2 size={22} />}
          accent={{ icon: "bg-blue-50 text-blue-600", blob: "bg-blue-400" }}
        />
        <StatCard
          label="Rejected / Pending"
          value={rejectedCount.toLocaleString()}
          description="Needs attention"
          loading={statsLoading}
          icon={<XCircle size={22} />}
          accent={{ icon: "bg-rose-50 text-rose-600", blob: "bg-rose-400" }}
        />
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, course, university or status"
              className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50/60 pl-11 pr-4 text-sm text-neutral-800 outline-none transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-[#4bb032] focus:bg-white focus:ring-2 focus:ring-[#4bb032]/15"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all duration-200 lg:hidden ${
              showFilters
                ? "border-[#4bb032] bg-primary-50 text-primary-700"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
            }`}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>

          <div
            className={`flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex ${
              showFilters ? "flex" : "hidden"
            }`}
          >
            <FilterSelect
              className="sm:w-40"
              placeholder="All Status"
              value={selectedStatus}
              onChange={(v) => {
                setSelectedStatus(v);
                setCurrentPage(1);
              }}
              options={[
                { label: "Apply", value: "APPLY" },
                { label: "Review", value: "REVIEW" },
                { label: "Pending Offer Letter", value: "PENDING_OFFER_LETTER" },
                {
                  label: "Pending Travel Letter",
                  value: "PENDING_TRAVEL_LETTER",
                },
                { label: "Success", value: "SUCCESS" },
                { label: "Rejected", value: "REJECTED" },
              ]}
            />
            <FilterSelect
              className="sm:w-36"
              placeholder="All Intakes"
              value={intakeFilter}
              onChange={setIntakeFilter}
              options={intakeOptions}
            />
            <FilterSelect
              className="sm:w-44"
              placeholder="All Universities"
              value={universityFilter}
              onChange={setUniversityFilter}
              options={universityOptions}
            />
            <FilterSelect
              className="sm:w-40"
              placeholder="Sort by"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { label: "Newest first", value: "newest" },
                { label: "Oldest first", value: "oldest" },
                { label: "University A–Z", value: "university" },
              ]}
            />
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="max-h-[640px] overflow-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-neutral-50">
              <tr className="border-b border-neutral-200">
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-neutral-500 sm:px-5">
                  School / University
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Program
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Application ID
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Intake
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Status
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isBusy ? (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-neutral-400">
                      <span className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-200 border-t-[#4bb032]" />
                      <span className="text-sm font-medium">
                        Loading applications…
                      </span>
                    </div>
                  </td>
                </tr>
              ) : displayedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-neutral-400">
                      <FileStack size={32} className="text-neutral-300" />
                      <span className="text-sm font-semibold text-neutral-600">
                        No applications found
                      </span>
                      <span className="text-xs">
                        Try adjusting your search or filters.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedData.map((record) => {
                  const logoSrc = getLogoSrc(
                    record.course?.university?.UniversityLogo?.url,
                  );
                  const universityName =
                    record.course?.university?.name || "N/A";
                  const country = getCountry(record);
                  const statusStyle = getStatusStyle(record.status);

                  return (
                    <tr
                      key={record.id}
                      onClick={() => navigate(`/applications/${record.id}`)}
                      className="group cursor-pointer transition-colors duration-200 hover:bg-neutral-50"
                    >
                      <td className="px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-100 bg-neutral-100">
                            {logoSrc ? (
                              <img
                                src={logoSrc}
                                alt={universityName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-neutral-400">
                                {universityName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-neutral-900">
                              {universityName}
                            </p>
                            {country ? (
                              <p className="truncate text-xs text-neutral-400">
                                {country}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="truncate text-sm font-medium text-neutral-800">
                          {record.course?.course?.name || "N/A"}
                        </p>
                        <p className="text-xs text-neutral-400">Program</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-lg bg-neutral-100 px-2.5 py-1 font-mono text-xs font-semibold text-neutral-600">
                          {record.applicationId}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {record.intake ? (
                          <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600">
                            {record.intake}
                          </span>
                        ) : (
                          <span className="text-sm text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle.badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                          />
                          {statusStyle.label}
                        </span>
                      </td>
                      <td
                        className="px-4 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <Tooltip label="View">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/applications/${record.id}`)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-all duration-200 hover:border-[#4bb032] hover:text-[#4bb032]"
                            >
                              <Eye size={15} />
                            </button>
                          </Tooltip>
                          <Tooltip label="Edit">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/applications/${record.id}?tab=requirements`,
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-all duration-200 hover:border-[#4bb032] hover:text-[#4bb032]"
                            >
                              <Pencil size={15} />
                            </button>
                          </Tooltip>
                          <Tooltip label="Delete">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedApplication(record);
                                setDeleteModalOpen(true);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-all duration-200 hover:border-red-400 hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={15} />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex flex-col gap-4 border-t border-neutral-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-neutral-500">
              {total > 0 ? (
                <>
                  Showing{" "}
                  <span className="font-semibold text-neutral-700">
                    {startItem}–{endItem}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-neutral-700">
                    {total}
                  </span>{" "}
                  applications
                </>
              ) : (
                "No applications"
              )}
            </p>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm text-neutral-400">Rows</span>
              <div className="relative">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-9 cursor-pointer appearance-none rounded-lg border border-neutral-200 bg-white pl-3 pr-8 text-sm font-medium text-neutral-700 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-[#4bb032] focus:ring-2 focus:ring-[#4bb032]/15"
                >
                  {[10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-2.5 text-sm font-medium text-neutral-600 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {pageNumbers.map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-sm text-neutral-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  style={
                    page === currentPage
                      ? { backgroundColor: BRAND, borderColor: BRAND }
                      : undefined
                  }
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold transition-all duration-200 ${
                    page === currentPage
                      ? "text-white shadow-sm"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage >= totalPages}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-2.5 text-sm font-medium text-neutral-600 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden sm:inline">Next</span>
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
