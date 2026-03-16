import { baseApi } from "../../api/baseApi";

export type SingleUniversityCourseApiResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    id: string;
    universityId: string;
    courseId: string;
    studyLevelId: string | null;
    description: string;
    duration: number;
    tuition: number;
    studyMode: string;
    campusLocation: string;
    startDates: string | null;
    englishReq: string | null;
    university: {
      id: string;
      name: string;
      slug: string;
      UniversityLogo?: { url?: string };
      upcomingIntake?: string;
      city?: { name?: string };
      englishRequirements?: string;
    };
    course: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
    };
    relatedCourses?: Array<{
      id: string;
      tuition: number;
      course: { id: string; name: string; slug: string; description?: string | null };
      description?: string | null;
    }>;
    universityCourseDocuments?: Array<{
      document?: {
        id?: string;
        name?: string;
        category?: { id?: string; slug?: string; name?: string };
      };
    }>;
  };
};

type UniversityCourse = {
  id: string;
  universityId: string;
  courseId: string;
  university: {
    id: string;
    name: string;
    country: { id: string; name: string };
    city: { id: string; name: string };
  };
  course: { id: string; name: string; description: string | null };
};

type UniversityCoursesApiResponse = {
  success: boolean;
  status: number;
  message: string;
  data: UniversityCourse[];
  meta: { page: number; limit: number; total: number };
};

type GetUniversityCoursesArgs = { page?: number; limit?: number };

const universityCoursesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUniversityCourses: builder.query<
      UniversityCoursesApiResponse,
      GetUniversityCoursesArgs
    >({
      query: ({ page = 1, limit = 10000000 }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        return { url: `/university-courses?${params.toString()}` };
      },
      providesTags: ["universityCourses"],
    }),
  }),
});

export const {
  useGetUniversityCoursesQuery,
  useLazyGetUniversityCoursesQuery,
} = universityCoursesApi;
