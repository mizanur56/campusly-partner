export function decodeHtmlEntities(value?: string): string {
  const input = String(value ?? "");
  if (!input) return "";

  if (typeof window === "undefined" || typeof document === "undefined") {
    return input
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'");
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = input;
  return textarea.value;
}

export function stripHtmlTags(value?: string): string {
  const decoded = decodeHtmlEntities(value).trim();
  if (!decoded) return "";

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(decoded, "text/html");
    return (parsed.body.textContent || parsed.body.innerText || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  return decoded.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function looksLikeHtml(value?: string): boolean {
  const decoded = decodeHtmlEntities(value).trim();
  return /<[a-z][\s\S]*>/i.test(decoded);
}