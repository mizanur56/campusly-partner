import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, Filter, Search } from "lucide-react";
import { Dropdown, Empty, Input, Spin } from "antd";
import type { MenuProps } from "antd";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { useGetAnnouncementsQuery } from "../../redux/features/announcements/announcementsApi";
import { getApiImageUrl } from "../../utils/getApiImageUrl";
import {
  getStoredAnnouncementReadIds,
  persistAnnouncementReadIds,
} from "../../lib/partnerAnnouncementReadIds";

type PartnerAnnouncement = {
  id: string;
  title?: string;
  body?: string;
  createdAt?: string;
  category?: string;
  type?: string;
  intakeYear?: string | number;
  university?: {
    name?: string;
    UniversityLogo?: { url?: string | null };
  };
};

function formatListDate(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB");
  } catch {
    return "—";
  }
}

function initialsFromName(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "?";
  return n
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function categoryLabel(a: PartnerAnnouncement) {
  const raw = a.category ?? a.type ?? "Institutions updates";
  return String(raw).toUpperCase();
}

function hasCategoryOrType(a: PartnerAnnouncement): boolean {
  return Boolean(String(a.category ?? a.type ?? "").trim());
}

function hasIntakeYearValue(a: PartnerAnnouncement): boolean {
  if (a.intakeYear == null) return false;
  return String(a.intakeYear).trim() !== "";
}

function displayTitle(a: PartnerAnnouncement) {
  return a.university?.name?.trim() || a.title || "Announcement";
}

function AnnouncementBody({ body }: { body: string }) {
  const trimmed = (body ?? "").trim();
  if (!trimmed) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">No content.</p>
    );
  }
  const looksHtml = /<[a-z][\s\S]*>/i.test(trimmed);
  if (looksHtml) {
    return (
      <div
        className="announcement-html max-w-none text-[15px] leading-relaxed text-[#20242A] dark:text-gray-200 [&_strong]:font-semibold [&_p]:mb-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold"
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
  }
  return (
    <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#20242A] dark:text-gray-200">
      {trimmed}
    </div>
  );
}

