import type { ProjectDetailResponse } from '@/types/demo';

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

export function checkUsernameAvailability(username: string, token?: string) {
  return request<UsernameAvailabilityResponse>(
    `/api/auth/check-username/${encodeURIComponent(username)}`,
    token ? { token } : undefined
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

export interface ProjectStatsResponse {
  success: boolean;
  data: {
    totalProjects: number;
    statusDistribution: Record<string, number>;
    activeProjects: number;
    maintainedProjects: number;
    archivedProjects: number;
    totalTimeline: number;
    thisMonthTimeline: number;
    latestProjectUpdatedAt: string | null;
    latestTimelinePublishedAt: string | null;
  };
}

export interface ProjectListResponse<T = unknown> {
  success: boolean;
  data: T;
  total: number;
}

export interface TimelineListResponse<T = unknown> {
  success: boolean;
  data: T;
  total?: number;
}

export function fetchProjectStats(username: string, token: string) {
  return request<ProjectStatsResponse>(
    `/api/projects/${encodeURIComponent(username)}/stats/overview`,
    { token }
  );
}

export function fetchProjects(username: string, token: string) {
  return request<ProjectListResponse>(
    `/api/projects/${encodeURIComponent(username)}`,
    { token }
  );
}

export function fetchProjectDetail(
  username: string,
  projectId: string,
  options?: RequestOptions
) {
  return request<ProjectDetailResponse>(
    `/api/projects/${encodeURIComponent(username)}/${encodeURIComponent(projectId)}`,
    options
  );
}

export function fetchTimeline(username: string, token: string) {
  return request<TimelineListResponse>(
    `/api/timeline/${encodeURIComponent(username)}`,
    { token }
  );
}

export function createTimeline(
  username: string,
  data: Record<string, unknown>,
  token: string
) {
  return request<{ message: string; data: Record<string, unknown> }>(
    `/api/timeline/${encodeURIComponent(username)}`,
    {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }
  );
}

export function updateTimeline(
  username: string,
  timelineId: string,
  data: Record<string, unknown>,
  token: string
) {
  return request<{ message: string; data: Record<string, unknown> }>(
    `/api/timeline/${encodeURIComponent(username)}/${encodeURIComponent(timelineId)}`,
    {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    }
  );
}

export interface GithubSyncResponse {
  success: boolean;
  message: string;
  data: Record<string, unknown>;
  github_user: Record<string, unknown>;
  total_stars: number;
}

export function syncGithubProfile(username: string, githubUsername: string, token: string) {
  return request<GithubSyncResponse>(
    `/api/profile/${encodeURIComponent(username)}/github-sync`,
    {
      method: 'POST',
      token,
      body: JSON.stringify({ github_username: githubUsername }),
    }
  );
}

export interface UploadImageResponse {
  success: boolean;
  filename: string;
  url: string;
  content_type: string;
  size: number;
}

export async function uploadImage(
  username: string,
  file: File,
  token: string,
  category = 'images'
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${API_BASE_URL}/api/uploads/${encodeURIComponent(username)}/images?category=${encodeURIComponent(category)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `上传失败 (${response.status})`);
  }

  const data = (await response.json()) as UploadImageResponse;
  const normalizedUrl =
    typeof data.url === 'string' && data.url.startsWith('/')
      ? `${API_BASE_URL.replace(/\/+$/, '')}/${data.url.replace(/^\/+/, '')}`
      : data.url;

  return {
    ...data,
    url: normalizedUrl,
  };
}

export interface SettingsResponse<T = unknown> {
  success: boolean;
  data: T;
}

export function fetchSettings<T>(username: string, settingType: string, token: string) {
  return request<SettingsResponse<T>>(
    `/api/settings/${encodeURIComponent(username)}/${encodeURIComponent(settingType)}`,
    { token }
  );
}

export function updateSettings<T>(
  username: string,
  settingType: string,
  data: T,
  token: string
) {
  return request<{ message: string; data: T }>(
    `/api/settings/${encodeURIComponent(username)}/${encodeURIComponent(settingType)}`,
    {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    }
  );
}

export interface CreateProjectResponse<T = Record<string, unknown>> {
  message: string;
  data: T;
}

export function createProject<T extends Record<string, unknown>>(
  username: string,
  project: T,
  token: string
) {
  return request<CreateProjectResponse<T>>(
    `/api/projects/${encodeURIComponent(username)}`,
    {
      method: 'POST',
      token,
      body: JSON.stringify(project),
    }
  );
}

export interface ProjectDetailResponse<T = Record<string, unknown>> {
  success: boolean;
  data: T;
}

export function fetchProject<T = Record<string, unknown>>(
  username: string,
  projectId: string,
  token: string
) {
  return request<ProjectDetailResponse<T>>(
    `/api/projects/${encodeURIComponent(username)}/${encodeURIComponent(projectId)}`,
    { token }
  );
}

export function updateProject<T extends Record<string, unknown>>(
  username: string,
  projectId: string,
  project: T,
  token: string
) {
  return request<{ message: string; data: T }>(
    `/api/projects/${encodeURIComponent(username)}/${encodeURIComponent(projectId)}`,
    {
      method: 'PUT',
      token,
      body: JSON.stringify(project),
    }
  );
}

// ==================== JS 代码执行 ====================

export interface ExecuteJsResponse {
  success: boolean;
  result: unknown;
  cached?: boolean;
  cached_at?: string;
}

export function executeJsCode(code: string) {
  return request<ExecuteJsResponse>('/api/execute-js', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

// Profile API
export interface ProfileResponse {
  success: boolean;
  data: {
    username?: string;
    name?: string;
    title?: string;
    email?: string;
    github?: string;
    website?: string;
    bio?: string;
    avatar?: string;
    github_username?: string;
    github_followers?: number;
    github_following?: number;
    github_total_stars?: number;
    github_public_repos?: number;
    github_company?: string;
    github_location?: string;
    github_blog?: string;
    github_bio?: string;
    location?: string;
    [key: string]: unknown;
  };
}

export interface UsersResponse {
  success: boolean;
  data: Record<string, {
    username: string;
    name: string;
    avatar: string;
    bio: string;
    location?: string;
    website?: string;
    githubUrl?: string;
    twitterUrl?: string;
  }>;
}

export interface ExperiencesResponse {
  success: boolean;
  data: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    period: string;
    responsibilities: string[];
  }>;
}

export interface QuickLinksResponse {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    url: string;
    icon: string;
    description: string;
  }>;
}

export function getProfile(username: string) {
  return request<ProfileResponse>(`/api/profile/${username}/profile`);
}

export function getUsers(username: string) {
  return request<UsersResponse>(`/api/profile/${username}/users`);
}

export function getExperiences(username: string) {
  return request<ExperiencesResponse>(`/api/profile/${username}/experiences`);
}

export function getQuickLinks(username: string) {
  return request<QuickLinksResponse>(`/api/profile/${username}/quickLinks`);
}

// 检查用户名可用性
export interface CheckUsernameResponse {
  username: string;
  exists: boolean;
  is_bound: boolean;
  available: boolean;
  message: string;
}

export function checkUsername(username: string) {
  return request<CheckUsernameResponse>(`/api/auth/check-username/${username}`);
}

// 时间线点赞
export interface LikeTimelineResponse {
  success: boolean;
  message: string;
  data: {
    likes: number;
    isLiked: boolean;
  };
}

export function likeTimeline(username: string, timelineId: string) {
  return request<LikeTimelineResponse>(`/api/timeline/${username}/${timelineId}/like`, {
    method: 'POST'
  });
}
