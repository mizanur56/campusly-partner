import { Calendar, Clock, DollarSign } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApplyPreferenceModal from "../../../components/common/Modals/Apply/ApplyPreferenceModal";
import { useGetMyAllApplicationsQuery } from "../../../redux/features/application/applicationApi";
import { cn } from "../../../utils/cn";

type Course = {
  id: string;
  title: string;
  institution: string;
  earliestIntake: string;
  deadline: string;
  tuitionFee: string;
  applicationFee: string;
  slug: string;
  universitySlug: string;
  duration?: string;
  studyMode?: string;
  campusLocation?: string;
  startDates?: string;
};

type CoursesByStudyLevel = Array<{ levelId: string; levelName: string; levelPriority: number; courses: Course[] }>;

export default function UniversityCourses({ coursesByStudyLevel }: { coursesByStudyLevel: CoursesByStudyLevel }) {
  const navigate = useNavigate();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { data: applicationsData } = useGetMyAllApplicationsQuery({ page: 1, limit: 100 });

  const appliedCourseIds = useMemo(() => {
    const applications = applicationsData?.data?.data || applicationsData?.data || [];
    if (!Array.isArray(applications)) return new Set<string>();
    return new Set(
      applications
        .map((app: any) => app?.universityCourseId || app?.universityCourse?.id || app?.courseId || app?.course?.id)
        .filter(Boolean),
    );
  }, [applicationsData]);

  const getApplicationId = (courseId: string) => {
    const applications = applicationsData?.data?.data || applicationsData?.data || [];
    if (!Array.isArray(applications)) return null;
    return applications.find(
      (app: any) => (app?.universityCourseId || app?.universityCourse?.id || app?.courseId || app?.course?.id) === courseId,
    )?.id;
  };

  const studyLevels = useMemo(() => coursesByStudyLevel.map((level) => ({ id: level.levelId, name: level.levelName })), [coursesByStudyLevel]);
  const [activeTab, setActiveTab] = useState("");
  useEffect(() => {
    if (studyLevels.length > 0 && !activeTab) setActiveTab(studyLevels[0].id);
  }, [studyLevels, activeTab]);
  const filteredCourses = useMemo(() => coursesByStudyLevel.find((level) => level.levelId === activeTab)?.courses || [], [coursesByStudyLevel, activeTab]);

  return (
    <section id="programs" className="flex w-full flex-col gap-4">
      <h2 className="text-[26px] font-semibold text-[#20242A] md:text-[30px]">Courses</h2>
      {studyLevels.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {studyLevels.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => setActiveTab(level.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-normal transition-colors",
                activeTab === level.id ? "border-primary-200 bg-primary-100 text-primary-700" : "border-transparent bg-neutral-50 text-neutral-500 hover:bg-primary-50",
              )}
            >
              {level.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex w-full flex-col gap-8">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course.id} className="w-full rounded-lg border border-primary-border bg-white shadow-none">
              <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-[18px] font-semibold text-[#20242A] md:text-[20px]">{course.title}</h3>
                  <p className="text-[14px] text-[#4B5563] md:text-[16px]">{course.institution}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <Info icon={<Calendar className="h-5 w-5 shrink-0 text-[#4B5563]" />} label="Earliest intake" value={course.earliestIntake} />
                  <Info icon={<Clock className="h-5 w-5 shrink-0 text-[#4B5563]" />} label="Deadline" value={course.deadline} />
                  <Info icon={<DollarSign className="h-5 w-5 shrink-0 text-[#4B5563]" />} label="Tuition fee" value={course.tuitionFee} />
                  <Info icon={<DollarSign className="h-5 w-5 shrink-0 text-[#4B5563]" />} label="Application fee" value={course.applicationFee} />
                </div>
                <div className="flex flex-wrap gap-4">
                  {appliedCourseIds.has(course.id) ? (
                    <button onClick={() => { const id = getApplicationId(course.id); if (id) navigate(`/applications/${id}`); }} className="rounded-md border bg-primary px-6 py-2 text-white transition-all duration-300 hover:bg-primary md:px-8 md:py-3">
                      View Application
                    </button>
                  ) : (
                    <button onClick={() => { setSelectedCourse(course); setIsApplyModalOpen(true); }} className="rounded-md border bg-primary px-6 py-2 text-white transition-all duration-300 hover:bg-primary md:px-8 md:py-3">
                      Apply now
                    </button>
                  )}
                  <Link to={course.universitySlug && course.slug ? `/programs-schools/courses/${course.universitySlug}/${course.slug}` : "#"} className="rounded-md border border-[#237D3B] bg-white px-6 py-2 text-primary transition-all duration-300 hover:bg-white md:px-8 md:py-3">
                    View courses
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-[15px] text-[#4B5563]">No courses found for this study level.</p>
        )}
      </div>

      {isApplyModalOpen && selectedCourse ? (
        <ApplyPreferenceModal
          open={isApplyModalOpen}
          onClose={() => {
            setIsApplyModalOpen(false);
            setSelectedCourse(null);
          }}
          showStudentSelect
          data={{
            id: selectedCourse.id,
            startDates: selectedCourse.startDates || selectedCourse.earliestIntake,
            campus: selectedCourse.campusLocation,
            duration: selectedCourse.duration,
            modeOfStudy: selectedCourse.studyMode,
          }}
        />
      ) : null}
    </section>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="flex flex-col">
        <p className="text-[12px] text-[#4B5563] md:text-[13px]">{label}</p>
        <p className="text-[13px] font-medium text-[#20242A] md:text-[14px]">{value}</p>
      </div>
    </div>
  );
}
