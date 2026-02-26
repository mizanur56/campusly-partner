import { useState } from "react";
import { Link } from "react-router-dom";

const COUNTRIES = [
  { id: "australia", name: "Australia", flag: "https://flagcdn.com/w40/au.png" },
  { id: "uk", name: "United Kingdom", flag: "https://flagcdn.com/w40/gb.png" },
  { id: "america", name: "America", flag: "https://flagcdn.com/w40/us.png" },
];

const FOCUS_INSTITUTIONS = [
  {
    id: "1",
    name: "Macquarie University",
    degrees: "24 Degrees",
    country: "Australia",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop",
    slug: "macquarie-university",
  },
  {
    id: "2",
    name: "Monash University",
    degrees: "28 Degrees",
    country: "Australia",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=300&fit=crop",
    slug: "monash-university",
  },
  {
    id: "3",
    name: "Griffith University",
    degrees: "22 Degrees",
    country: "Australia",
    image: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400&h=300&fit=crop",
    slug: "griffith-university",
  },
  {
    id: "4",
    name: "University of Melbourne",
    degrees: "30 Degrees",
    country: "Australia",
    image: "https://images.unsplash.com/photo-1546514355-7fdc90ccbd03?w=400&h=300&fit=crop",
    slug: "university-of-melbourne",
  },
];

const INTAKE_TABS = [
  { id: "fall2025", label: "Fall 2025" },
  { id: "winter2026", label: "Winter 2026" },
];

const INTAKE_UNIVERSITIES = [
  {
    name: "MACQUARIE University",
    logo: "https://picsum.photos/seed/macquarie/112/112",
    slug: "macquarie-university",
  },
  {
    name: "MONASH University",
    logo: "https://picsum.photos/seed/monash/112/112",
    slug: "monash-university",
  },
  {
    name: "Griffith UNIVERSITY",
    logo: "https://picsum.photos/seed/griffith/112/112",
    slug: "griffith-university",
  },
];

const SPOTLIGHT_PROGRAM = {
  title: "Bachelor of Business Administration - Supply Chain Management",
  institution: "European College of Innovation",
  location: "Malta",
  logo: "https://picsum.photos/seed/eci/96/96",
  tuition: "6050 Euro",
  startDate: "Oct 2025",
  duration: "1 year",
  modeOfStudy: "Full Time",
  campus: "131, Valley Road, Birkirkara, BKR 9010, Malta",
  englishRequirement: "IELTS",
};

const WEBINAR_CARDS = [
  {
    id: "1",
    title: "Webinar: Find Your Stay",
    date: "Dec 15, 2025 • 2:00 PM",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=250&fit=crop",
    hotel: "Coronet Boutique Hotel",
    address: "123 Main Street, Sydney",
    logo: "https://picsum.photos/seed/edway1/64/64",
    logoLabel: "edway stays",
  },
  {
    id: "2",
    title: "Webinar: Find Your Stay",
    date: "Dec 18, 2025 • 3:00 PM",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop",
    hotel: "Coronet Boutique Hotel",
    address: "123 Main Street, Sydney",
    logo: "https://picsum.photos/seed/edway2/64/64",
    logoLabel: "edway stays",
  },
  {
    id: "3",
    title: "Webinar: Find Your Stay",
    date: "Dec 20, 2025 • 4:00 PM",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=250&fit=crop",
    hotel: "Coronet Boutique Hotel",
    address: "123 Main Street, Sydney",
    logo: "https://picsum.photos/seed/edway3/64/64",
    logoLabel: "edway stays",
  },
  {
    id: "4",
    title: "Webinar: Find Your Stay",
    date: "Dec 22, 2025 • 5:00 PM",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=250&fit=crop",
    hotel: "Coronet Boutique Hotel",
    address: "123 Main Street, Sydney",
    logo: "https://picsum.photos/seed/edway4/64/64",
    logoLabel: "edway stays",
  },
];

