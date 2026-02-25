export interface SearchCourseItem {
  id: string;
  title: string;
  university: string;
  location: string;
  city?: string;
  tuition: string;
  subject?: string;
  studyLevel?: string;
  duration?: string;
  startYear?: string;
  startDates?: string;
  institution?: string;
  image?: string;
  slug?: string;
  universitySlug?: string;
}

export interface SearchUniversityItem {
  id: string;
  name: string;
  location: string;
  city?: string;
  image?: string;
  slug?: string;
}

export interface SearchTabItem {
  id: string;
  label: string;
  count: number;
  isPrimary?: boolean;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  totalPages: number;
}
