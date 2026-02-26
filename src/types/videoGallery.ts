import { getApiImageUrl } from "../utils/getApiImageUrl";
import { getYouTubeEmbedUrl } from "../utils/videoHelpers";

export interface VideoCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnail: string;
  duration: string | null;
  username: string;
  priority: number;
  viewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  category: VideoCategory;
}

export interface VideoCategoryWithVideos {
  id: string;
  name: string;
  slug: string;
  description: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  videos: Video[];
}

export interface VideoGalleryApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: VideoCategoryWithVideos[];
}

export interface VideoCardItem {
  id: string;
  type: "video";
  title: string;
  description: string;
  image: string;
  channel: string;
  duration: string;
  platform: "youtube" | "vimeo";
  videoSrc: string;
}

export interface VideoGallerySection {
  id: string;
  title: string;
  description: string;
  videos: VideoCardItem[];
}

export function transformToVideoSections(
  categories: VideoCategoryWithVideos[]
): VideoGallerySection[] {
  return categories
    .filter((category) => category.isActive && category.videos.length > 0)
    .sort((a, b) => a.priority - b.priority)
    .map((category) => ({
      id: category.slug,
      title: category.name,
      description: category.description,
      videos: transformToVideoCards(category.videos),
    }));
}

export function transformToVideoCards(videos: Video[]): VideoCardItem[] {
  return videos
    .filter((video) => video.isActive)
    .sort((a, b) => a.priority - b.priority)
    .map((video) => ({
      id: video.id,
      type: "video" as const,
      title: video.title,
      description: video.description,
      image: getApiImageUrl(video.thumbnail) || video.thumbnail,
      channel: video.username ? `@${video.username}` : "Campus Transfer",
      duration: video.duration || "N/A",
      platform: "youtube" as const,
      videoSrc: getYouTubeEmbedUrl(video.youtubeUrl) || video.youtubeUrl,
    }));
}

export function getAllVideos(
  categories: VideoCategoryWithVideos[]
): VideoCardItem[] {
  return categories
    .filter((category) => category.isActive)
    .flatMap((category) => transformToVideoCards(category.videos));
}
