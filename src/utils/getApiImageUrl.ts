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
    return image.includes("http")
      ? image
      : `${config.image_access_url}${image.startsWith("/") ? image : `/${image}`}`;
  }

  if (!image.url) return "";
  const url = image.url;

  if (url.includes("http")) return url;

  return `${config.image_access_url}${url.startsWith("/") ? url : `/${url}`}`;
}