export default function HotOffers() {
  const [selectedCountry, setSelectedCountry] = useState("australia");
  const [selectedIntake, setSelectedIntake] = useState("fall2025");

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
          Hot Offers
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Exclusive offers and opportunities for your students.
        </p>
      </div>

      <div className="space-y-8 pb-8">
        {/* Country Tabs */}
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCountry(c.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${
                selectedCountry === c.id
                  ? "bg-primary-600 border-primary-600 text-white"
                  : "bg-white border-neutral-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50"
              }`}
            >
              <img src={c.flag} alt={c.name} className="w-6 h-4 object-cover rounded" />
              <span className="font-medium text-sm">{c.name}</span>
            </button>
          ))}
        </div>

        {/* Focus Institution */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Focus Institution</h2>
          <p className="text-sm text-gray-500 mb-4">
            Relevant options that meet your students&apos; needs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {FOCUS_INSTITUTIONS.map((inst) => (
              <Link
                key={inst.id}
                to={`/programs-schools/universities/${inst.slug}`}
                className="group flex flex-col rounded-[24px] border border-neutral-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
              >
                <div className="relative aspect-[3/2] w-full overflow-hidden bg-neutral-100">
                  <img
                    src={inst.image}
                    alt={inst.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-semibold text-neutral-900 text-base sm:text-[17px] md:text-lg line-clamp-2 group-hover:text-primary-700 transition-colors">
                    {inst.name}
                  </h3>
                  <p className="text-sm text-neutral-600 mt-1">{inst.degrees}</p>
                  <p className="text-sm text-neutral-500 mt-0.5">{inst.country}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Open for Upcoming Intakes */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Open for Upcoming Intakes
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            These universities and colleges are currently accepting applications - submit yours now.
          </p>
          <div className="flex gap-2 mb-6">
            {INTAKE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedIntake(tab.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                  selectedIntake === tab.id
                    ? "bg-primary-600 border-primary-600 text-white"
                    : "bg-white border-neutral-200 text-gray-500 hover:text-gray-700 hover:border-primary-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTAKE_UNIVERSITIES.map((u) => (
              <Link
                key={u.slug}
                to={`/programs-schools/universities/${u.slug}`}
                className="group flex items-center gap-4 rounded-lg border border-neutral-100 bg-white p-4 md:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
              >
                <div className="relative flex h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
                  <img
                    src={u.logo}
                    alt={u.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.classList.remove("hidden");
                        fallback.classList.add("flex", "items-center", "justify-center");
                      }
                    }}
                  />
                  <span className="absolute inset-0 hidden bg-primary-50 text-sm font-bold text-primary-700">
                    {u.name.split(" ")[0].slice(0, 2)}
                  </span>
                </div>
                <span className="font-semibold text-gray-900 text-sm md:text-base group-hover:text-primary-700 transition-colors line-clamp-2">
                  {u.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* This Week's Program Spotlight */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            This Week&apos;s Program Spotlight
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Your students will love this up and coming program. Claim their seats before it&apos;s too late.
          </p>
          <div className="rounded-[24px] border border-neutral-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="p-5 md:p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-neutral-100">
                  <img
                    src={SPOTLIGHT_PROGRAM.logo}
                    alt={SPOTLIGHT_PROGRAM.institution}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                    {SPOTLIGHT_PROGRAM.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">{SPOTLIGHT_PROGRAM.location}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-primary-50/50 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Tuition Fee</p>
                  <p className="font-semibold text-gray-900">{SPOTLIGHT_PROGRAM.tuition}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Start date</p>
                  <p className="font-semibold text-gray-900">{SPOTLIGHT_PROGRAM.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-semibold text-gray-900">{SPOTLIGHT_PROGRAM.duration}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Mode of study</p>
                  <p className="font-semibold text-gray-900">{SPOTLIGHT_PROGRAM.modeOfStudy}</p>
                </div>
              </div>
              <div className="space-y-2 mb-5">
                <p className="text-sm">
                  <span className="text-gray-500">Campus: </span>
                  <span className="text-gray-900">{SPOTLIGHT_PROGRAM.campus}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">English Requirement: </span>
                  <span className="text-gray-900">{SPOTLIGHT_PROGRAM.englishRequirement}</span>
                </p>
              </div>
              <Link
                to="/programs-schools"
                className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </section>

        {/* Application to Arrival Services */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Application to Arrival Services
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            New ways to help your students along every part of their journey.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {WEBINAR_CARDS.map((card) => (
              <div
                key={card.id}
                className="group flex flex-col rounded-[24px] border border-neutral-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
              >
                <div className="relative aspect-[3/2] w-full overflow-hidden bg-neutral-100">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-white/95 pl-1 pr-2 py-1 shadow-sm">
                    <img
                      src={card.logo}
                      alt={card.logoLabel}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-medium text-gray-700">{card.logoLabel}</span>
                  </span>
                </div>
                <div className="p-3 md:p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 text-[14px] sm:text-[15px] line-clamp-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{card.date}</p>
                  <div className="mt-2 flex-1">
                    <p className="font-medium text-xs text-gray-900 line-clamp-1">{card.hotel}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{card.address}</p>
                  </div>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-lg border border-primary-500 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Grow with Campus Transfer Banner */}
        <section className="rounded-[24px] overflow-hidden border border-neutral-100 shadow-sm w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[120px] md:min-h-[140px]">
            <div className="bg-primary-700 p-4 md:p-5 flex flex-col justify-center">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1.5">
                Grow with Campus Transfer
              </h2>
              <p className="text-primary-100 text-base mb-3 max-w-md">
                Partner with us for student leads, marketing support, and global reach.
              </p>
              <Link
                to="/register"
                className="inline-flex w-fit items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 transition-colors"
              >
                Join Now
              </Link>
            </div>
            <div className="min-h-[100px] md:min-h-[140px] bg-neutral-200 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=300&fit=crop"
                alt="Partner with Campus Transfer"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