export default function AnnouncementsDetailsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFromUrl = searchParams.get("id");

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);

  const { data, isLoading, isFetching } = useGetAnnouncementsQuery(
    { page: 1, limit: 100, isActive: true },
    { refetchOnMountOrArgChange: true },
  );

  const list = useMemo(() => {
    const raw = (data?.data as PartnerAnnouncement[]) || [];
    return [...raw].sort((a, b) => {
      const ta = new Date(a.createdAt ?? 0).getTime();
      const tb = new Date(b.createdAt ?? 0).getTime();
      return tb - ta;
    });
  }, [data]);

  useEffect(() => {
    setReadIds(getStoredAnnouncementReadIds());
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    list.forEach((a) => {
      const c = (a.category ?? a.type ?? "").trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [list]);

  const filteredList = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return list.filter((a) => {
      if (categoryFilter) {
        const cat = (a.category ?? a.type ?? "").trim();
        if (cat !== categoryFilter) return false;
      }
      if (!q) return true;
      const title = displayTitle(a).toLowerCase();
      const body = (a.body ?? "").toLowerCase();
      return title.includes(q) || body.includes(q);
    });
  }, [list, searchText, categoryFilter]);

  const selected = useMemo(() => {
    if (!filteredList.length) return null;
    if (selectedFromUrl) {
      const hit = filteredList.find((a) => a.id === selectedFromUrl);
      if (hit) return hit;
    }
    return filteredList[0] ?? null;
  }, [filteredList, selectedFromUrl]);

  const selectAnnouncement = useCallback(
    (id: string) => {
      setSearchParams({ id }, { replace: true });
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (!list.length) return;
    const inFull =
      Boolean(selectedFromUrl) &&
      list.some((a) => a.id === selectedFromUrl);
    if (!selectedFromUrl || !inFull) {
      setSearchParams({ id: list[0].id }, { replace: true });
      return;
    }
    if (!filteredList.length) return;
    const inFiltered = filteredList.some((a) => a.id === selectedFromUrl);
    if (!inFiltered) {
      setSearchParams({ id: filteredList[0].id }, { replace: true });
    }
  }, [list, filteredList, selectedFromUrl, setSearchParams]);

  const markAcknowledged = useCallback(() => {
    if (!selected?.id) return;
    const merged = Array.from(new Set([...readIds, selected.id]));
    setReadIds(merged);
    persistAnnouncementReadIds(merged);
    toast.success("Acknowledged");
  }, [readIds, selected?.id]);

  const filterMenuItems: MenuProps["items"] = useMemo(() => {
    if (!categories.length) {
      return [
        {
          key: "__all__",
          label: "All categories",
          disabled: true,
        },
      ];
    }
    return [
      {
        key: "__all__",
        label: "All categories",
        onClick: () => setCategoryFilter(null),
      },
      { type: "divider" },
      ...categories.map((c) => ({
        key: c,
        label: c,
        onClick: () => setCategoryFilter(c),
      })),
    ];
  }, [categories]);

  const loading = isLoading || isFetching;

  return (
    <div className="announcements-details-page min-h-0">
      <PageMeta
        title="Announcements - Campus Transfer Partner"
        description="Read partner announcements and institution updates."
      />
    

      <div className="flex min-h-[calc(100vh-12rem)] flex-col overflow-hidden  lg:flex-row">
        {/* Left — list */}
        <aside className="flex w-full shrink-0 flex-col border-b border-[#C7CACF] dark:border-gray-700 lg:w-[min(100%,380px)] lg:border-b-0 lg:border-r px-2">
          <div className="flex gap-2 pb-4">
            <Input
              size="large"
              placeholder="Search announcements..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="flex-1 rounded-xl"
              prefix={<Search className="h-4 w-4 text-gray-400" />}
            />
            <Dropdown
              menu={{ items: filterMenuItems }}
              trigger={["click"]}
              disabled={!categories.length}
            >
              <button
                type="button"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C7CACF] bg-white text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-[#252830] dark:text-gray-300 dark:hover:bg-gray-800 ${
                  categoryFilter ? "border-[#237D3B] text-[#237D3B]" : ""
                }`}
                aria-label="Filter by category"
              >
                <Filter className="h-4 w-4" />
              </button>
            </Dropdown>
          </div>

          <div className="max-h-[420px] flex-1 overflow-y-auto lg:max-h-none lg:flex-1">
            {loading ? (
              <div className="flex justify-center py-16">
                <Spin />
              </div>
            ) : filteredList.length === 0 ? (
              <div className="px-4 py-12">
                <Empty description="No announcements match your filters" />
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredList.map((a) => {
                  const active = selected?.id === a.id;
                  const logoUrl = getApiImageUrl(
                    a.university?.UniversityLogo ?? null,
                  );
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => selectAnnouncement(a.id)}
                        className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60 ${
                          active
                            ? "bg-[#E9F2EB]/80 dark:bg-emerald-950/20 border-l-[3px] border-l-[#237D3B]"
                            : "border-l-[3px] border-l-transparent"
                        }`}
                      >
                        <div className="shrink-0 pt-0.5">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt=""
                              className="h-11 w-11 rounded-full object-cover bg-gray-100 dark:bg-gray-800"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              {initialsFromName(displayTitle(a))}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="line-clamp-2 text-sm font-semibold text-[#20242A] dark:text-gray-100">
                              {displayTitle(a)}
                            </p>
                            <span className="flex shrink-0 items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatListDate(a.createdAt)}
                            </span>
                          </div>
                          {hasCategoryOrType(a) ? (
                            <span className="mt-1.5 inline-flex rounded-full bg-[#E9F2EB] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#237D3B] dark:bg-emerald-950/40 dark:text-emerald-300">
                              {categoryLabel(a)}
                            </span>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Right — detail */}
        <main className="flex min-w-0 flex-1 flex-col ">
          {loading && !selected ? (
            <div className="flex flex-1 items-center justify-center p-12">
              <Spin size="large" />
            </div>
          ) : !selected ? (
            <div className="flex flex-1 items-center justify-center p-12">
              <Empty description="No announcement selected" />
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-6 overflow-y-auto px-2">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {getApiImageUrl(selected.university?.UniversityLogo ?? null) ? (
                    <img
                      src={getApiImageUrl(
                        selected.university?.UniversityLogo ?? null,
                      )}
                      alt=""
                      className="h-20 w-20 shrink-0 rounded-full object-cover bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 sm:h-24 sm:w-24"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-lg font-semibold text-gray-600 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 sm:h-24 sm:w-24">
                      {initialsFromName(displayTitle(selected))}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg font-bold text-[#20242A] dark:text-gray-100 ">
                      {displayTitle(selected)}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {hasCategoryOrType(selected) ? (
                        <span className="inline-flex rounded-full bg-[#E9F2EB] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#237D3B] dark:bg-emerald-950/40 dark:text-emerald-300">
                          {categoryLabel(selected)}
                        </span>
                      ) : null}
                      <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        {formatListDate(selected.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {(hasIntakeYearValue(selected) || hasCategoryOrType(selected)) ? (
                  <div className="grid grid-cols-1 gap-4 rounded-xl border border-[#C7CACF] bg-white p-5 dark:border-gray-700 dark:bg-[#1f232b] sm:grid-cols-2">
                    {hasIntakeYearValue(selected) ? (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Intake year
                        </p>
                        <p className="mt-1 text-base font-semibold text-[#20242A] dark:text-gray-100">
                          {String(selected.intakeYear)}
                        </p>
                      </div>
                    ) : null}
                    {hasCategoryOrType(selected) ? (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Category
                        </p>
                        <p className="mt-1 text-base font-semibold text-[#20242A] dark:text-gray-100">
                          {selected.category?.trim() ||
                            selected.type?.trim() ||
                            ""}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="">
                  <AnnouncementBody body={selected.body ?? ""} />
                </div>
              </div>

              <div className="flex justify-end px-6 py-4 ">
                <button
                  type="button"
                  onClick={markAcknowledged}
                  className="rounded-lg bg-[#237D3B] px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1E6A33] focus:outline-none focus:ring-2 focus:ring-[#237D3B] focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  Acknowledge
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
