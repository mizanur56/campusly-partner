import type { SearchCourseItem, SearchUniversityItem } from "../data/searchResultsTypes";
import type { SearchCourse, SearchUniversity } from "../types/search";
import { getApiImageUrl } from "./getApiImageUrl";

export function transformSearchCourse(course: SearchCourse): SearchCourseItem {
  const logoUrl = course.university.UniversityLogo
    ? getApiImageUrl(course.university.UniversityLogo)
    : undefined;

  return {
    id: course.id,
    title: course.course.name,
    university: course.university.name,
    location: course.university.country.name,
    city: course.university.city.name,
    tuition: course.tuition
      ? `$${course.tuition.toLocaleString()}`
      : "Contact for pricing",
    subject: course.course.name,
    duration: course.duration
      ? `${course.duration} ${course.duration === 1 ? "year" : "years"}`
      : undefined,
    startYear: course.university.upcomingIntake || undefined,
    startDates: course.startDates || undefined,
    image: logoUrl,
    slug: course.course.slug || undefined,
    universitySlug: course.university.slug || undefined,
  };
}

export function transformSearchUniversity(university: SearchUniversity): SearchUniversityItem {
  const logoUrl = university.UniversityLogo
    ? getApiImageUrl(university.UniversityLogo)
    : undefined;

  return {
    id: university.id,
    name: university.name,
    location: university.country.name,
    city: university.city.name,
    image: logoUrl,
    slug: university.slug || undefined,
  };
}
