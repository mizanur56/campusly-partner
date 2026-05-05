/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}

/**
 * Sum an array of duration strings (HH:MM:SS or MM:SS) into a human-readable
 * label like "2h 30m", "45m", or "" when the total is zero / all blank.
 */
export function sumDurations(durations: string[]): string {
  let totalSeconds = 0;
  for (const d of durations) {
    if (!d) continue;
    const parts = d.split(":").map(Number);
    if (parts.length === 3) {
      totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      totalSeconds += parts[0] * 60 + parts[1];
    }
  }
  if (totalSeconds === 0) return "";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/**
 * Convert YouTube URL to embed format for iframe
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const siParam = params.get("si");
    if (siParam) {
      return `https://www.youtube.com/embed/${videoId}?si=${siParam}`;
    }
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return `https://www.youtube.com/embed/${videoId}`;
  }
}
