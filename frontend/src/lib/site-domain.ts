export const LEGACY_SITE_HOSTNAME = "projects.onmicrosoft.cn";
export const CANONICAL_SITE_HOSTNAME = "projects.dev-tool.cool";
export const CANONICAL_SITE_ORIGIN = `https://${CANONICAL_SITE_HOSTNAME}`;
export const PORTFOLIO_DOMAIN = "space.dev-tool.cool";
export const LOCAL_PORTFOLIO_DOMAIN = "space.localhost";

const PORTFOLIO_SUFFIX = `.${PORTFOLIO_DOMAIN}`;
const PORTFOLIO_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

const LEGACY_API_ORIGIN = "https://pps-backend.onmicrosoft.cn";
export const CANONICAL_API_ORIGIN = "https://pps-backend.dev-tool.cool";

export function getPortfolioUsername(hostname: string): string | null {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  const suffix = process.env.NODE_ENV === "development" && host.endsWith(`.${LOCAL_PORTFOLIO_DOMAIN}`)
    ? `.${LOCAL_PORTFOLIO_DOMAIN}`
    : PORTFOLIO_SUFFIX;
  if (!host.endsWith(suffix)) return null;

  const username = host.slice(0, -suffix.length);
  return PORTFOLIO_LABEL.test(username) ? username : null;
}

export function getPortfolioPath(username: string): string {
  return `/project/${encodeURIComponent(username)}`;
}

export function getPathBasedPortfolioUrl(username: string, siteOrigin: string): string {
  return new URL(getPortfolioPath(username), siteOrigin).href;
}

export function getPortfolioSiteUrl(username: string, siteOrigin = CANONICAL_SITE_ORIGIN): string {
  const url = new URL(siteOrigin);
  if (process.env.NODE_ENV === "development" && PORTFOLIO_LABEL.test(username) &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
    url.hostname = `${username}.${LOCAL_PORTFOLIO_DOMAIN}`;
    return url.origin;
  }

  const usesHostedDomains = url.hostname === CANONICAL_SITE_HOSTNAME ||
    url.hostname === LEGACY_SITE_HOSTNAME || getPortfolioUsername(url.hostname) !== null;

  if (usesHostedDomains && PORTFOLIO_LABEL.test(username)) {
    return `https://${username}${PORTFOLIO_SUFFIX}`;
  }

  const origin = usesHostedDomains ? CANONICAL_SITE_ORIGIN : url.origin;
  return getPathBasedPortfolioUrl(username, origin);
}

export function resolveApiOrigin(configuredOrigin: string): string {
  const origin = configuredOrigin.replace(/\/+$/, "");
  return origin === LEGACY_API_ORIGIN ? CANONICAL_API_ORIGIN : origin;
}
