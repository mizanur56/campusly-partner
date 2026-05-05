import { BookOpen, Clock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "../../components/ui/PageLoader";
import { useGetAcademyCategoriesQuery, useGetAcademyCoursesQuery } from "../../redux/features/academy/academyApi";
import type { AcademyCourse } from "../../types/academy";
import { sumDurations } from "../../utils/videoHelpers";

// ── Course card ────────────────────────────────────────────────────────────────
function CourseCard({
  course,
  onClick,
}: {
  course: AcademyCourse;
  onClick: () => void;
}) {
  const videos = course.modules.flatMap((module) => module.videos);
  const cover = course.thumbnail || videos[0]?.thumbnail || "/images/logo/logo.svg";

  const totalDuration = sumDurations(
    videos.map((v) => v.duration ?? ""),
  );
  const moduleCount = course.modules.length;
  const progress = course.progress?.percentage ?? 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="group flex flex-col rounded-2xl border border-primary-border bg-white overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-200"
    >
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <img
          src={cover}
          alt={course.name}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        {/* Category badge */}
          <span className="absolute top-3 right-3 rounded-full bg-primary-600 px-3 py-0.5 text-xs font-medium text-white shadow">
          {course.category?.name}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-center gap-1.5 text-primary-600">
          <i className="fa-solid fa-user-graduate text-[13px]" />
          <span className="text-[11px] font-medium">{course.category?.name}</span>
        </div>

        <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
          {course.title}
          {course.description ? ` — ${course.description}` : ""}
        </h3>

        <div className="mt-auto pt-3 border-t border-primary-border">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {moduleCount} Module{moduleCount !== 1 ? "s" : ""}
            </span>
            {totalDuration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {totalDuration}
              </span>
            )}
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-gray-100">
            <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">{progress}%</span>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Academy() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: categories = [], isLoading: categoriesLoading } =
    useGetAcademyCategoriesQuery();
  const { data: courses = [], isLoading, isError } = useGetAcademyCoursesQuery();

  const activeCourses = useMemo(() => courses.filter((c) => c.modules.length > 0), [courses]);

  const filtered = useMemo(() => {
    return activeCourses
      .filter((c) => activeCategory === "all" || c.categoryId === activeCategory)
      .filter(
        (c) =>
          !search ||
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [activeCourses, activeCategory, search]);

  if (isLoading || categoriesLoading) return <PageLoader fullScreen={false} />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500">Unable to load courses. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 min-h-[70vh]">
      {/* ── Left: Category sidebar ─────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-[268px] shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-2">
          Categories
        </p>
        <ul className="flex flex-col gap-0.5">
          {/* All */}
          <li>
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                activeCategory === "all"
                  ? "bg-primary-50 text-primary-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <i className="fa-solid fa-users text-[14px] w-4 text-center" />
              All
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setActiveCategory(c.id)}
                className={`flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                  activeCategory === c.id
                    ? "bg-primary-50 text-primary-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <i className="fa-solid fa-circle-dot text-[11px] w-4 text-center" />
                <span className="truncate">{c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ── Right: Course grid ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Hi there! Let's explore!
            </h1>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search course"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-primary-border bg-white pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
            />
          </div>
        </div>

        {/* Mobile category pills */}
        <div className="flex md:hidden gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium border transition-colors ${
              activeCategory === "all"
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white text-gray-600 border-primary-border hover:border-primary-400"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium border transition-colors ${
                activeCategory === c.id
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-gray-600 border-primary-border hover:border-primary-400"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-primary-border bg-white">
            <i className="fa-solid fa-graduation-cap text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No courses found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => navigate(`/academy/${course.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
