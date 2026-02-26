import { useMemo } from "react";
import PageLoader from "../../components/ui/PageLoader";
import AcademyVideoSection from "./AcademyVideoSection";
import { useGetVideoGalleryCategoriesQuery } from "../../redux/features/videoGallery/videoGalleryApi";
import {
  transformToVideoSections,
  getAllVideos,
} from "../../types/videoGallery";
import type { VideoCategoryWithVideos } from "../../types/videoGallery";

export default function Academy() {
  const { data: categories, isLoading, isError } = useGetVideoGalleryCategoriesQuery();

  const sections = useMemo(() => {
    if (categories && categories.length > 0) {
      return transformToVideoSections(categories as VideoCategoryWithVideos[]);
    }
    return [];
  }, [categories]);

  const allVideos = useMemo(() => {
    if (categories && categories.length > 0) {
      return getAllVideos(categories as VideoCategoryWithVideos[]);
    }
    return [];
  }, [categories]);

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
          Academy
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Training videos and guides for partners. Watch tutorials to enhance your skills.
        </p>
        <hr className="mt-4 border-gray-200 dark:border-gray-700" />
      </div>

      {isLoading ? (
        <PageLoader fullScreen={false} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-gray-600 text-center mb-4">
            Unable to load videos. Please try again later.
          </p>
        </div>
      ) : sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl border border-gray-200">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No videos yet
          </h3>
          <p className="text-gray-500 text-sm text-center max-w-md">
            Training videos will appear here once they are added. Check back
            later for new content.
          </p>
        </div>
      ) : (
        <div className="pb-8">
          {sections.map((section) => (
            <AcademyVideoSection
              key={section.id}
              title={section.title}
              description={section.description}
              videos={section.videos}
              allVideos={allVideos}
            />
          ))}
        </div>
      )}
    </>
  );
}
