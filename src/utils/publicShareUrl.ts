import { config } from "../config";

function getMarketingBaseUrl(): string {
  const configured = String(import.meta.env.VITE_MARKETING_BASE_URL || "").trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const protocol =
    String(import.meta.env.VITE_DASHBOARD_PROTOCOL || "").trim() || "https";
  const domain = String(config.app_domain || "")
    .trim()
    .replace(/\/$/, "");
  if (!domain) {
    return "https://www.gubdi.com";
  }

  if (domain.startsWith("http://") || domain.startsWith("https://")) {
    try {
      const parsed = new URL(domain);
      const host = parsed.hostname.replace(/^(student|partner|admin)\./i, "");
      const websiteHost = host.startsWith("www.") ? host : `www.${host}`;
      return `${parsed.protocol}//${websiteHost}`;
    } catch {
      return domain.replace(/\/$/, "");
    }
  }

  const rootDomain = domain.replace(/^(student|partner|admin)\./i, "");
  const websiteDomain = rootDomain.startsWith("www.")
    ? rootDomain
    : `www.${rootDomain}`;
  return `${protocol}://${websiteDomain}`;
}

export function buildPublicShareUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getMarketingBaseUrl()}${normalizedPath}`;
}
