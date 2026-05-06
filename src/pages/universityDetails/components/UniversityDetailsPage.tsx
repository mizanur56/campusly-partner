import { config } from "../../../config";
import type { BreadcrumbItem, UniversityDetails, UniversityFaq } from "../../../types/course";
import { getApiImageUrl } from "../../../utils/getApiImageUrl";
import UniversityAbout from "./UniversityAbout";
import UniversityCourses from "./UniversityCourses";
import UniversityFaqComponent from "./UniversityFaq";
import UniversityGallery from "./UniversityGallery";
import UniversityHeader from "./UniversityHeader";
import UniversityRequiredDocuments from "./UniversityRequiredDocuments";
import UniversitySidebar from "./UniversitySidebar";
import UniversityTabs from "./UniversityTabs";

export default function UniversityDetailsPage({ data, faqs }: { data: UniversityDetails; faqs: UniversityFaq[] }) {
  const logoUrl = data?.UniversityLogo ? getApiImageUrl(data.UniversityLogo) : "/assets/default-university-logo.png";
  const headerData = { name: data.name ?? "", country: data.country?.name ?? "", logo: logoUrl };
  const aboutData = { title: "About", description: data.shortDescription ?? data.description ?? "No description available." };

  const coursesByStudyLevel = (data.universityCourses ?? []).reduce(
    (acc, course) => {
      const courseSlug = course.course?.slug ?? course.course?.name?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") ?? "";
      const studyLevel = (course as any).studyLevel;
      const studyLevelId = studyLevel?.id || "unknown";
      const studyLevelName = studyLevel?.name || "Other";
      const studyLevelPriority = studyLevel?.priority || 999;
      const courseData = {
        id: course.id,
        title: course.course?.name ?? "",
        institution: data.name ?? "",
        earliestIntake: course.startDates ?? data.upcomingIntake ?? "TBA",
        deadline: "Contact for details",
        tuitionFee: course.tuition ? `$${course.tuition.toLocaleString()}` : "Contact for pricing",
        applicationFee: "Contact for details",
        slug: courseSlug,
        universitySlug: data.slug ?? "",
        duration: course.duration ? `${course.duration} ${course.duration === 1 ? "year" : "years"}` : undefined,
        studyMode: course.studyMode?.replace(/_/g, " ") ?? undefined,
        campusLocation: course.campusLocation ?? undefined,
        englishReq: course.englishReq ?? undefined,
      };
      let levelGroup = acc.find((g) => g.levelId === studyLevelId);
      if (!levelGroup) {
        levelGroup = { levelId: studyLevelId, levelName: studyLevelName, levelPriority: studyLevelPriority, courses: [] };
        acc.push(levelGroup);
      }
      levelGroup.courses.push(courseData);
      return acc;
    },
    [] as Array<{ levelId: string; levelName: string; levelPriority: number; courses: any[] }>,
  );
  coursesByStudyLevel.sort((a, b) => a.levelPriority - b.levelPriority);

  const coursesWithTuition = (data.universityCourses ?? []).filter((course) => course.tuition !== null && course.tuition !== undefined && course.tuition > 0);
  const tuitionFees = coursesWithTuition.map((course) => course.tuition).filter((fee): fee is number => fee !== null && fee !== undefined);
  const tuition =
    tuitionFees.length === 0
      ? "Contact for details"
      : Math.min(...tuitionFees) === Math.max(...tuitionFees)
        ? `$${Math.min(...tuitionFees).toLocaleString()}`
        : `$${Math.min(...tuitionFees).toLocaleString()} - $${Math.max(...tuitionFees).toLocaleString()}`;

  const sidebarInfo = [
    { label: "Upcoming Intake", value: data.upcomingIntake ?? "TBA" },
    { label: "English Requirement", value: data.englishRequirements ?? "Contact for details" },
    { label: "Tuition Fee", value: tuition },
  ];

  const shareUrl = data?.slug ? `${config.app_domain}/universities/${data.slug}` : "";

  const documents =
    data?.universityDocuments && Array.isArray(data.universityDocuments) && data.universityDocuments.length > 0
      ? (data.universityDocuments as Array<any>)
          .reduce((acc, doc) => {
            if (!doc.studyLevel || !doc.document || !doc.document.category) return acc;
            let levelGroup = acc.find((g) => g.levelId === doc.studyLevel.id);
            if (!levelGroup) {
              levelGroup = {
                levelId: doc.studyLevel.id,
                levelName:
                  doc.studyLevel.description ||
                  doc.studyLevel.name ||
                  "Description",
                levelPriority: doc.studyLevel.priority,
                categories: [],
              };
              acc.push(levelGroup);
            }
            let category = levelGroup.categories.find((c: any) => c.title === doc.document.category.name);
            if (!category) {
              category = { title: doc.document.category.name, documents: [] };
              levelGroup.categories.push(category);
            }
            category.documents.push({ id: doc.id, name: doc.document.name, submitted: false });
            return acc;
          }, [] as Array<any>)
          .sort((a, b) => a.levelPriority - b.levelPriority)
      : [];

  const transformedFaqs = (faqs ?? [])
    .filter((faq) => faq.isActive)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
    .map((faq) => ({ question: faq.question ?? "", answer: faq.answer ?? "" }));

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Universities", href: "/programs-schools?tab=universities" },
    { label: data.name ?? "" },
  ];

  return (
    <section className="flex flex-col gap-10 sm:px-0">
      <UniversityHeader data={headerData} breadcrumbs={breadcrumbs} />
      <UniversityGallery slug={data.slug ?? ""} />
      <UniversityTabs />
      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex flex-1 flex-col gap-10">
          <UniversityAbout about={aboutData} />
          {documents.length > 0 ? <UniversityRequiredDocuments documents={documents} /> : null}
          {coursesByStudyLevel.length > 0 ? <UniversityCourses coursesByStudyLevel={coursesByStudyLevel} /> : null}
          {transformedFaqs.length > 0 ? <UniversityFaqComponent faqItems={transformedFaqs} /> : null}
        </div>
        <div className="flex w-full flex-col gap-6 lg:w-[406px]">
          <UniversitySidebar sidebarInfo={sidebarInfo} shareUrl={shareUrl} universityName={data.name} />
        </div>
      </div>
    </section>
  );
}
