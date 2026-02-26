import { baseApi } from "../../api/baseApi";
import type {
  VideoGalleryApiResponse,
  VideoCategoryWithVideos,
} from "../../../types/videoGallery";

export const videoGalleryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVideoGalleryCategories: builder.query<
      VideoCategoryWithVideos[],
      void
    >({
      query: () => "/video-gallery/public/categories-with-videos",
      transformResponse: (response: VideoGalleryApiResponse) => {
        const data = response?.data;
        if (!data) return [];
        return Array.isArray(data) ? data : [];
      },
      providesTags: ["videoGalleryCategories", "videoGalleryVideos"],
    }),
  }),
});

export const { useGetVideoGalleryCategoriesQuery } = videoGalleryApi;
