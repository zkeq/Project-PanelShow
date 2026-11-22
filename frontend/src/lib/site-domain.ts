export const LEGACY_SITE_HOSTNAME = "projects.onmicrosoft.cn";
export const CANONICAL_SITE_HOSTNAME = "projects.dev-tool.cool";
export const CANONICAL_SITE_ORIGIN = `https://${CANONICAL_SITE_HOSTNAME}`;

const LEGACY_API_ORIGIN = "https://pps-backend.onmicrosoft.cn";
export const CANONICAL_API_ORIGIN = "https://pps-backend.dev-tool.cool";

export function resolveApiOrigin(configuredOrigin: string): string {
  const origin = configuredOrigin.replace(/\/+$/, "");
  return origin === LEGACY_API_ORIGIN ? CANONICAL_API_ORIGIN : origin;
}
