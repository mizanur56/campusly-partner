import React from "react";
import SkeletonCourseCard from "./SkeletonCourseCard";
import SkeletonUniversityCard from "./SkeletonUniversityCard";
import ResultsGrid from "./ResultsGrid";
import SearchSectionHeader from "./SearchSectionHeader";
import { SECTION_SPACING_CLASSES } from "../../utils/searchResultsHelpers";

type LoadingStateProps = {
  type?: "courses" | "universities" | "all";
  count?: number;
};

export default function LoadingState({
  type = "all",
  count = 6,
}: LoadingStateProps) {
  if (type === "courses") {
    return (
      <ResultsGrid>
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCourseCard key={`skeleton-course-${index}`} />
        ))}
      </ResultsGrid>
    );
  }
  if (type === "universities") {
    return (
      <ResultsGrid>
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonUniversityCard key={`skeleton-university-${index}`} />
        ))}
      </ResultsGrid>
    );
  }
  return (
    <div>
      <section className={SECTION_SPACING_CLASSES}>
        <SearchSectionHeader
          title="Courses"
          image="/icons/lucide_graduation-cap.svg"
        />
        <ResultsGrid>
          {Array.from({ length: count }).map((_, index) => (
            <SkeletonCourseCard key={`skeleton-course-${index}`} />
          ))}
        </ResultsGrid>
      </section>
      <section className={SECTION_SPACING_CLASSES}>
        <SearchSectionHeader
          title="Universities"
          image="/icons/hugeicons_university.svg"
        />
        <ResultsGrid>
          {Array.from({ length: count }).map((_, index) => (
            <SkeletonUniversityCard key={`skeleton-university-${index}`} />
          ))}
        </ResultsGrid>
      </section>
    </div>
  );
}
