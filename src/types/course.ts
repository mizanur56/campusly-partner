export type University = {
  id: string;
  name: string;
  slug: string;
  countryId: string;
  cityId: string;
  description?: string | null;
  logoId?: string;
  upcomingIntake?: string;
  englishRequirements?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  country?: Country;
  city?: City;
  UniversityLogo?: Logo; // API: { id, url }
};

export type Country = {
  id: string;
  name: string;
  code: string;
};

export type City = {
  id: string;
  name: string;
};

export type Logo = {
  id: string;
  url: string;
  name?: string;
};

export type SingleUniversityCourse = {
  id: string;
  universityId: string;
  courseId: string;
  studyLevelId: string | null;
  description: string | null;
  duration: number;
  tuition: number;
  studyMode: string;
  campusLocation: string;
  startDates: string | null;
  englishReq: string | null;
  createdAt: string;
  updatedAt: string;
  university: University;
  course: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageId?: string;
    feeDescription?: string | null;
    visaCostDescription?: Record<string, string> | null;
    workPermitDescription?:
      | Record<string, string>
      | { description?: string }
      | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  courseRequirementEducations?: Array<{
    id: string;
    universityCourseId: string;
    studyLevelId: string;
    studyLevel?: {
      id: string;
      name: string;
      description: string;
      priority: number;
      isActive: boolean;
    };
  }>;
  relatedCourses?: Array<{
    id?: string;
    tuition?: number;
    course?: {
      id: string;
      name: string;
      slug: string;
      description?: string | null;
    };
    description?: string | null;
  }>;
  universityCourseDocuments?: Array<{
    id: string;
    universityCourseId: string;
    documentId: string;
    createdAt?: string;
    updatedAt?: string;
    document?: {
      id: string;
      categoryId?: string;
      name: string;
      status?: boolean;
      createdAt?: string;
      updatedAt?: string;
      category?: {
        id: string;
        name: string;
        slug: string;
      };
    };
  }>;
};

export type SingleUniversityCourseApiResponse = {
  success: boolean;
  status: number;
  message: string;
  data: SingleUniversityCourse;
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type DocumentCategoryItem = {
  id: string;
  label: string;
  /** Whether this document is already uploaded in profile */
  uploaded?: boolean;
  /** Document template id for upload (POST /students/documents) */
  documentId?: string;
  /** Profile field key for direct profile update (e.g. 'passport') */
  uploadKey?: "passport" | "cv" | "profile";
  /** URL of uploaded file (from profile) for View link */
  documentUrl?: string | null;
};

export type DocumentCategory = {
  id: string;
  title: string;
  items: DocumentCategoryItem[];
};

export type UniversityDetails = University & {
  shortDescription?: string | null;
  universityCourses?: Array<{
    id: string;
    tuition?: number;
    duration?: number;
    studyMode?: string;
    campusLocation?: string;
    startDates?: string | null;
    englishReq?: string | null;
    course?: {
      id: string;
      name: string;
      slug: string;
    };
    studyLevel?: {
      id: string;
      name: string;
      priority?: number;
    } | null;
  }>;
  universityDocuments?: unknown[];
  universityGalleries?: unknown[];
};

export type UniversityFaq = {
  id: string;
  question: string;
  answer: string;
  type: string;
  referenceId: string | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UniversityDetailsApiResponse = {
  success: boolean;
  status: number;
  message: string;
  data: UniversityDetails;
};

export type UniversityFaqsApiResponse = {
  success: boolean;
  status: number;
  message: string;
  data: UniversityFaq[];
};
