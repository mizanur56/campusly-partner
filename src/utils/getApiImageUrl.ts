import { config } from "../config";

type ApiImageObject = {
  url?: string | null;
  name?: string | null;
  altText?: string | null;
  type?: string | null;
};

export function getApiImageUrl(
  image: ApiImageObject | string | null | undefined
): string {
  if (!image) return "";

  if (typeof image === "string") {
    if (image.includes("http")) return image;
    const base = config.image_access_url;
    if (!base) return image;
    return `${base}${image.startsWith("/") ? image : `/${image}`}`;
  }

  if (!image.url) return "";
  const url = image.url;

  if (url.includes("http")) return url;

  const base = config.image_access_url;
  if (!base) return url;
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}
