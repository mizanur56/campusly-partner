import type { MenuProps } from "antd";
import { Dropdown, Empty, Spin } from "antd";
import { Calendar, Filter, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import { decodeHtmlEntities, looksLikeHtml } from "../../lib/htmlContent";
import {
  PARTNER_ANNOUNCEMENT_READ_IDS_EVENT,
  PARTNER_ANNOUNCEMENT_READ_IDS_KEY,
  getStoredAnnouncementReadIds,
  persistAnnouncementReadIds,
} from "../../lib/partnerAnnouncementReadIds";
import { useGetAnnouncementsQuery } from "../../redux/features/announcements/announcementsApi";
import { getApiImageUrl } from "../../utils/getApiImageUrl";

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
  const html = decodeHtmlEntities(trimmed);
  const looksHtml = looksLikeHtml(html);
  if (looksHtml) {
    return (
      <div
        className="announcement-html max-w-none text-[15px] leading-relaxed text-[#20242A] dark:text-gray-200 [&_strong]:font-semibold [&_p]:mb-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#20242A] dark:text-gray-200">
      {html}
    </div>
  );
}

export default function AnnouncementsDetailsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFromUrl = searchParams.get("id");

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);
  const announcementQueryParams = useMemo(
    () => ({ page: 1, limit: 100, isActive: true }),
    [],
  );

  const { data, isLoading } = useGetAnnouncementsQuery(
    announcementQueryParams,
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
    const syncReadIds = () => setReadIds(getStoredAnnouncementReadIds());
    syncReadIds();

    const onReadIdsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<string[]>).detail;
      setReadIds(Array.isArray(detail) ? detail : getStoredAnnouncementReadIds());
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === PARTNER_ANNOUNCEMENT_READ_IDS_KEY) syncReadIds();
    };

    window.addEventListener(PARTNER_ANNOUNCEMENT_READ_IDS_EVENT, onReadIdsUpdated);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncReadIds);

    return () => {
      window.removeEventListener(
        PARTNER_ANNOUNCEMENT_READ_IDS_EVENT,
        onReadIdsUpdated,
      );
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncReadIds);
    };
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
      Boolean(selectedFromUrl) && list.some((a) => a.id === selectedFromUrl);
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
    if (readIds.includes(selected.id)) return;
    const merged = Array.from(new Set([...readIds, selected.id]));
    setReadIds(merged);
    persistAnnouncementReadIds(merged);
    toast.success("Acknowledged");
  }, [readIds, selected?.id]);

  const isSelectedAcknowledged = Boolean(
    selected?.id && readIds.includes(selected.id),
  );

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

  const showInitialLoading = isLoading && !data;

  return (
    <div className="announcements-details-page -mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8">
      <PageMeta
        title="Announcements - Campus Transfer Partner"
        description="Read partner announcements and institution updates."
      />

      <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden lg:flex-row">
        {/* Left — list */}
        <aside className="flex w-full shrink-0 flex-col border-b border-primary-border dark:border-gray-700 lg:w-[320px] lg:border-b-0 lg:border-r">
          {/* Search + Filter */}
          <div className="flex items-center gap-2 p-4 pt-5 pb-3 border-b border-primary-border dark:border-gray-700">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-primary-border bg-white text-sm text-[#20242A] placeholder:text-gray-400 focus:outline-none focus:border-primary dark:bg-[#252830] dark:text-gray-100 dark:border-gray-600 transition-colors"
              />
            </div>
            <Dropdown
              menu={{ items: filterMenuItems }}
              trigger={["click"]}
              disabled={!categories.length}
            >
              <button
                type="button"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                  categoryFilter
                    ? "border-primary bg-primary-50 text-primary"
                    : "border-primary-border bg-white text-gray-500 hover:border-primary hover:text-primary"
                } dark:bg-[#252830] dark:border-gray-600`}
                aria-label="Filter by category"
              >
                <Filter className="h-4 w-4" />
              </button>
            </Dropdown>
          </div>

          {/* List */}
          <div className="max-h-[420px] flex-1 overflow-y-auto no-scrollbar lg:max-h-none">
            {showInitialLoading ? (
              <div className="flex justify-center py-16">
                <Spin />
              </div>
            ) : filteredList.length === 0 ? (
              <div className="px-4 py-12">
                <Empty description="No announcements match your filters" />
              </div>
            ) : (
              <ul>
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
                        className={`flex w-full gap-3 px-4 py-3.5 text-left transition-colors border-l-[3px] ${
                          active
                            ? "bg-primary-50"
                            : "border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-800/60"
                        }`}
                      >
                        <div className="shrink-0">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover bg-gray-100 dark:bg-gray-800"
                            />
                          ) : (
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ${
                                active
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                            >
                              {initialsFromName(displayTitle(a))}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`line-clamp-2 text-sm font-semibold leading-snug ${active ? "text-primary" : "text-[#20242A] dark:text-gray-100"}`}
                          >
                            {displayTitle(a)}
                          </p>
                          <span className="mt-1 flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {formatListDate(a.createdAt)}
                          </span>
                          {hasCategoryOrType(a) ? (
                            <span className="mt-1.5 inline-flex rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary dark:bg-primary/20">
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
        <main className="flex min-w-0 flex-1 flex-col">
          {showInitialLoading && !selected ? (
            <div className="flex flex-1 items-center justify-center p-12">
              <Spin size="large" />
            </div>
          ) : !selected ? (
            <div className="flex flex-1 items-center justify-center p-12">
              <Empty description="No announcement selected" />
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 space-y-5 p-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                  {getApiImageUrl(
                    selected.university?.UniversityLogo ?? null,
                  ) ? (
                    <img
                      src={getApiImageUrl(
                        selected.university?.UniversityLogo ?? null,
                      )}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-primary-border"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-50 text-base font-bold text-primary ring-1 ring-primary-border">
                      {initialsFromName(displayTitle(selected))}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h1 className="text-[18px] font-bold leading-snug text-[#20242A] dark:text-gray-100">
                      {selected.title || displayTitle(selected)}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatListDate(selected.createdAt)}
                      </span>
                      {hasCategoryOrType(selected) ? (
                        <span className="inline-flex rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary dark:bg-primary/20">
                          {categoryLabel(selected)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Meta card */}
                {(hasIntakeYearValue(selected) ||
                  hasCategoryOrType(selected)) && (
                  <div className="grid grid-cols-2 gap-4 rounded-xl border border-primary-border bg-gray-50 p-4 dark:border-gray-700 dark:bg-[#1f232b]">
                    {hasIntakeYearValue(selected) && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Intake year
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-[#20242A] dark:text-gray-100">
                          {String(selected.intakeYear)}
                        </p>
                      </div>
                    )}
                    {hasCategoryOrType(selected) && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Category
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-[#20242A] dark:text-gray-100">
                          {selected.category?.trim() ||
                            selected.type?.trim() ||
                            ""}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <AnnouncementBody body={selected.body ?? ""} />
              </div>

              <div className="flex justify-end border-t border-primary-border px-6 py-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={markAcknowledged}
                  disabled={isSelectedAcknowledged}
                  className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors focus:outline-none ${
                    isSelectedAcknowledged
                      ? "cursor-not-allowed bg-gray-200 text-gray-500"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  {isSelectedAcknowledged ? "Acknowledged" : "Acknowledge"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
