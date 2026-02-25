export type SearchCourse = {
  id: string;
  universityId: string;
  courseId: string;
  description: string | null;
  duration: number;
  tuition: number;
  studyMode: string;
  campusLocation: string | null;
  startDates: string | null;
  englishReq: string;
  createdAt: string;
  updatedAt: string;
  course: {
    id: string;
    name: string;
    slug: string | null;
    description: string;
  };
  university: {
    id: string;
    name: string;
    slug: string | null;
    upcomingIntake: string | null;
    country: { id: string; name: string; code: string };
    city: { id: string; name: string };
    UniversityLogo: { url: string } | null;
  };
  courseRequirementEducations: unknown[];
};

export type SearchUniversity = {
  id: string;
  name: string;
  slug: string | null;
  countryId: string;
  cityId: string;
  description: string;
  logoId: string | null;
  upcomingIntake: string | null;
  englishRequirements: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  country: { id: string; name: string; code: string };
  city: { id: string; name: string };
  UniversityLogo: { url: string } | null;
  acceptedStudyLevels: unknown[];
  _count: { universityCourses: number };
};

export type SearchArticle = {
  id: string | number;
  slug: string;
  title: string;
  content: string;
  image: { id: string; url: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type SearchMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  totalCourses?: number;
  totalArticles?: number;
  totalUniversities?: number;
  totalResults?: number;
};

export type SearchResultsData = {
  courses: { meta: SearchMeta; data: SearchCourse[] };
  universities: { meta: SearchMeta; data: SearchUniversity[] };
  articles: { meta: SearchMeta; data: SearchArticle[] };
};

export type UnifiedSearchApiResponse = {
  success: boolean;
  status: number;
  message: string;
  data: SearchResultsData;
};

export type SearchCoursesApiResponse = {
  success: boolean;
  status: number;
  message: string;
  data: SearchCourse[];
  meta: SearchMeta;
};

export type SearchUniversitiesApiResponse = {
  success: boolean;
  status: number;
  message: string;
  data: SearchUniversity[];
  meta: SearchMeta;
};

export type SearchArticlesApiResponse = {
  success: boolean;
  status: number;
  message: string;
  data: SearchArticle[];
  meta: SearchMeta;
};
