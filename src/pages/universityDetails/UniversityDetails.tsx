import { Button } from "antd";
import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";
import Spinner from "../../components/common/Loading/Spinner";
import { getApiImageUrl } from "../../utils/getApiImageUrl";
import {
  useGetUniversityBySlugQuery,
  useGetUniversityFaqsQuery,
} from "../../redux/features/universityApi";

export default function UniversityDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const {
    data: universityData,
    isLoading: isUniversityLoading,
    isFetching: isUniversityFetching,
    isError: isUniversityError,
  } = useGetUniversityBySlugQuery(slug || "", { skip: !slug });

  const { data: faqsData, isLoading: isFaqLoading } = useGetUniversityFaqsQuery(
    slug || "",
    { skip: !slug },
  );

  const isLoading = isUniversityLoading || isUniversityFetching || isFaqLoading;
  const university = universityData?.data;
  const courses = university?.universityCourses || [];

  // Keep hooks before conditional returns to preserve hook order across renders.
  const tuitionRange = useMemo(() => {
    const values = courses
      .map((c) => c.tuition)
      .filter((v): v is number => typeof v === "number" && v > 0);
    if (!values.length) return "Contact for pricing";
    const min = Math.min(...values);
    const max = Math.max(...values);
    return min === max
      ? `$${min.toLocaleString()}`
      : `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  }, [courses]);

  if (isLoading) {
    return (
      <div className="flex min-h-[380px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isUniversityError || !university) {
    return (
      <div className="rounded-2xl border border-primary-border bg-white py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900">University not found</h2>
        <p className="mt-2 text-sm text-gray-500">This university page is unavailable.</p>
      </div>
    );
  }

  const faqs = (faqsData?.data || [])
    .filter((f) => f.isActive)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  const logo = getApiImageUrl(university.UniversityLogo?.url) || "/images/logo/logo.svg";
  const location =
    [university.city?.name, university.country?.name].filter(Boolean).join(", ") ||
    university.country?.name ||
    "Location not specified";

  return (
    <>
      <Helmet>
        <title>{university.name} | Partner Portal</title>
        <meta
          name="description"
          content={university.shortDescription || university.description || university.name}
        />
      </Helmet>

      <div className="space-y-6">
        <div className="rounded-2xl border border-primary-border bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <img src={logo} alt={university.name} className="h-14 w-14 rounded-xl border border-primary-border object-cover" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-primary-600">
                  University
                </p>
                <h1 className="text-2xl font-semibold text-gray-900">{university.name}</h1>
                <p className="mt-1 text-sm text-gray-500">{location}</p>
              </div>
            </div>
            <Button
              type="primary"
              onClick={() =>
                navigate(
                  `/programs-schools?tab=courses&university=${university.slug}&universityId=${university.id}`,
                )
              }
            >
              View Courses
            </Button>
          </div>

          {university.shortDescription || university.description ? (
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              {university.shortDescription || university.description}
            </p>
          ) : null}

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-primary-border bg-gray-50/60 p-3">
              <p className="text-xs text-gray-500">Upcoming Intake</p>
              <p className="mt-1 text-sm font-medium text-gray-800">
                {university.upcomingIntake || "TBA"}
              </p>
            </div>
            <div className="rounded-xl border border-primary-border bg-gray-50/60 p-3">
              <p className="text-xs text-gray-500">English Requirement</p>
              <p className="mt-1 text-sm font-medium text-gray-800">
                {university.englishRequirements || "Contact for details"}
              </p>
            </div>
            <div className="rounded-xl border border-primary-border bg-gray-50/60 p-3">
              <p className="text-xs text-gray-500">Tuition Range</p>
              <p className="mt-1 text-sm font-medium text-gray-800">{tuitionRange}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-primary-border bg-white p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Courses ({courses.length})
            </h2>
            <Link
              to={`/programs-schools?tab=courses&university=${university.slug}&universityId=${university.id}`}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all in Courses tab
            </Link>
          </div>

          {courses.length === 0 ? (
            <p className="text-sm text-gray-500">No active courses found for this university.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {courses.map((c) => {
                const courseSlug = c.course?.slug;
                const href = courseSlug
                  ? `/programs-schools/courses/${university.slug}/${courseSlug}`
                  : undefined;
                return (
                  <div
                    key={c.id}
                    className="rounded-xl border border-primary-border bg-gray-50/40 p-4"
                  >
                    <h3 className="text-base font-semibold text-gray-900">
                      {c.course?.name || "Course"}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>Tuition: {typeof c.tuition === "number" ? `$${c.tuition.toLocaleString()}` : "N/A"}</p>
                      <p>Duration: {c.duration ? `${c.duration} year${c.duration > 1 ? "s" : ""}` : "N/A"}</p>
                      <p>Start Dates: {c.startDates || "N/A"}</p>
                    </div>
                    {href ? (
                      <Link
                        to={href}
                        className="mt-3 inline-flex rounded-lg border border-primary-border px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-50"
                      >
                        View Details
                      </Link>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {faqs.length > 0 ? (
          <div className="rounded-2xl border border-primary-border bg-white p-5 sm:p-6">
            <h2 className="mb-3 text-xl font-semibold text-gray-900">FAQs</h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.id} className="rounded-xl border border-primary-border bg-gray-50/60 p-4">
                  <p className="font-medium text-gray-900">{faq.question}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
