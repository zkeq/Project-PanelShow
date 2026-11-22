import type { ProjectValueApi } from '@/types/store';

export function readProjectValueApi(input: unknown): ProjectValueApi | undefined {
  if (!input || typeof input !== 'object') return;

  const { url, json_path, prefix, suffix } = input as Partial<ProjectValueApi>;
  if (typeof url !== 'string' || !Array.isArray(json_path) || !json_path.length || json_path.length > 8
    || !json_path.every((key) => typeof key === 'string' && key.trim() && key.length <= 100)) return;

  let address: URL;
  try {
    address = new URL(url);
  } catch {
    return;
  }
  const hostname = address.hostname.replace(/\.$/, '');
  if (address.protocol !== 'https:' || address.username || address.password || address.port
    || !/^(?:[a-z0-9-]+\.)+(?:[a-z]{2,}|xn--[a-z0-9-]+)$/.test(hostname)
    || /\.(?:localhost|local|internal|home\.arpa)$/.test(hostname)) return;

  return {
    url: address.href,
    json_path,
    prefix: typeof prefix === 'string' ? prefix.slice(0, 20) : undefined,
    suffix: typeof suffix === 'string' ? suffix.slice(0, 20) : undefined,
  };
}
