import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { useGetHotOffersQuery } from "../../redux/features/hotOffers/hotOffersApi";
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

  const { data, isLoading, isFetching } =
    useGetHotOffersQuery(selectedCountryId);
  const isPageLoading = isLoading || isFetching;

  const countryTabs = data?.countryTabs ?? [];
  const focusInstitutions = data?.focusInstitutions ?? [];
  const upcomingIntakes = data?.upcomingIntakes;
  const intakes = upcomingIntakes?.intakes ?? [];
  const intakeUniversities = useMemo(() => {
    if (
      selectedIntakeId &&
      upcomingIntakes?.selectedIntakeId === selectedIntakeId
    ) {
      return upcomingIntakes.universities ?? [];
    }
    return upcomingIntakes?.universities ?? [];
  }, [upcomingIntakes, selectedIntakeId]);
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
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${
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

          {/* Focus Institutions */}
          {focusInstitutions.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Focus Institution
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Relevant options that meet your students&apos; needs.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {focusInstitutions.map((inst) => (
                  <Link
                    key={inst.id}
                    to="/programs-schools"
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
                applications.
              </p>
              <div className="flex gap-2 mb-6">
                {intakes.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedIntakeId(tab.id)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                      effectiveIntakeId === tab.id
                        ? "bg-primary-600 border-primary-600 text-white"
                        : "bg-white border-neutral-200 text-gray-500 hover:text-gray-700 hover:border-primary-200"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {intakeUniversities.map((u) => (
                  <Link
                    key={u.id}
                    to="/programs-schools"
                    className="group flex items-center gap-4 rounded-lg border border-primary-border bg-white p-4 md:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                  >
                    <div className="relative flex h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-primary-border bg-neutral-50">
                      {u.logoUrl ? (
                        <img
                          src={getImageUrl(u.logoUrl)}
                          alt={u.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-primary-50 text-sm font-bold text-primary-700">
                          {u.name.slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm md:text-base group-hover:text-primary-700 transition-colors line-clamp-2">
                      {u.name}
                    </span>
                  </Link>
                ))}
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
                Your students will love this up and coming program.
              </p>
              {programSpotlight.map((spot) => (
                <div
                  key={spot.id}
                  className="rounded-[24px] border border-primary-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden mb-4 last:mb-0"
                >
                  <div className="p-5 md:p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-neutral-100">
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
                        <p className="text-sm text-gray-600 mt-0.5">
                          {spot.institutionName}, {spot.countryName}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-primary-50/50 mb-4">
                      {spot.tuitionFee != null && (
                        <div>
                          <p className="text-xs text-gray-500">Tuition Fee</p>
                          <p className="font-semibold text-gray-900">
                            {spot.tuitionFee}
                          </p>
                        </div>
                      )}
                      {spot.startDate && (
                        <div>
                          <p className="text-xs text-gray-500">Start date</p>
                          <p className="font-semibold text-gray-900">
                            {spot.startDate}
                          </p>
                        </div>
                      )}
                      {spot.duration && (
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="font-semibold text-gray-900">
                            {spot.duration}
                          </p>
                        </div>
                      )}
                      {spot.modeOfStudy && (
                        <div>
                          <p className="text-xs text-gray-500">Mode of study</p>
                          <p className="font-semibold text-gray-900">
                            {spot.modeOfStudy}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 mb-5">
                      {spot.campusAddress && (
                        <p className="text-sm">
                          <span className="text-gray-500">Campus: </span>
                          <span className="text-gray-900">
                            {spot.campusAddress}
                          </span>
                        </p>
                      )}
                      {spot.englishRequirement && (
                        <p className="text-sm">
                          <span className="text-gray-500">
                            English Requirement:{" "}
                          </span>
                          <span className="text-gray-900">
                            {spot.englishRequirement}
                          </span>
                        </p>
                      )}
                    </div>
                    <Link
                      to="/programs-schools"
                      className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
                    >
                      Apply Now
                    </Link>
                  </div>
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
                      <Link
                        to={item.slug ? `/academy/${item.slug}` : "/academy"}
                        className="mt-3 w-full rounded-lg border border-primary-500 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors text-center"
                      >
                        Learn More
                      </Link>
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
        </div>
      )}
    </>
  );
}
