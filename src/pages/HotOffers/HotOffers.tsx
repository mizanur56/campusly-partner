import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { useGetHotOffersQuery } from "../../redux/features/hotOffers/hotOffersApi";
import HotOffersSkeleton from "./HotOffersSkeleton";
import { getApiImageUrl } from "../../utils/getApiImageUrl";

function getImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  return getApiImageUrl(url);
}

export default function HotOffers() {
  const [selectedCountryId, setSelectedCountryId] = useState<string | undefined>(undefined);
  const [selectedIntakeId, setSelectedIntakeId] = useState<string | undefined>(undefined);

  const { data, isLoading, isFetching } = useGetHotOffersQuery(selectedCountryId);
  const isPageLoading = isLoading || isFetching;

  const countryTabs = data?.countryTabs ?? [];
  const focusInstitutions = data?.focusInstitutions ?? [];
  const upcomingIntakes = data?.upcomingIntakes;
  const intakes = upcomingIntakes?.intakes ?? [];
  const intakeUniversities = useMemo(() => {
    if (selectedIntakeId && upcomingIntakes?.selectedIntakeId === selectedIntakeId) {
      return upcomingIntakes.universities ?? [];
    }
    return upcomingIntakes?.universities ?? [];
  }, [upcomingIntakes, selectedIntakeId]);
  const programSpotlight = data?.programSpotlight ?? [];
  const servicesSection = data?.servicesSection;
  const banner = data?.banner;

  const effectiveCountryId = selectedCountryId ?? data?.selectedCountryId ?? null;
  const effectiveIntakeId = selectedIntakeId ?? upcomingIntakes?.selectedIntakeId ?? intakes[0]?.id;

  return (
    <>
      <PageMeta
        title="Hot Offers - Campus Transfer Partner"
        description="Exclusive offers and opportunities for your students."
      />
      <PageHeader
        title="Hot Offers"
        subtitle="Exclusive offers and opportunities for your students."
        breadcrumbs={[
          { title: "Home", path: "/" },
          { title: "Hot Offers" },
        ]}
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
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Focus Institution</h2>
              <p className="text-sm text-gray-500 mb-4">
                Relevant options that meet your students&apos; needs.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {focusInstitutions.map((inst) => (
                  <Link
                    key={inst.id}
                    to="/programs-schools"
                    className="group flex flex-col rounded-[24px] border border-neutral-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
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
                      <p className="text-sm text-neutral-600 mt-1">
                        {inst.totalCourses} {inst.totalCourses === 1 ? "Course" : "Courses"}
                      </p>
                      <p className="text-sm text-neutral-500 mt-0.5">{inst.countryName}</p>
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
                These universities and colleges are currently accepting applications.
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
                    className="group flex items-center gap-4 rounded-lg border border-neutral-100 bg-white p-4 md:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                  >
                    <div className="relative flex h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
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
                  className="rounded-[24px] border border-neutral-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden mb-4 last:mb-0"
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
                          <p className="font-semibold text-gray-900">{spot.tuitionFee}</p>
                        </div>
                      )}
                      {spot.startDate && (
                        <div>
                          <p className="text-xs text-gray-500">Start date</p>
                          <p className="font-semibold text-gray-900">{spot.startDate}</p>
                        </div>
                      )}
                      {spot.duration && (
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="font-semibold text-gray-900">{spot.duration}</p>
                        </div>
                      )}
                      {spot.modeOfStudy && (
                        <div>
                          <p className="text-xs text-gray-500">Mode of study</p>
                          <p className="font-semibold text-gray-900">{spot.modeOfStudy}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 mb-5">
                      {spot.campusAddress && (
                        <p className="text-sm">
                          <span className="text-gray-500">Campus: </span>
                          <span className="text-gray-900">{spot.campusAddress}</span>
                        </p>
                      )}
                      {spot.englishRequirement && (
                        <p className="text-sm">
                          <span className="text-gray-500">English Requirement: </span>
                          <span className="text-gray-900">{spot.englishRequirement}</span>
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
              <p className="text-sm text-gray-500 mb-4">{servicesSection.sectionDescription}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {servicesSection.items.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-col rounded-[24px] border border-neutral-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
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
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.intro}</p>
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
            <section className="w-full rounded-[24px] overflow-hidden border border-neutral-100 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
              <div className="relative flex flex-col md:flex-row-reverse min-h-[180px] md:min-h-[200px]">
                {/* Decorative background glow */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-50/70 via-transparent to-primary-100/80" />

                {/* Image side */}
                <div className="relative z-10 w-full md:w-[340px] shrink-0 h-44 md:h-auto md:min-h-[200px] bg-neutral-100 overflow-hidden">
                  {banner.imageUrl ? (
                    <img
                      src={getImageUrl(banner.imageUrl)}
                      alt={banner.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
                  )}
                </div>

                {/* Content side */}
                <div className="relative z-10 flex-1 flex flex-col justify-center gap-3 px-6 py-6 md:px-8 md:py-8 bg-gradient-to-br from-primary-700 via-primary-700 to-primary-600">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-primary-50 backdrop-blur-sm border border-white/20 w-fit">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Limited-time Partner Offer
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                    {banner.title}
                  </h2>
                  <p className="text-primary-100 text-sm md:text-base max-w-xl leading-relaxed">
                    {banner.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <a
                      href={banner.buttonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 shadow-sm transition-all hover:bg-primary-50 hover:shadow-md"
                    >
                      {banner.buttonText}
                    </a>
                    <span className="text-xs md:text-sm text-primary-100/80">
                      Help your students secure these offers before seats run out.
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {!isPageLoading && !data?.countryTabs?.length && !focusInstitutions.length && !intakes.length && !programSpotlight.length && !servicesSection?.items?.length && !banner && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
              No hot offers configured yet. Check back later.
            </div>
          )}
        </div>
      )}
    </>
  );
}
