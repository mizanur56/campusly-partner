import { Modal } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import {
  HotOfferServiceItem,
  useGetHotOffersQuery,
} from "../../redux/features/hotOffers/hotOffersApi";
import { getApiImageUrl } from "../../utils/getApiImageUrl";
import "./HotOffers.css";
import HotOffersSkeleton from "./HotOffersSkeleton";

function getImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  return getApiImageUrl(url);
}

/** Shown when the banner has no `imageUrl` (portrait, suit — matches hero mock). */
const HOT_OFFERS_HERO_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&crop=faces&w=1400&q=85";

export default function HotOffers() {
  const [selectedCountryId, setSelectedCountryId] = useState<
    string | undefined
  >(undefined);
  const [selectedIntakeId, setSelectedIntakeId] = useState<string | undefined>(
    undefined,
  );
  const [serviceModalItem, setServiceModalItem] =
    useState<HotOfferServiceItem | null>(null);

  const { data, isLoading, isFetching } = useGetHotOffersQuery({
    countryId: selectedCountryId,
    intakeId: selectedIntakeId,
  });
  const isPageLoading = isLoading;
  const isContentLoading = isFetching && !isLoading;

  const countryTabs = data?.countryTabs ?? [];
  const focusInstitutions = data?.focusInstitutions ?? [];
  const upcomingIntakes = data?.upcomingIntakes;
  const intakes = upcomingIntakes?.intakes ?? [];
  const intakeUniversities = upcomingIntakes?.universities ?? [];
  const programSpotlight = data?.programSpotlight ?? [];
  const servicesSection = data?.servicesSection;
  const banner = data?.banner;

  const effectiveCountryId =
    selectedCountryId ?? data?.selectedCountryId ?? null;
  const effectiveIntakeId =
    selectedIntakeId ?? upcomingIntakes?.selectedIntakeId ?? intakes[0]?.id;

  return (
    <>
      <PageMeta
        title="Hot Offers - Campus Transfer Partner"
        description="Exclusive offers and opportunities for your students."
      />
      <PageHeader
        title="Hot Offers"
        subtitle="Exclusive offers and opportunities for your students."
        breadcrumbs={[{ title: "Home", path: "/" }, { title: "Hot Offers" }]}
      />

      {isPageLoading ? (
        <HotOffersSkeleton />
      ) : (
        <div className="space-y-8 pb-8">
          {/* Country Tabs */}
          {countryTabs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {countryTabs.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCountryId(c.countryId);
                    setSelectedIntakeId(undefined);
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-[6px] border transition-all ${
                    effectiveCountryId === c.countryId
                      ? "bg-primary-600 border-primary-600 text-white"
                      : "bg-white border-neutral-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50"
                  }`}
                >
                  {c.flagUrl && (
                    <img
                      src={getImageUrl(c.flagUrl)}
                      alt={c.name}
                      className="w-6 h-4 object-cover rounded"
                    />
                  )}
                  <span className="font-medium text-sm">{c.name}</span>
                </button>
              ))}
            </div>
          )}

          {isContentLoading && <HotOffersSkeleton hideCountryTabs />}

          {!isContentLoading && (
            <>
          {/* Focus Institutions */}
          {focusInstitutions.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Focus Institution
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Relevant options that meet your students&apos; needs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                {focusInstitutions.map((inst) => (
                  <Link
                    key={inst.id}
                    to={
                      inst.universitySlug
                        ? `/programs-schools/universities/${inst.universitySlug}`
                        : "/programs-schools"
                    }
                    className="group flex flex-col rounded-[24px] border border-primary-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                  >
                    <div className="relative aspect-[3/2] w-full overflow-hidden bg-neutral-100 flex items-center justify-center">
                      {inst.logoUrl ? (
                        <img
                          src={getImageUrl(inst.logoUrl)}
                          alt={inst.name}
                          className="max-h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-primary-600">
                          {inst.name.slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="font-semibold text-neutral-900 text-base sm:text-[17px] md:text-lg line-clamp-2 group-hover:text-primary-700 transition-colors">
                        {inst.name}
                      </h3>
                      <p className="text-sm text-[#237D3B] bg-[#E9F2EB] my-3 rounded-lg px-2 py-1 w-fit">
                        {inst.totalCourses}{" "}
                        {inst.totalCourses === 1 ? "Course" : "Courses"}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {inst.countryName}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Intakes */}
          {intakes.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Open for Upcoming Intakes
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                These universities and colleges are currently accepting
                applications - submit yours now
              </p>
              <div className="flex border-b border-gray-200 mb-6">
                {intakes.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedIntakeId(tab.id)}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                      effectiveIntakeId === tab.id
                        ? "border-primary-600 text-gray-900"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
              <div
                className={`overflow-hidden transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div className="intake-marquee-track">
                  {[...intakeUniversities, ...intakeUniversities].map(
                    (u, i) => (
                      <Link
                        key={`${u.id}-${i}`}
                        to={
                          u.universitySlug
                            ? `/programs-schools/universities/${u.universitySlug}`
                            : "/programs-schools"
                        }
                        className="group mx-3 flex w-40 shrink-0 items-center justify-center py-4"
                      >
                        <div className="flex h-20 w-full items-center justify-center">
                          {u.logoUrl ? (
                            <img
                              src={getImageUrl(u.logoUrl)}
                              alt={u.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center bg-primary-50 text-sm font-bold text-primary-700">
                              {u.name.slice(0, 2)}
                            </span>
                          )}
                        </div>
                      </Link>
                    ),
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Program Spotlight */}
          {programSpotlight.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                This Week&apos;s Program Spotlight
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Your students will love this up-and-coming program. Claim their
                seats before it&apos;s too late
              </p>
              {programSpotlight.map((spot) => (
                <div
                  key={spot.id}
                  className="rounded-[24px] border border-primary-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden mb-4 last:mb-0 p-5 md:p-6"
                >
                  {/* Institution header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-neutral-100">
                      {spot.institutionLogo ? (
                        <img
                          src={getImageUrl(spot.institutionLogo)}
                          alt={spot.institutionName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-lg font-bold text-primary-600">
                          {spot.institutionName.slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                        {spot.courseName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {spot.countryName}
                      </p>
                    </div>
                  </div>

                  {/* Info box */}
                  <div className="rounded-2xl bg-[#EBF5EC] p-4 mb-4">
                    {spot.tuitionFee != null && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-0.5">
                          Tuition Fee
                        </p>
                        <p className="text-xl font-bold text-primary-600">
                          {spot.tuitionFee}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-gray-500 shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            strokeWidth="1.5"
                          />
                          <line
                            x1="16"
                            y1="2"
                            x2="16"
                            y2="6"
                            strokeWidth="1.5"
                          />
                          <line x1="8" y1="2" x2="8" y2="6" strokeWidth="1.5" />
                          <line
                            x1="3"
                            y1="10"
                            x2="21"
                            y2="10"
                            strokeWidth="1.5"
                          />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500">Start date</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {spot.startDate || "-"}
                          </p>
                        </div>
                      </div>

                      {spot.duration && (
                        <div className="flex items-start gap-2">
                          <svg
                            className="w-5 h-5 text-gray-500 shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                            <polyline
                              points="12 6 12 12 16 14"
                              strokeWidth="1.5"
                            />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-500">Duration</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {spot.duration} Year
                            </p>
                          </div>
                        </div>
                      )}
                      {spot.campusAddress && (
                        <div className="flex items-start gap-2">
                          <svg
                            className="w-5 h-5 text-gray-500 shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M3 21h18M9 21V7l9-4v18"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                            <path d="M3 7l6-4" strokeWidth="1.5" />
                            <rect
                              x="9"
                              y="11"
                              width="4"
                              height="4"
                              strokeWidth="1.5"
                            />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-500">Campus</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {spot.campusAddress}
                            </p>
                          </div>
                        </div>
                      )}
                      {spot.modeOfStudy && (
                        <div className="flex items-start gap-2">
                          <svg
                            className="w-5 h-5 text-gray-500 shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
                              strokeWidth="1.5"
                            />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-500">
                              Mode of study
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {spot.modeOfStudy}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-gray-500 shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                            strokeWidth="1.5"
                          />
                          <polyline points="14 2 14 8 20 8" strokeWidth="1.5" />
                          <line
                            x1="9"
                            y1="13"
                            x2="15"
                            y2="13"
                            strokeWidth="1.5"
                          />
                          <line
                            x1="9"
                            y1="17"
                            x2="15"
                            y2="17"
                            strokeWidth="1.5"
                          />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500">
                            English Requirement
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {spot.englishRequirement || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Apply Now - full width outlined */}
                  <Link
                    to="/programs-schools"
                    className="block w-full rounded-lg border border-primary-600 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors text-center"
                  >
                    Apply Now
                  </Link>
                </div>
              ))}
            </section>
          )}

          {/* Services Section */}
          {servicesSection && servicesSection.items?.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {servicesSection.sectionTitle}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {servicesSection.sectionDescription}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {servicesSection.items.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-col rounded-[24px] border border-primary-border bg-[#FFFFFF] shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-200  hover:border-primary-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                  >
                    <div className="relative aspect-[3/2] w-full overflow-hidden bg-neutral-100">
                      {item.imageUrl ? (
                        <img
                          src={getImageUrl(item.imageUrl)}
                          alt={item.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : null}
                    </div>
                    <div className="p-3 md:p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 text-[14px] sm:text-[15px] line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.publishDate
                          ? new Date(item.publishDate).toLocaleDateString()
                          : ""}
                      </p>
                      {item.intro && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {item.intro}
                        </p>
                      )}
                      <button
                        onClick={() => setServiceModalItem(item)}
                        className="mt-3 w-full rounded-lg border border-primary-500 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors text-center"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Banner */}
          {banner && banner.status === "ACTIVE" && (
            <section className="hot-offers-hero w-full overflow-hidden rounded-[32px] border border-[#0f3d24]/30 shadow-[0_16px_48px_rgba(10,46,26,0.28)]">
              {/* Clip path: ~55% banner width at top/bottom, ~60% at vertical center (convex into photo) */}
              <svg
                width={0}
                height={0}
                className="absolute overflow-hidden"
                aria-hidden
              >
                <defs>
                  <clipPath
                    id="hot-offers-hero-clip"
                    clipPathUnits="objectBoundingBox"
                  >
                    <path
                      d="M 0,0 L 0.86,0 Q 0.935,0.5 0.86,1 L 0,1 Z"
                      fill="white"
                    />
                  </clipPath>
                </defs>
              </svg>

              <div className="relative flex min-h-[260px] flex-col md:min-h-[320px]">
                {/* Photo: full-bleed behind on desktop; stacked under text on mobile */}
                <div className="relative z-0 order-2 min-h-[220px] w-full bg-[#1a1a1a] md:absolute md:inset-0 md:order-none md:min-h-full">
                  <img
                    src={
                      banner.imageUrl
                        ? getImageUrl(banner.imageUrl)
                        : HOT_OFFERS_HERO_FALLBACK_IMAGE
                    }
                    alt={banner.title}
                    className="h-full min-h-[220px] w-full object-cover object-[center_22%] md:absolute md:inset-0 md:min-h-full md:object-[center_25%]"
                  />
                </div>

                {/* Green panel — clipped curve on md; image shows through outside the path */}
                <div
                  className="hot-offers-hero__green relative z-10 order-1 flex w-full flex-col justify-center px-8 py-10 text-white md:absolute md:inset-y-0 md:left-0 md:w-[64%] md:max-w-none md:px-10 md:py-12 lg:px-12 lg:py-14"
                  style={{ backgroundColor: "#0a3116" }}
                >
                  <div
                    className="pointer-events-none absolute left-0 top-0 h-64 w-64 -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#1b4d2e]/70 blur-[56px] md:h-80 md:w-80 md:bg-[#1a5c32]/60"
                    aria-hidden
                  />
                  <div className="relative z-10 flex max-w-xl flex-col gap-3 md:gap-4">
                    <h2 className="text-[1.65rem] font-bold leading-[1.2] tracking-tight text-white md:text-3xl lg:text-[2rem] lg:leading-tight">
                      {banner.title}
                    </h2>
                    <p className="text-[0.9375rem] font-normal leading-relaxed text-white/95 md:text-base">
                      {banner.description}
                    </p>
                    <div className="pt-2 md:pt-3">
                      <a
                        href={banner.buttonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg bg-[#237d3b] px-7 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#1f6d33] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30"
                      >
                        {banner.buttonText}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {!isPageLoading &&
            !data?.countryTabs?.length &&
            !focusInstitutions.length &&
            !intakes.length &&
            !programSpotlight.length &&
            !servicesSection?.items?.length &&
            !banner && (
              <div className="rounded-lg border border-primary-border bg-gray-50 p-8 text-center text-gray-500">
                No hot offers configured yet. Check back later.
              </div>
            )}
            </>
          )}
        </div>
      )}
      <Modal
        open={serviceModalItem !== null}
        onCancel={() => setServiceModalItem(null)}
        footer={null}
        centered
        width={600}
        styles={{
          content: { padding: 0, borderRadius: 16, overflow: "hidden" },
        }}
      >
        {serviceModalItem && (
          <div>
            {serviceModalItem.imageUrl && (
              <div className="w-full aspect-[16/7] overflow-hidden bg-neutral-100">
                <img
                  src={getImageUrl(serviceModalItem.imageUrl)}
                  alt={serviceModalItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <p className="text-xs text-gray-400 mb-2">
                {serviceModalItem.publishDate
                  ? new Date(serviceModalItem.publishDate).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "long", year: "numeric" },
                    )
                  : ""}
              </p>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                {serviceModalItem.title}
              </h2>
              {serviceModalItem.intro && (
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  {serviceModalItem.intro}
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
