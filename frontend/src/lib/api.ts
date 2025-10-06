export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  token?: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const extractErrorMessage = (payload: unknown): string | undefined => {
  if (!isRecord(payload)) return undefined;

  if ('detail' in payload) {
    const detail = payload.detail;
    if (typeof detail === 'string') return detail;
  }

  if ('message' in payload) {
    const message = payload.message;
    if (typeof message === 'string') return message;
  }

  return undefined;
};

type ApiError = Error & { status: number; payload?: unknown };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('服务返回了无法解析的响应');
    }
  }

  if (!response.ok) {
    const message = extractErrorMessage(data) ?? `请求失败 (${response.status})`;
    const error = new Error(message) as ApiError;
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data as T;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    role: string;
    auth_type: string;
    github_id?: number;
    github_username?: string;
  };
}

export interface CurrentUserResponse {
  role: string;
  auth_type: string;
  bound_username?: string | null;
  github_id?: number;
  github_username?: string;
}

export interface BindUsernameResponse {
  message: string;
  username: string;
}

export interface GithubLoginResponse {
  auth_url: string;
}

export interface UsernameAvailabilityResponse {
  username: string;
  exists: boolean;
  is_bound: boolean;
  available: boolean;
  message: string;
}

export interface ProfileSectionResponse<T = unknown> {
  success: boolean;
  data: T;
}

export function adminLogin(username: string, password: string) {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function githubGetAuthUrl() {
  return request<GithubLoginResponse>('/api/auth/github/login');
}

export function githubExchangeCode(code: string) {
  const url = `/api/auth/github/callback?code=${encodeURIComponent(code)}`;
  return request<AuthResponse>(url);
}

export function fetchCurrentUser(token: string) {
  return request<CurrentUserResponse>('/api/auth/me', { token });
}

export function bindUsername(username: string, token: string) {
  return request<BindUsernameResponse>('/api/auth/bind-username', {
    method: 'POST',
    token,
    body: JSON.stringify({ username }),
  });
}

export function checkUsernameAvailability(username: string) {
  return request<UsernameAvailabilityResponse>(
    `/api/auth/check-username/${encodeURIComponent(username)}`
  );
}

export function getProfileSection<T = unknown>(username: string, section: string) {
  return request<ProfileSectionResponse<T>>(
    `/api/profile/${encodeURIComponent(username)}/${encodeURIComponent(section)}`
  );
}

export function updateProfileSection<T extends Record<string, unknown> | Array<unknown>>(
  username: string,
  section: string,
  data: T,
  token: string
) {
  return request<{ message: string; data: T }>(
    `/api/profile/${encodeURIComponent(username)}/${encodeURIComponent(section)}`,
    {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    }
  );
}
