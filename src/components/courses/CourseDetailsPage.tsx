import { useNavigate } from "react-router-dom";
import { config } from "../../config";
import { getApiImageUrl } from "../../utils/getApiImageUrl";
import { toast } from "react-toastify";
import { Collapse } from "antd";
import { ChevronDown } from "lucide-react";

import type { SearchCourseItem } from "../../data/searchResultsTypes";
import type {
  SingleUniversityCourse,
  BreadcrumbItem,
  DocumentCategory,
} from "../../types/course";
import { useState, useMemo } from "react";
import { useGetUniversityFaqsQuery } from "../../redux/features/universityApi";
import ApplyPreferenceModal from "../common/Modals/Apply/ApplyPreferenceModal";
import CourseDetailsHeader from "./CourseDetailsHeader";
import CourseSidebar from "./CourseSidebar";
import RelatedCourses from "./RelatedCourses";
import RequiredDocuments from "./RequiredDocuments";

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
  const universitySlug = university?.slug || "";

  const { data: faqsData } = useGetUniversityFaqsQuery(universitySlug, {
    skip: !universitySlug,
  });

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

  const relatedCourses: SearchCourseItem[] =
    data?.relatedCourses?.map((relatedCourse) => ({
      id: relatedCourse?.id ?? "",
      title: relatedCourse?.course?.name ?? "Course",
      university: university?.name ?? "University",
      location: university?.city?.name ?? "",
      tuition: relatedCourse?.tuition
        ? `$${relatedCourse.tuition.toLocaleString()}`
        : "Contact for pricing",
      slug: relatedCourse?.course?.slug ?? undefined,
      universitySlug: university?.slug ?? undefined,
      image: university?.UniversityLogo?.url ?? undefined,
      description:
        relatedCourse?.course?.description ??
        relatedCourse?.description ??
        undefined,
    })) ?? [];

  const requiredDocuments: DocumentCategory[] = (() => {
    if (
      !data?.universityCourseDocuments ||
      data.universityCourseDocuments.length === 0
    ) {
      return [];
    }

    const categoryMap = new Map<string, DocumentCategory>();
    data.universityCourseDocuments.forEach((ucDoc) => {
      const category = ucDoc?.document?.category;
      if (!category) return;
      const categoryId = category.slug ?? category.id;
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: categoryId,
          title: category.name ?? "Documents",
          items: [],
        });
      }
      categoryMap.get(categoryId)!.items.push({
        id: ucDoc?.document?.id ?? ucDoc.id,
        label: ucDoc?.document?.name ?? "Document",
      });
    });

    return Array.from(categoryMap.values());
  })();

  const transformedFaqs = (faqsData?.data || [])
    .filter((faq) => faq.isActive)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
    .map((faq) => ({
      key: faq.id,
      label: faq.question ?? "",
      children: (
        <div className="px-4 pb-5 text-left text-sm leading-relaxed text-neutral-600 md:px-6 md:pb-6 md:text-base">
          {faq.answer ?? ""}
        </div>
      ),
      className: "border-none rounded-lg bg-primary-50/70",
    }));

  const sectionTabs = [
    {
      label: "Course Description",
      id: "course-description",
      show: description.length > 0,
    },
    {
      label: "Basic Requirements",
      id: "basic-requirements",
      show: requiredDocuments.length > 0,
    },
    { label: "Related Courses", id: "related-courses", show: relatedCourses.length > 0 },
    { label: "FAQ", id: "faqs", show: transformedFaqs.length > 0 },
  ].filter((tab) => tab.show);

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

        {sectionTabs.length > 0 && (
          <nav className="mt-6 flex w-full flex-wrap items-center gap-2">
            {sectionTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  const section = document.getElementById(tab.id);
                  if (section) {
                    section.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className="h-10 cursor-pointer rounded-[50px] bg-[#EDEEEF] px-4 text-[13px] text-[#4B5563] transition-colors hover:bg-[#DFE1E3] md:text-[14px]"
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        <div className="mt-8 lg:mt-12 ">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8 ">
            <div className="flex-[0_0_100%] lg:flex-[0_0_65%] space-y-8 md:space-y-10">
              {description.length > 0 && (
                <section id="course-description" className="space-y-4">
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
              {requiredDocuments.length > 0 && (
                <section id="basic-requirements" className="space-y-4">
                  <RequiredDocuments documents={requiredDocuments} />
                </section>
              )}
              {relatedCourses.length > 0 && (
                <section id="related-courses" className="space-y-4">
                  <RelatedCourses courses={relatedCourses} />
                </section>
              )}
              {transformedFaqs.length > 0 && (
                <section id="faqs" className="space-y-4">
                  <h2 className="text-[26px] font-semibold text-[#20242A] md:text-[30px]">
                    FAQS
                  </h2>
                  <Collapse
                    accordion
                    defaultActiveKey={["0"]}
                    expandIconPosition="end"
                    expandIcon={({ isActive }) => (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`}
                      />
                    )}
                    className="space-y-4 bg-transparent"
                    bordered={false}
                    items={transformedFaqs}
                  />
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
