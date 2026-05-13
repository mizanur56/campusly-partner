export interface AcademyVideo {
  id: string;
  title: string;
  description?: string;
  youtubeUrl: string;
  thumbnail?: string;
  duration?: string | null;
  priority: number;
  moduleId: string;
}

export interface AcademyModule {
  id: string;
  title: string;
  description?: string;
  priority: number;
  videos: AcademyVideo[];
}

export interface AcademyCourse {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  modules: AcademyModule[];
  progress?: {
    completed: number;
    totalVideos: number;
    percentage: number;
    currentVideoId: string | null;
    currentModuleId: string | null;
  };
}

export interface AcademyCourseDetail extends Omit<AcademyCourse, "progress"> {
  progress: {
    completedVideoIds: string[];
    currentVideoId: string | null;
    currentModuleId: string | null;
  };
}

export interface AcademyCategory {
  id: string;
  name: string;
  description?: string;
}
