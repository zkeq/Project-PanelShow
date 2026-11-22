import { useEffect, useState } from 'react';
import { useExecuteCode } from '@/hooks/useExecuteCode';
import { readProjectValueApi } from '@/lib/project-info';
import type { ProjectInfo, ProjectValueApi } from '@/types/store';

const responseCache = new Map<string, { expiresAt: number; result: Promise<unknown> }>();
const MAX_RESPONSE_BYTES = 128 * 1024;

async function loadJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, {
      credentials: 'omit',
      mode: 'cors',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    });
    if (!response.ok || !response.body) return;

    const bytes = new Uint8Array(MAX_RESPONSE_BYTES);
    const reader = response.body.getReader();
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (length + value.length > bytes.length) {
        await reader.cancel();
        return;
      }
      bytes.set(value, length);
      length += value.length;
    }
    return JSON.parse(new TextDecoder().decode(bytes.subarray(0, length)));
  } catch {
    return;
  } finally {
    clearTimeout(timeout);
  }
}

function readJson(url: string) {
  const now = Date.now();
  const cached = responseCache.get(url);
  if (cached && cached.expiresAt > now) return cached.result;
  for (const [key, entry] of responseCache) {
    if (entry.expiresAt <= now) responseCache.delete(key);
  }
  const result = loadJson(url);
  responseCache.set(url, { expiresAt: now + 60_000, result });
  return result;
}

function formatJsonValue(json: unknown, source: ProjectValueApi) {
  let value = json;
  for (const key of source.json_path) {
    if (value === null || typeof value !== 'object' || !Object.prototype.hasOwnProperty.call(value, key)) return;
    value = (value as Record<string, unknown>)[key];
  }
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return;
  return `${source.prefix ?? ''}${value}${source.suffix ?? ''}`.slice(0, 100);
}

export function useProjectInfoValue(info: Pick<ProjectInfo, 'value' | 'valueCode' | 'valueApi'>) {
  const legacy = useExecuteCode(info.valueCode, info.value);
  const source = info.valueCode?.trim() ? undefined : readProjectValueApi(info.valueApi);
  const url = source?.url;
  const [remote, setRemote] = useState<{ url: string; json: unknown }>();

  useEffect(() => {
    if (!url) return;
    let active = true;
    void readJson(url).then((json) => {
      if (active) setRemote({ url, json });
    });
    return () => { active = false; };
  }, [url]);

  if (source && remote?.url === source.url) {
    return { value: formatJsonValue(remote.json, source) ?? info.value ?? '', loading: false };
  }
  return legacy;
}
