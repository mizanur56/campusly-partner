import {
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Lock,
  PlayCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLoader from "../../components/ui/PageLoader";
import {
  useGetAcademyCourseDetailsQuery,
  useUpdateAcademyProgressMutation,
} from "../../redux/features/academy/academyApi";
import type { AcademyModule, AcademyVideo } from "../../types/academy";
import { getYouTubeEmbedUrl, sumDurations } from "../../utils/videoHelpers";

type VideoWithMeta = AcademyVideo & { moduleId: string; moduleTitle: string };

function VideoPlayer({ video }: { video: AcademyVideo }) {
  const embedUrl = getYouTubeEmbedUrl(video.youtubeUrl);
  if (!embedUrl) {
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-900 shadow-sm">
        <video controls className="w-full h-full" src={video.youtubeUrl}>
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }
  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-900 shadow-sm">
      <iframe key={video.id} src={embedUrl} title={video.title} allowFullScreen className="w-full h-full" />
    </div>
  );
}

function ChapterItem({
  video,
  isActive,
  isWatched,
  isLocked,
  onClick,
}: {
  video: AcademyVideo;
  isActive: boolean;
  isWatched: boolean;
  isLocked: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={isLocked ? undefined : onClick} disabled={isLocked} className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left hover:bg-gray-50">
      <div className="relative shrink-0 w-16 h-10 rounded-md overflow-hidden bg-gray-100">
        <img src={video.thumbnail || "/images/logo/logo.svg"} alt={video.title} className="w-full h-full object-cover" />
        {isActive && <div className="absolute inset-0 bg-primary-600/50 flex items-center justify-center"><PlayCircle className="w-5 h-5 text-white" /></div>}
        {isLocked && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><Lock className="w-3.5 h-3.5 text-white" /></div>}
        {isWatched && !isActive && !isLocked && <div className="absolute top-1 right-1"><CheckCircle className="w-3.5 h-3.5 text-green-400" /></div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium leading-snug line-clamp-2 ${isLocked ? "text-gray-400" : "text-gray-700"}`}>{video.title}</p>
        {video.duration && <span className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400"><Clock className="w-2.5 h-2.5" />{video.duration}</span>}
      </div>
    </button>
  );
}

function AccordionSection({
  moduleItem,
  videos,
  activeVideoId,
  watchedVideoIds,
  lockedVideoIds,
  isOpen,
  onToggle,
  onVideoClick,
}: {
  moduleItem: AcademyModule;
  videos: AcademyVideo[];
  activeVideoId: string;
  watchedVideoIds: Set<string>;
  lockedVideoIds: Set<string>;
  isOpen: boolean;
  onToggle: () => void;
  onVideoClick: (videoId: string) => void;
}) {
  const watchedInSection = videos.filter((v) => watchedVideoIds.has(v.id)).length;
  const totalDuration = sumDurations(videos.map((v) => v.duration ?? ""));
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={onToggle} className="flex items-center justify-between w-full px-4 py-3.5 text-left hover:bg-gray-50">
        <div className="min-w-0 pr-3">
          <p className="text-sm font-semibold text-gray-800 leading-snug">{moduleItem.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-400">
            <span>{watchedInSection}/{videos.length} Videos</span>
            {totalDuration && <><span className="text-gray-200">·</span><Clock className="w-2.5 h-2.5" /><span>{totalDuration}</span></>}
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {isOpen && (
        <div className="pb-2 px-2 flex flex-col">
          {videos.map((video) => (
            <ChapterItem key={video.id} video={video} isActive={video.id === activeVideoId} isWatched={watchedVideoIds.has(video.id)} isLocked={lockedVideoIds.has(video.id)} onClick={() => onVideoClick(video.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AcademyCourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [updateProgress] = useUpdateAcademyProgressMutation();
  const { data: course, isLoading, isError } = useGetAcademyCourseDetailsQuery(courseId ?? "", { skip: !courseId });

  const flatVideos = useMemo<VideoWithMeta[]>(
    () =>
      (course?.modules ?? []).flatMap((mod) =>
        mod.videos.map((v) => ({ ...v, moduleId: mod.id, moduleTitle: mod.title })),
      ),
    [course?.modules],
  );

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [watchedVideoIds, setWatchedVideoIds] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    setActiveVideoId(course?.progress?.currentVideoId ?? flatVideos[0]?.id ?? null);
    setWatchedVideoIds(new Set(course?.progress?.completedVideoIds ?? []));
  }, [course?.progress?.completedVideoIds, course?.progress?.currentVideoId, flatVideos]);

  const currentVideo = useMemo(
    () => flatVideos.find((v) => v.id === activeVideoId) ?? flatVideos[0] ?? null,
    [activeVideoId, flatVideos],
  );
  const currentIndex = useMemo(() => flatVideos.findIndex((v) => v.id === currentVideo?.id), [flatVideos, currentVideo]);
  const nextVideo = flatVideos[currentIndex + 1] ?? null;

  const lockedVideoIds = useMemo(() => {
    let frontier = 0;
    while (frontier < flatVideos.length && watchedVideoIds.has(flatVideos[frontier].id)) frontier++;
    const locked = new Set<string>();
    for (let i = frontier + 1; i < flatVideos.length; i++) locked.add(flatVideos[i].id);
    return locked;
  }, [flatVideos, watchedVideoIds]);

  const progressPct = flatVideos.length > 0 ? Math.round((watchedVideoIds.size / flatVideos.length) * 100) : 0;

  const handleNext = () => {
    if (!currentVideo || !nextVideo || !courseId) return;
    const completed = new Set([...watchedVideoIds, currentVideo.id]);
    setWatchedVideoIds(completed);
    setActiveVideoId(nextVideo.id);
    setCollapsedSections((prev) => new Set([...prev].filter((id) => id !== nextVideo.moduleId)));
    void updateProgress({
      courseId,
      completedVideoId: currentVideo.id,
      currentModuleId: nextVideo.moduleId,
      currentVideoId: nextVideo.id,
    });
  };

  if (isLoading) return <PageLoader fullScreen={false} />;
  if (isError) return <div className="py-20 text-center text-gray-500">Unable to load course details.</div>;

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => navigate("/academy")} className="flex items-center gap-1.5 text-sm text-gray-500"><ChevronLeft className="w-4 h-4" />Back to Academy</button>
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {currentVideo && <VideoPlayer video={currentVideo} />}
          <h2 className="text-xl font-bold text-gray-900">{currentVideo?.title}</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-5">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2"><span className="text-xs text-gray-500">Progress</span><span className="text-xs font-bold text-primary-600">{progressPct}%</span></div>
              <div className="h-1.5 w-full rounded-full bg-gray-100"><div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${progressPct}%` }} /></div>
            </div>
            {nextVideo && <button onClick={handleNext} className="shrink-0 flex items-center gap-2 rounded-lg bg-primary-600 text-white px-4 py-2 text-sm font-medium">Next<ChevronRight className="w-4 h-4" /></button>}
          </div>
        </div>
        <aside className="w-[340px] shrink-0 rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-100"><p className="text-sm font-semibold text-gray-900">Course Content</p></div>
          <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
            {(course?.modules ?? []).map((mod) => (
              <AccordionSection
                key={mod.id}
                moduleItem={mod}
                videos={mod.videos}
                activeVideoId={currentVideo?.id ?? ""}
                watchedVideoIds={watchedVideoIds}
                lockedVideoIds={lockedVideoIds}
                isOpen={!collapsedSections.has(mod.id)}
                onToggle={() => setCollapsedSections((prev) => (prev.has(mod.id) ? new Set([...prev].filter((x) => x !== mod.id)) : new Set([...prev, mod.id])))}
                onVideoClick={(id) => setActiveVideoId(id)}
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
