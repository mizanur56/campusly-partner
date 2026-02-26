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
