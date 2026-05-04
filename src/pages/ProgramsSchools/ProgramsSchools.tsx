import { SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import ApplyPreferenceModal from "../../components/common/Modals/Apply/ApplyPreferenceModal";
import type { CourseForApply } from "../../components/courses/CoursesResultsView";
import CoursesResultsView from "../../components/courses/CoursesResultsView";
import InstitutionsResultsView from "../../components/courses/InstitutionsResultsView";
import type { SelectedStudent } from "../../components/courses/SelectedStudentCard";
import StudentSelectBlock from "../../components/courses/StudentSelectBlock";
import StudyPreferenceFilters, {
  FilterState,
} from "../../components/courses/StudyPreferenceFilters";
import { useAppSelector } from "../../redux/features/hooks";

export default function ProgramsSchoolsPage() {
  const [searchParams] = useSearchParams();
  const qFromUrl = searchParams.get("q") || "";
  const tabFromUrl = searchParams.get("tab") || "courses";

  const [activeTab, setActiveTab] = useState<"courses" | "institutions">(
    tabFromUrl === "institutions" ? "institutions" : "courses",
  );
  const [searchQuery, setSearchQuery] = useState(qFromUrl);
  const [filters, setFilters] = useState<FilterState | undefined>(undefined);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<SelectedStudent | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedCourseForApply, setSelectedCourseForApply] =
    useState<CourseForApply | null>(null);

  const metaData = useAppSelector((state) => state.searchMeta);

  const handleStartApplication = (course: CourseForApply) => {
    if (!selectedStudent) {
      toast.error("Please select a student first");
      return;
    }
    setSelectedCourseForApply(course);
    setApplyModalOpen(true);
  };
  const coursesCount = metaData.courses || 0;
  const institutionsCount = metaData.universities || 0;

  useEffect(() => {
    setSearchQuery(qFromUrl);
    setActiveTab(tabFromUrl === "institutions" ? "institutions" : "courses");
  }, [qFromUrl, tabFromUrl]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Left Sidebar - Filters (Desktop) */}
          <div
            className="hidden lg:block order-2 lg:order-1 lg:shrink-0"
            style={{ width: "100%", maxWidth: "320px" }}
          >
            <div className="lg:sticky lg:top-6 space-y-4">
              <StudentSelectBlock
                selectedStudent={selectedStudent}
                onSelect={setSelectedStudent}
              />
              <StudyPreferenceFilters onFilterChange={handleFilterChange} />
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {isMobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setIsMobileFiltersOpen(false)}
              />
              <div className="absolute inset-y-0 left-0 w-full max-w-xs bg-white rounded-r-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex flex-col">
                <div className="p-4 border-b border-primary-border flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Filters
                  </h2>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-2 -mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <StudentSelectBlock
                    selectedStudent={selectedStudent}
                    onSelect={setSelectedStudent}
                  />
                  <StudyPreferenceFilters onFilterChange={handleFilterChange} />
                </div>
                <div className="p-4 border-t border-primary-border bg-gray-50">
                  <Button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    type="primary"
                    icon={<SearchOutlined />}
                  >
                    Show Results
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Right Content */}
          <div className="order-1 lg:order-2 flex-1 min-w-0">
            <div className="mb-4 sm:mb-6 flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder={
                    activeTab === "courses"
                      ? "Search course by name, subjects"
                      : "Search institution by name, location"
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border h-10 pl-9 pr-3 border-primary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden px-3 h-10 bg-white border border-primary-border rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shrink-0"
                aria-label="Filters"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4 sm:mb-5 flex flex-row gap-2 sm:gap-3">
              <Button
                onClick={() => setActiveTab("courses")}
                type={activeTab === "courses" ? "primary" : "default"}
              >
                Courses <span className="opacity-90">({coursesCount})</span>
              </Button>
              <Button
                onClick={() => setActiveTab("institutions")}
                type={activeTab === "institutions" ? "primary" : "default"}
              >
                Institutions{" "}
                <span className="opacity-90">({institutionsCount})</span>
              </Button>
            </div>

            {activeTab === "courses" && (
              <CoursesResultsView
                searchQuery={searchQuery}
                filters={filters}
                onStartApplication={handleStartApplication}
              />
            )}
            {activeTab === "institutions" && (
              <InstitutionsResultsView
                searchQuery={searchQuery}
                filters={filters}
              />
            )}
          </div>
        </div>
      </div>

      {applyModalOpen && selectedCourseForApply && (
        <ApplyPreferenceModal
          open={applyModalOpen}
          onClose={() => {
            setApplyModalOpen(false);
            setSelectedCourseForApply(null);
          }}
          studentId={selectedStudent?.id}
          data={{
            id: selectedCourseForApply.id,
            startDates:
              selectedCourseForApply.startDates ||
              selectedCourseForApply.intake,
            campus:
              selectedCourseForApply.campus ||
              selectedCourseForApply.institution?.location,
            duration: selectedCourseForApply.duration,
            modeOfStudy: selectedCourseForApply.modeOfStudy,
          }}
        />
      )}
    </div>
  );
}
