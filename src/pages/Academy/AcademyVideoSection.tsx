import { useState } from "react";
import { Play } from "lucide-react";
import type { VideoCardItem } from "../../types/videoGallery";
import AcademyVideoModal from "./AcademyVideoModal";

interface AcademyVideoSectionProps {
  title: string;
  description: string;
  videos: VideoCardItem[];
  allVideos?: VideoCardItem[];
}

function VideoCard({
  card,
  onVideoClick,
}: {
  card: VideoCardItem;
  onVideoClick: (video: VideoCardItem) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onVideoClick(card)}
      onKeyDown={(e) => e.key === "Enter" && onVideoClick(card)}
      className="group h-full flex flex-col rounded-[24px] border border-neutral-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] cursor-pointer"
    >
      <div className="relative">
        <div className="relative h-[200px] sm:h-[220px] w-full overflow-hidden rounded-t-[24px]">
          <img
            src={card.image}
            alt={card.title}
            className="h-full w-full object-cover transition-all duration-200 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-t-[24px]">
          <div className="flex size-14 sm:size-16 items-center justify-center rounded-full bg-primary-600/80 text-white shadow-lg transition-all group-hover:scale-110">
            <Play className="size-6 sm:size-7 fill-white" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4 md:p-5 flex-1 text-left">
        <h3 className="font-semibold text-neutral-900 text-[15px] sm:text-[16px] md:text-[17px] line-clamp-2 leading-snug group-hover:text-primary-700 transition-colors">
          {card.title}
        </h3>
        <p className="text-neutral-600 text-sm leading-relaxed line-clamp-2">
          {card.description}
        </p>
        <div className="mt-auto flex justify-between gap-2 text-xs text-neutral-500 pt-2 border-t border-neutral-100">
          <span>{card.channel}</span>
          <span>{card.duration}</span>
        </div>
      </div>
    </div>
  );
}

export default function AcademyVideoSection({
  title,
  description,
  videos,
  allVideos,
}: AcademyVideoSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoCardItem | null>(null);

  const handleVideoClick = (video: VideoCardItem) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const similarVideosList = allVideos || videos;

  return (
    <>
      <section className="pb-6 md:pb-10">
        <div className="w-full">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            {description && (
              <p className="text-gray-600 text-sm sm:text-base">{description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {videos.map((video) => (
              <div key={video.id} className="h-full">
                <VideoCard card={video} onVideoClick={handleVideoClick} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <AcademyVideoModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        selectedVideo={selectedVideo}
        allVideos={similarVideosList}
      />
    </>
  );
}
