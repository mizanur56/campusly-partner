import { Link } from "react-router-dom";
import SearchCourseCard from "../search/SearchCourseCard";
import type { SearchCourseItem } from "../../data/searchResultsTypes";

interface RelatedCoursesProps {
  courses: SearchCourseItem[];
  className?: string;
}

export default function RelatedCourses({
  courses,
  className,
}: RelatedCoursesProps) {
  if (!courses || courses.length === 0) return null;

  return (
    <section className={`mt-12 space-y-6 ${className || ""}`}>
      <div className="flex items-center gap-2">
        <h2 className="text-[22px] font-semibold text-neutral-900 md:text-[30px]">
          Related courses
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {courses.map((course) => (
          <SearchCourseCard key={course.id} course={course} />
        ))}
      </div>

      <div className="flex justify-start pt-2">
        <Link
          to="/programs-schools?tab=courses"
          className="inline-flex items-center justify-center rounded-full border border-primary-600 bg-white px-4 py-2 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50"
        >
          Show all
        </Link>
      </div>
    </section>
  );
}
