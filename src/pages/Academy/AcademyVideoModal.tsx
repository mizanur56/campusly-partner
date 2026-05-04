import { Clock, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { VideoCardItem } from "../../types/videoGallery";
import { getYouTubeEmbedUrl } from "../../utils/videoHelpers";

interface AcademyVideoModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedVideo: VideoCardItem | null;
  allVideos: VideoCardItem[];
}

export default function AcademyVideoModal({
  open,
  setOpen,
  selectedVideo,
  allVideos,
}: AcademyVideoModalProps) {
  const [overriddenVideoId, setOverriddenVideoId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const currentVideo: VideoCardItem | null = open
    ? overriddenVideoId
      ? (allVideos.find((v) => v.id === overriddenVideoId) ?? selectedVideo)
      : selectedVideo
    : null;

  const handleClose = () => {
    setOverriddenVideoId(null);
    setOpen(false);
  };

  const handleSelectVideo = (video: VideoCardItem) => {
    setOverriddenVideoId(video.id);
  };

  if (!open || !currentVideo) return null;

  const similarVideos = allVideos.filter(
    (video) => video.id !== currentVideo.id,
  );
  const embedUrl =
    getYouTubeEmbedUrl(currentVideo.videoSrc) || currentVideo.videoSrc;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 lg:p-[5%]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleClose}
      />
      <div
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 relative overflow-hidden">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all z-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100">
                <iframe
                  src={embedUrl}
                  title={currentVideo.title}
                  className="w-full h-full rounded-2xl"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  {currentVideo.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  {currentVideo.platform === "youtube" && (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      {currentVideo.channel}
                    </span>
                  )}
                  {currentVideo.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {currentVideo.duration}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {currentVideo.description}
                </p>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Similar Videos
              </h3>
              <div className="max-h-[50vh] lg:max-h-[70vh] overflow-y-auto space-y-2">
                {similarVideos.length > 0 ? (
                  similarVideos.map((video) => (
                    <div
                      key={video.id}
                      className={`bg-gray-50 border rounded-xl p-3 hover:bg-gray-100 transition-all cursor-pointer ${
                        currentVideo.id === video.id
                          ? "bg-primary-50 border-primary-200"
                          : "border-primary-border"
                      }`}
                      onClick={() => handleSelectVideo(video)}
                    >
                      <div className="aspect-video rounded-lg overflow-hidden mb-2 bg-gray-100 relative">
                        <img
                          src={video.image}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex size-10 items-center justify-center rounded-full bg-primary-600/80 text-white">
                            <svg
                              className="w-5 h-5 fill-white ml-0.5"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <h4 className="text-gray-900 font-medium text-sm line-clamp-2">
                        {video.title}
                      </h4>
                      {video.duration && (
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{video.duration}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No similar videos available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
