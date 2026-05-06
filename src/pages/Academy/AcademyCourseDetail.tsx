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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLoader from "../../components/ui/PageLoader";
import {
  useGetAcademyCourseDetailsQuery,
  useUpdateAcademyProgressMutation,
} from "../../redux/features/academy/academyApi";
import type { AcademyModule, AcademyVideo } from "../../types/academy";
import {
  extractYouTubeVideoId,
  getYouTubeEmbedUrl,
  loadYouTubeIframeApi,
  sumDurations,
} from "../../utils/videoHelpers";

const ACADEMY_PROGRESS_LS_PREFIX = "ct-academy-progress:v1:";

/** Browser backup when API succeeds — survives refresh if server data matches */
function saveAcademyProgressBackup(
  courseId: string,
  payload: {
    completedVideoIds: string[];
    currentVideoId: string | null;
    currentModuleId: string | null;
  },
) {
  try {
    localStorage.setItem(`${ACADEMY_PROGRESS_LS_PREFIX}${courseId}`, JSON.stringify({ ...payload, savedAt: Date.now() }));
  } catch {
    /* storage full / private window */
  }
}

type VideoWithMeta = AcademyVideo & { moduleId: string; moduleTitle: string };

/** YouTube embed via IFrame API so we get ENDED and can advance + sync progress */
function YouTubeEmbedPlayer({ videoId, title, onEnded }: { videoId: string; title: string; onEnded: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<{ destroy: () => void } | null>(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    let cancelled = false;

    loadYouTubeIframeApi().then(() => {
      if (cancelled || !containerRef.current) return;
      const YT = (window as Window & { YT?: { Player: new (el: HTMLElement, opts: unknown) => { destroy: () => void }; PlayerState: { ENDED: number } } }).YT;
      if (!YT?.Player) return;

      try {
        playerRef.current?.destroy?.();
      } catch {
        /* noop */
      }

      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onStateChange: (e: { data: number }) => {
            if (e.data === YT.PlayerState.ENDED) {
              onEndedRef.current?.();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy?.();
      } catch {
        /* noop */
      }
      playerRef.current = null;
    };
  }, [videoId]);

  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-900 shadow-sm">
      <div ref={containerRef} className="h-full w-full min-h-[180px]" aria-label={title} />
    </div>
  );
}

function stripHtmlTags(html: string) {
  return String(html || "").replace(/<[^>]*>/g, "").trim();
}

/** Rich-text lesson notes from admin */
function LessonDescription({ html }: { html?: string }) {
  const text = stripHtmlTags(html ?? "");
  if (!text) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">About this lesson</p>
      <div
        className="prose prose-sm max-w-none text-gray-700 prose-p:my-2 prose-p:last:mb-0 prose-headings:text-gray-900 prose-a:text-primary-600 [&_img]:max-w-full [&_img]:rounded-lg"
        dangerouslySetInnerHTML={{ __html: html ?? "" }}
      />
    </div>
  );
}

function VideoPlayer({
  video,
  onPlaybackEnded,
}: {
  video: AcademyVideo;
  onPlaybackEnded?: () => void;
}) {
  const embedUrl = getYouTubeEmbedUrl(video.youtubeUrl);
  const ytId = extractYouTubeVideoId(video.youtubeUrl);

  if (!embedUrl || !ytId) {
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-900 shadow-sm">
        <video
          key={video.id}
          controls
          playsInline
          className="w-full h-full"
          src={video.youtubeUrl}
          onEnded={() => onPlaybackEnded?.()}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return <YouTubeEmbedPlayer videoId={ytId} title={video.title} onEnded={() => onPlaybackEnded?.()} />;
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

  const completedIdsKey = (course?.progress?.completedVideoIds ?? []).join(",");
  const firstFlatVideoId = flatVideos[0]?.id ?? null;

  useEffect(() => {
    if (!course) return;
    setActiveVideoId(course.progress?.currentVideoId ?? firstFlatVideoId);
    setWatchedVideoIds(new Set(course.progress?.completedVideoIds ?? []));
  }, [course, course?.id, course?.progress?.currentVideoId, completedIdsKey, firstFlatVideoId]);

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

  const advancingRef = useRef(false);

  const advanceAfterCompletion = useCallback(async () => {
    if (!courseId || !currentVideo || advancingRef.current) return;
    advancingRef.current = true;
    try {
      const mergedCompletedIds = [...new Set([...watchedVideoIds, currentVideo.id])];
      setWatchedVideoIds((prev) => new Set([...prev, currentVideo.id]));

      if (nextVideo) {
        setActiveVideoId(nextVideo.id);
        setCollapsedSections((prev) => new Set([...prev].filter((id) => id !== nextVideo.moduleId)));
        await updateProgress({
          courseId,
          completedVideoId: currentVideo.id,
          currentModuleId: nextVideo.moduleId,
          currentVideoId: nextVideo.id,
        }).unwrap();
        saveAcademyProgressBackup(courseId, {
          completedVideoIds: mergedCompletedIds,
          currentVideoId: nextVideo.id,
          currentModuleId: nextVideo.moduleId,
        });
      } else {
        await updateProgress({
          courseId,
          completedVideoId: currentVideo.id,
          currentModuleId: currentVideo.moduleId,
          currentVideoId: currentVideo.id,
        }).unwrap();
        saveAcademyProgressBackup(courseId, {
          completedVideoIds: mergedCompletedIds,
          currentVideoId: currentVideo.id,
          currentModuleId: currentVideo.moduleId,
        });
      }
    } catch {
      /* baseApi may toast; keep UI state best-effort */
    } finally {
      advancingRef.current = false;
    }
  }, [courseId, currentVideo, nextVideo, updateProgress, watchedVideoIds]);

  const handlePlaybackEnded = useCallback(() => {
    void advanceAfterCompletion();
  }, [advanceAfterCompletion]);

  const handleNext = () => {
    void advanceAfterCompletion();
  };

  if (isLoading) return <PageLoader fullScreen={false} />;
  if (isError || !course) return <div className="py-20 text-center text-gray-500">Unable to load course details.</div>;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => navigate("/academy")}
        className="flex w-fit items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-800"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Academy
      </button>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="inline-flex shrink-0 rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-700">
          {course.category?.name ?? "Academy"}
        </span>
        <h1 className="min-w-0 flex-1 text-lg font-bold leading-snug text-gray-900 md:text-xl">{course.title}</h1>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {currentVideo && <VideoPlayer video={currentVideo} onPlaybackEnded={handlePlaybackEnded} />}
          {currentVideo ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{currentVideo.moduleTitle}</p>
              <h2 className="text-xl font-bold leading-snug text-gray-900 md:text-2xl">{currentVideo.title}</h2>
            </div>
          ) : null}
          <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-wrap items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs font-bold text-primary-600">{progressPct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <div className="h-1.5 rounded-full bg-primary-500 transition-[width]" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            {nextVideo ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex shrink-0 items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : flatVideos.length > 0 && watchedVideoIds.size >= flatVideos.length ? (
              <span className="shrink-0 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                Course completed
              </span>
            ) : null}
          </div>
          {currentVideo ? (
            <div className="space-y-3">
              <LessonDescription html={currentVideo.description} />
            </div>
          ) : null}
        </div>
        <aside className="w-full shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white lg:w-[340px]">
          <div className="border-b border-gray-100 px-4 py-3.5">
            <p className="text-sm font-semibold text-gray-900">Course Content</p>
            <p className="mt-0.5 text-xs text-gray-500">{course.title}</p>
          </div>
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
