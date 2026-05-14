export const SUPPORTED_DOCUMENT_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/jfif",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;

export const SUPPORTED_DOCUMENT_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".jfif",
  ".png",
  ".webp",
  ".gif",
  ".pdf",
] as const;

export const SUPPORTED_DOCUMENT_ACCEPT = SUPPORTED_DOCUMENT_EXTENSIONS.join(",");
