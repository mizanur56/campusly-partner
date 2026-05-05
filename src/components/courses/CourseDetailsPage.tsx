import { useNavigate } from "react-router-dom";
import { config } from "../../config";
import { getApiImageUrl } from "../../utils/getApiImageUrl";
import { toast } from "react-toastify";

import type { SearchCourseItem } from "../../data/searchResultsTypes";
import type {
  SingleUniversityCourse,
  BreadcrumbItem,
} from "../../types/course";
import { useState, useMemo } from "react";
import ApplyPreferenceModal from "../common/Modals/Apply/ApplyPreferenceModal";
import CourseDetailsHeader from "./CourseDetailsHeader";
import CourseSidebar from "./CourseSidebar";

interface CourseDetailsPageProps {
  data: SingleUniversityCourse;
}

export default function CourseDetailsPage({ data }: CourseDetailsPageProps) {
  const navigate = useNavigate();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const handleApply = () => {
    setIsApplyModalOpen(true);
  };

  const handleContinueApplication = () => {
    navigate("/applications"); // later: /application/start
  };

  const university = data?.university;
  const course = data?.course;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Programs & Schools", href: "/programs-schools" },
    { label: "Courses", href: "/programs-schools?tab=courses" },
    ...(university
      ? [
          {
            label: university?.name ?? "",
            href: university?.slug
              ? `/programs-schools/universities/${university?.slug}`
              : "#",
          },
        ]
      : []),
    { label: course?.name ?? "" },
  ];

  const provider = {
    name: university?.name ?? "University",
    logo: university?.UniversityLogo?.url
      ? getApiImageUrl(university.UniversityLogo?.url)
      : undefined,
    abbreviation: university?.name
      ?.split(" ")
      ?.map((word) => word?.[0])
      ?.join("")
      ?.substring(0, 2)
      ?.toUpperCase(),
  };

  const description = data?.description
    ? (data?.description?.split("\n")?.filter((p) => p.trim()) ?? [])
    : course?.description
      ? (course?.description?.split("\n")?.filter((p) => p.trim()) ?? [])
      : [];

  const sidebarInfo = {
    tuitionFee: data?.tuition
      ? `$${data?.tuition?.toLocaleString()}`
      : "Contact for pricing",
    startDate: data?.startDates ?? university?.upcomingIntake ?? "TBA",
    duration: data?.duration
      ? `${data?.duration} ${data?.duration === 1 ? "year" : "years"}`
      : "Contact for details",
    campus: data?.campusLocation ?? university?.city?.name ?? "TBA",
    modeOfStudy: data?.studyMode?.replace(/_/g, " ") ?? "On Campus",
  };

  // Construct the share URL for social sharing
  const shareUrl =
    university?.slug && course?.slug
      ? `${config.app_domain}/courses/${university.slug}/${course.slug}`
      : "";

  const normalizeStartDates = (input: any) => {
    if (!input) return [];
    if (Array.isArray(input)) return input;

    if (typeof input === "string") {
      return input.split(",").map((s) => s.trim());
    }

    return [];
  };

  console.log(sidebarInfo);

  if (!data) {
    return (
      <div className="container pt-6 pb-24 md:pb-32 lg:pb-40 px-4 sm:px-0">
        <div className="text-center py-20">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-4">
            Course Not Found
          </h1>
          <p className="text-neutral-600">
            The course you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="">
        <CourseDetailsHeader
          breadcrumbs={breadcrumbs}
          title={course?.name ?? ""}
          provider={provider}
          onApply={handleApply}
          universityCourseId={data?.id}
        />

        <div className="mt-8 lg:mt-12 ">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8 ">
            <div className="flex-[0_0_100%] lg:flex-[0_0_65%] space-y-8 md:space-y-10">
              {description.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-[22px] font-semibold text-neutral-900 md:text-[30px]">
                    Course Description
                  </h2>
                  <div className="space-y-4 text-[15px] leading-relaxed text-neutral-600 sm:text-[16px] md:text-[17px]">
                    {description.map((paragraph, index) => (
                      <p key={`description-${index}`}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="mt-8 lg:mt-0 lg:flex-[0_0_32%]">
              <CourseSidebar
                info={sidebarInfo}
                className="lg:sticky lg:top-28 lg:self-start"
                shareUrl={shareUrl}
                courseTitle={course?.name}
              />
            </aside>
          </div>
        </div>
      </div>

      {isApplyModalOpen && (
        <ApplyPreferenceModal
          open={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          studentId={undefined} // details page → select student allowed
          showStudentSelect={true}
          data={{
            id: data?.id,
            startDates: normalizeStartDates(sidebarInfo?.startDate),
            campus: data?.campusLocation ?? university?.city?.name,
            duration: sidebarInfo?.duration,
            modeOfStudy: data?.studyMode,
          }}
        />
      )}
    </div>
  );
}
