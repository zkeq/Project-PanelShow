"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowUpRight,
  Bot,
  Check,
  Plus,
  Search,
  BarChart3,
  Calendar,
  Clock,
  Copy,
  Link2,
  Users,
  Loader2,
  Globe2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { readProjectValueApi } from '@/lib/project-info';
import { CANONICAL_SITE_ORIGIN, getPathBasedPortfolioUrl, getPortfolioSiteUrl } from '@/lib/site-domain';
import { useGlobalStore } from '@/store/useGlobalStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTourStore } from '@/components/admin/tour/useTourStore';
import { AgentOnboardingCard } from './AgentPublishing';
import { ProjectManagementList } from './ProjectManagementList';
import { TimelineManagementList } from './TimelineManagementList';
import { SearchAndFilter } from './SearchAndFilter';
import { useRouter } from 'next/navigation';
import { fetchProjectStats, fetchProjects, fetchTimeline } from '@/lib/api';
import type { Project, TimelineItem } from '@/types/store';
import type { ProjectStatsResponse } from '@/lib/api';

const DEFAULT_THEME = {
  primary: 'from-blue-600 to-purple-600',
  secondary: 'from-blue-50 to-purple-50',
  background: 'bg-gradient-to-br from-blue-50/40 to-purple-50/40',
  text: 'text-blue-700',
  border: 'border-blue-200',
} as const;

const FALLBACK_PREVIEW_IMAGE = '/Snipaste_2025-08-23_22-52-13.png';
const FALLBACK_AVATAR = 'https://avatars.githubusercontent.com/u/62864752';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const pickString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback;

const pickNumber = (value: unknown, fallback = 0): number => {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeImageSrc = (value: string | undefined | null, fallback = FALLBACK_PREVIEW_IMAGE): string => {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  return `/${trimmed.replace(/^\/+/, '')}`;
};

const mapProjectFromApi = (raw: unknown, fallbackIndex = 0): Project => {
  if (!isRecord(raw)) {
    return {
      id: `${Date.now()}`,
      name: '未命名项目',
      description: '暂无项目描述',
      status: 'active',
      category: 'general',
      previewImage: FALLBACK_PREVIEW_IMAGE,
      updatedAt: new Date().toISOString().split('T')[0],
      attributes: [],
      themeColor: { ...DEFAULT_THEME },
    };
  }

  const allowedStatuses = new Set<Project['status']>(['active', 'maintained', 'completed', 'building']);
  const rawStatus = pickString(raw['status'], 'active').toLowerCase();

  // 支持对象格式的 status
  let statusValue = rawStatus;
  if (isRecord(raw['status'])) {
    statusValue = pickString(raw['status']['id'], 'active').toLowerCase();
  }

  const status = allowedStatuses.has(statusValue as Project['status'])
    ? (statusValue as Project['status'])
    : statusValue === 'archived'
      ? 'completed'
      : 'active';

  const themeCandidate = isRecord(raw['themeColor']) ? raw['themeColor'] : null;
  const themeCandidateAlt = isRecord(raw['theme_color']) ? raw['theme_color'] : null;
  const themeSource = themeCandidate || themeCandidateAlt;

  const themeColor = themeSource && typeof themeSource['primary'] === 'string'
    && typeof themeSource['secondary'] === 'string'
    && typeof themeSource['background'] === 'string'
    && typeof themeSource['text'] === 'string'
    && typeof themeSource['border'] === 'string'
      ? {
          primary: themeSource['primary'] as string,
          secondary: themeSource['secondary'] as string,
          background: themeSource['background'] as string,
          text: themeSource['text'] as string,
          border: themeSource['border'] as string,
        }
      : { ...DEFAULT_THEME };

  const attributesSource = raw['attributes'];
  const attributes = Array.isArray(attributesSource)
    ? attributesSource
        .filter(isRecord)
        .map((attr) => ({
          key: pickString(attr['key']),
          label: pickString(attr['label'], pickString(attr['key'], '属性')),
          value: pickString(attr['value'], '未填写'),
          icon: typeof attr['icon'] === 'string' ? (attr['icon'] as string) : undefined,
        }))
        .filter((attr) => attr.key.length > 0)
    : [];

  const previewImagesSource = raw['previewImages'];
  const previewImagesRaw = Array.isArray(previewImagesSource) ? previewImagesSource : [];
  const previewFallbackCandidate =
    pickString(raw['previewImage']) ||
    pickString(raw['preview_image']) ||
    (previewImagesRaw.find((item) => typeof item === 'string') as string | undefined);
  const previewFallback = normalizeImageSrc(previewFallbackCandidate, FALLBACK_PREVIEW_IMAGE);
  const previewImages = previewImagesRaw
    .filter((item): item is string => typeof item === 'string')
    .map((item) => normalizeImageSrc(item, FALLBACK_PREVIEW_IMAGE));

  const previewUrlValue = pickString(raw['previewUrl'], pickString(raw['preview_url']));
  const mobilePreviewUrlValue = pickString(
    raw['mobilePreviewUrl'],
    pickString(raw['mobile_preview_url'])
  );
  const sourceUrlValue = pickString(raw['sourceUrl'], pickString(raw['repositoryUrl']));
  const tagsSource = raw['tags'];
  const tags = Array.isArray(tagsSource)
    ? tagsSource
        .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
        .filter((tag) => tag.length > 0)
    : [];
  const order = pickNumber(raw['order'], fallbackIndex);

  // 解析 homeAttributes 和 sidebarAttributes
  const homeAttributesSource = raw['homeAttributes'];
  const homeAttributes = Array.isArray(homeAttributesSource)
    ? homeAttributesSource.filter(isRecord).map((attr) => ({
        id: pickString(attr['id'], `${Date.now()}`),
        icon: pickString(attr['icon'], ''),
        label: pickString(attr['label'], ''),
        value: pickString(attr['value']),
        valueCode: pickString(attr['valueCode'], ''),
        valueApi: readProjectValueApi(attr['valueApi']),
        showInHomepage: Boolean(attr['showInHomepage']),
        showInSidebar: Boolean(attr['showInSidebar']),
        color: pickString(attr['color'], ''),
        order: pickNumber(attr['order'], 0),
      }))
    : [];

  const sidebarAttributesSource = raw['sidebarAttributes'];
  const sidebarAttributes = Array.isArray(sidebarAttributesSource)
    ? sidebarAttributesSource.filter(isRecord).map((attr) => ({
        id: pickString(attr['id'], `${Date.now()}`),
        icon: pickString(attr['icon'], ''),
        label: pickString(attr['label'], ''),
        value: pickString(attr['value']),
        valueCode: pickString(attr['valueCode'], ''),
        valueApi: readProjectValueApi(attr['valueApi']),
        showInHomepage: Boolean(attr['showInHomepage']),
        showInSidebar: Boolean(attr['showInSidebar']),
        color: pickString(attr['color'], ''),
        order: pickNumber(attr['order'], 0),
      }))
    : [];

  // 解析 screenshots 字段
  const screenshotsSource = raw['screenshots'];
  const screenshots = Array.isArray(screenshotsSource)
    ? screenshotsSource
        .filter(isRecord)
        .map((screenshot) => ({
          id: pickString(screenshot['id'], `${Date.now()}`),
          url: normalizeImageSrc(
            pickString(screenshot['url'], pickString(screenshot['src'])),
            FALLBACK_PREVIEW_IMAGE
          ),
          alt: pickString(screenshot['alt'], pickString(screenshot['name'], pickString(screenshot['description']))),
        }))
        .filter((s) => s.url !== FALLBACK_PREVIEW_IMAGE) // 过滤掉无效的截图
    : undefined;

  return {
    id: pickString(raw['id'], pickString(raw['project_id'], `${Date.now()}`)),
    name: pickString(raw['name'], '未命名项目'),
    description: pickString(raw['description'], '暂无项目描述'),
    hidden: raw['hidden'] === true,
    status,
    category: pickString(raw['category'], 'general'),
    previewImage: previewFallback,
    previewImages: previewImages.length > 0 ? previewImages : undefined,
    previewUrl: previewUrlValue || undefined,
    mobilePreviewUrl: mobilePreviewUrlValue || undefined,
    sourceUrl: sourceUrlValue || undefined,
    tags: tags.length > 0 ? tags : undefined,
    order,
    updatedAt: pickString(raw['updatedAt'], pickString(raw['updated_at'], new Date().toISOString().split('T')[0])),
    attributes,
    homeAttributes,
    sidebarAttributes,
    screenshots,
    themeColor,
  };
};

const mapTimelineItemFromApi = (raw: unknown, fallbackUsername: string): TimelineItem => {
  if (!isRecord(raw)) {
    return {
      id: `timeline-${Date.now()}`,
      publishedAt: new Date().toISOString(),
      author: {
        name: fallbackUsername || '管理员',
        avatar: FALLBACK_AVATAR,
        username: fallbackUsername || 'admin',
      },
      project: {
        name: '未命名项目',
        logo: FALLBACK_PREVIEW_IMAGE,
        description: '暂无项目描述',
        techStack: [],
        readme: '',
        previewImages: [],
        repositoryUrl: '',
      },
      updateType: 'feature',
      changelog: '',
      likes: 0,
      comments: 0,
      isLiked: false,
    };
  }

  const author = isRecord(raw['author']) ? raw['author'] : null;
  const authorUsername = pickString(author ? author['username'] : undefined, fallbackUsername || 'admin');
  const authorName = pickString(author ? author['name'] : undefined, authorUsername || '管理员');
  const authorAvatar = pickString(author ? author['avatar'] : undefined, FALLBACK_AVATAR);

  const projectRaw = isRecord(raw['project']) ? raw['project'] : {};
  const techStackSource = projectRaw ? projectRaw['techStack'] : undefined;
  const techStack = Array.isArray(techStackSource)
    ? techStackSource.filter((item): item is string => typeof item === 'string')
    : [];
  const previewImagesSource = projectRaw ? projectRaw['previewImages'] : undefined;
  const previewImages = Array.isArray(previewImagesSource)
    ? previewImagesSource
        .filter((item): item is string => typeof item === 'string')
        .map((item) => normalizeImageSrc(item, FALLBACK_PREVIEW_IMAGE))
    : [];
  const liveUrlValue = pickString(projectRaw ? projectRaw['liveUrl'] : undefined);

  const allowedUpdateTypes: TimelineItem['updateType'][] = ['feature', 'refactor', 'new'];
  const rawUpdateType = pickString(raw['updateType'], 'feature').toLowerCase();
  const updateType = allowedUpdateTypes.includes(rawUpdateType as TimelineItem['updateType'])
    ? (rawUpdateType as TimelineItem['updateType'])
    : 'feature';

  const publishedAt = pickString(
    raw['publishedAt'],
    pickString(raw['published_at'], pickString(raw['date'], new Date().toISOString()))
  );

  const changelog = pickString(raw['changelog'], pickString(raw['content'], ''));

  return {
    id: pickString(raw['id'], `timeline-${Date.now()}`),
    publishedAt,
    author: {
      name: authorName,
      avatar: authorAvatar,
      username: authorUsername,
    },
    project: {
      name: pickString(projectRaw ? projectRaw['name'] : undefined, '未命名项目'),
      logo: normalizeImageSrc(pickString(projectRaw ? projectRaw['logo'] : undefined), FALLBACK_PREVIEW_IMAGE),
      description: pickString(projectRaw ? projectRaw['description'] : undefined, '暂无项目描述'),
      techStack,
      readme: pickString(projectRaw ? projectRaw['readme'] : undefined, ''),
      previewImages,
      repositoryUrl: pickString(projectRaw ? projectRaw['repositoryUrl'] : undefined, ''),
      liveUrl: liveUrlValue || undefined,
    },
    updateType,
    changelog,
    likes: pickNumber(raw['likes'], 0),
    comments: pickNumber(raw['comments'], 0),
    isLiked: Boolean(raw['isLiked']),
  };
};

interface AdminDashboardProps {
  className?: string;
}

function SiteAddressRow({ label, url, independent = false }: { label: string; url: string; independent?: boolean }) {
  const [copyStatus, setCopyStatus] = useState<'copied' | 'failed'>();
  const Icon = independent ? Check : Link2;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-0.5 py-2 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-x-3">
      <p className="col-start-1 row-start-1 flex items-center gap-1.5 text-sm font-medium">
        <Icon aria-hidden="true" className={cn('size-3.5 shrink-0', independent ? 'text-emerald-600 dark:text-emerald-300' : 'text-emerald-800/55 dark:text-emerald-200/55')} />
        {label}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="col-start-1 row-start-2 break-all pl-5 font-mono text-xs leading-relaxed text-emerald-800 underline-offset-4 hover:underline dark:text-emerald-100 sm:col-start-2 sm:row-start-1 sm:pl-0 sm:text-sm"
      >
        {url}
      </a>
      <div className="col-start-2 row-span-2 row-start-1 flex items-center gap-1 sm:col-start-3 sm:row-span-1 sm:gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 max-sm:size-8 max-sm:px-0 dark:text-emerald-100 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-50 sm:min-w-18"
          onClick={copyUrl}
          aria-label={`复制${label}`}
          title={`复制${label}`}
        >
          {copyStatus === 'copied' ? <Check aria-hidden="true" className="size-3.5" /> : <Copy aria-hidden="true" className="size-3.5" />}
          <span className="hidden sm:inline">{copyStatus === 'copied' ? '已复制' : '复制'}</span>
        </Button>
        <Button asChild variant={independent ? 'default' : 'outline'} size="sm" className={cn(
          'max-sm:size-8 max-sm:px-0 sm:w-18',
          independent
            ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400'
            : 'border-emerald-300/80 bg-transparent text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 dark:border-emerald-500/40 dark:text-emerald-100 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-50'
        )}>
          <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`打开${label}`} title={`打开${label}`}>
            <span className="hidden sm:inline">前往</span>
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
        </Button>
      </div>
      <span role="status" className={copyStatus === 'failed' ? 'col-span-full pl-5 text-xs text-destructive' : 'sr-only'}>
        {copyStatus === 'copied' ? `${label}已复制` : copyStatus === 'failed' ? '复制失败，可手动选择地址复制。' : ''}
      </span>
    </div>
  );
}

export function AdminDashboard({ className }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [remoteStats, setRemoteStats] = useState<ProjectStatsResponse['data'] | null>(null);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [siteOrigin, setSiteOrigin] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    if (process.env.NEXT_PUBLIC_SITE_ORIGIN) {
      return process.env.NEXT_PUBLIC_SITE_ORIGIN;
    }
    return CANONICAL_SITE_ORIGIN;
  });

  const hydratedAuth = useAuthStore((state) => state.hydrated);
  const token = useAuthStore((state) => state.token);
  const boundUsername = useAuthStore((state) => state.user?.bound_username ?? null);
  const agentToken = useAuthStore((state) => state.token);
  const redirectingRef = useRef(false);
  const dataFetchKeyRef = useRef<string | null>(null);

  const projects = useGlobalStore((state) => state.projects);
  const timelineItems = useGlobalStore((state) => state.timelineItems);
  const setProjects = useGlobalStore((state) => state.setProjects);
  const setTimelineItems = useGlobalStore((state) => state.setTimelineItems);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const origin = window.location.origin;
    if (origin && origin !== siteOrigin) {
      setSiteOrigin(origin);
    }
  }, [siteOrigin]);

  useEffect(() => {
    if (!hydratedAuth) return;
    if (redirectingRef.current) return;

    if (!token) {
      redirectingRef.current = true;
      router.replace('/admin/login');
      return;
    }

    if (!boundUsername) {
      redirectingRef.current = true;
      router.replace('/admin/welcome');
    }
  }, [hydratedAuth, token, boundUsername, router]);

  useEffect(() => {
    if (!token || !boundUsername) return;

    const fetchKey = `${token}:${boundUsername}`;
    if (dataFetchKeyRef.current === fetchKey) {
      return;
    }

    dataFetchKeyRef.current = fetchKey;

    let cancelled = false;
    let fetchCompleted = false;

    const loadData = async () => {
      setIsFetchingRemote(true);
      try {
        const [statsRes, projectsRes, timelineRes] = await Promise.all([
          fetchProjectStats(boundUsername, token),
          fetchProjects(boundUsername, token),
          fetchTimeline(boundUsername, token),
        ]);

        if (cancelled) {
          return;
        }

        const projectData = projectsRes && projectsRes.success && Array.isArray(projectsRes.data)
          ? projectsRes.data
          : [];
        const mappedProjects: Project[] = projectData.map((item: unknown, index) =>
          mapProjectFromApi(item, index)
        );
        setProjects(mappedProjects);

        const timelineData = timelineRes && timelineRes.success && Array.isArray(timelineRes.data)
          ? timelineRes.data
          : [];
        const mappedTimeline: TimelineItem[] = timelineData.map((item: unknown) =>
          mapTimelineItemFromApi(item, boundUsername)
        );
        setTimelineItems(mappedTimeline);

        setRemoteStats(statsRes && statsRes.success ? statsRes.data : null);
        setFetchError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }
        const message = error instanceof Error ? error.message : '数据加载失败，请稍后重试';
        setFetchError(message);
      } finally {
        fetchCompleted = true;
        if (!cancelled) {
          setIsFetchingRemote(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
      if (!fetchCompleted) {
        dataFetchKeyRef.current = null;
        setIsFetchingRemote(false);
      }
    };
  }, [token, boundUsername, setProjects, setTimelineItems]);

  // 获取数据
  // 新建项目处理 - 跳转到真实管理页面
  const handleCreateProject = () => {
    router.push('/admin/projects/create');
  };

  // 新建动态处理
  const handleCreateTimeline = () => {
    router.push('/admin/dynamic');
  };

  // 统计数据
  const computedStats = useMemo(() => {
    if (remoteStats) {
      return {
        totalProjects: remoteStats.totalProjects,
        activeProjects: remoteStats.activeProjects,
        totalTimeline: remoteStats.totalTimeline,
        thisMonthTimeline: remoteStats.thisMonthTimeline,
      };
    }

    const activeProjects = projects.filter((project) => project.status === 'active').length;
    const totalProjects = projects.length;
    const totalTimeline = timelineItems.length;
    const thisMonthTimeline = timelineItems.filter((item) => {
      const publishedDate = new Date(item.publishedAt);
      const now = new Date();
      return (
        publishedDate.getMonth() === now.getMonth() &&
        publishedDate.getFullYear() === now.getFullYear()
      );
    }).length;

    return {
      totalProjects,
      activeProjects,
      totalTimeline,
      thisMonthTimeline,
    };
  }, [remoteStats, projects, timelineItems]);

  // 过滤数据
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [projects, searchQuery, statusFilter, categoryFilter]);

  const isProjectListFiltered =
    filteredProjects.length !== projects.length ||
    searchQuery.trim().length > 0 ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all';

  const filteredTimelineItems = useMemo(() => {
    return timelineItems.filter(item => {
      const matchesSearch = item.project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.project.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [timelineItems, searchQuery]);

  const siteUrl = boundUsername ? getPortfolioSiteUrl(boundUsername, siteOrigin) : null;
  const mainSiteUrl = boundUsername ? getPathBasedPortfolioUrl(boundUsername, siteOrigin) : null;

  return (
    <>
        {/* 主内容区域 */}
        <div className={cn('relative z-10 container mx-auto p-6 space-y-6 pt-6', className)}>
        {boundUsername && agentToken && <AgentOnboardingCard token={agentToken} />}
        <section className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-900 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100" data-tour="site-banner">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                <Globe2 aria-hidden="true" className="size-4" />
              </div>
              <h2 className="text-sm font-semibold">站点访问地址</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild size="sm" className={cn(
                'relative isolate overflow-hidden font-semibold',
                'before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:opacity-30',
                'before:[background-image:radial-gradient(circle,currentColor_0.65px,transparent_0.85px)] before:[background-size:6px_6px]',
                'before:[mask-image:linear-gradient(to_right,transparent_15%,black)]'
              )}>
                <Link href="/admin/agent">
                  <Bot aria-hidden="true" className="size-4" />
                  Agent 发布
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                data-tour-launcher
                onPointerEnter={() => useTourStore.getState().preload()}
                onFocus={() => useTourStore.getState().preload()}
                onClick={() => useTourStore.getState().start()}
                className="border-emerald-300 bg-transparent text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 dark:border-emerald-500/40 dark:text-emerald-100 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-50"
              >
                <Sparkles className="size-3.5" />
                互动引导
              </Button>
            </div>
          </div>
          {mainSiteUrl ? (
            <div className="mt-3 divide-y divide-emerald-200/75 border-t border-emerald-200/75 pt-1 dark:divide-emerald-500/20 dark:border-emerald-500/20">
              {siteUrl && siteUrl !== mainSiteUrl && <SiteAddressRow key={siteUrl} label="独立站点地址" url={siteUrl} independent />}
              <SiteAddressRow key={mainSiteUrl} label="主站地址" url={mainSiteUrl} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-emerald-800/80 dark:text-emerald-200/80">在欢迎页或设置中绑定站点后，即可获得公开作品集地址。</p>
          )}
        </section>
        {(fetchError || isFetchingRemote) && (
          <div className="space-y-3">
            {isFetchingRemote && (
              <div className="flex items-center gap-2 rounded-md border border-border/40 bg-card/40 px-4 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                正在同步后端数据...
              </div>
            )}
            {fetchError && (
              <div className="flex items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <span>{fetchError}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive"
                  onClick={() => {
                    dataFetchKeyRef.current = null;
                    setFetchError(null);
                  }}
                >
                  重试
                </Button>
              </div>
            )}
          </div>
        )}
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="stats-grid">
          <Card className="bg-card/30 backdrop-blur-sm border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 to-white/20 dark:from-blue-950/20 dark:to-background/20" />
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">总项目数</p>
                  <p className="text-2xl font-bold text-foreground">{computedStats.totalProjects}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/40 to-white/20 dark:from-emerald-950/20 dark:to-background/20" />
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">活跃项目</p>
                  <p className="text-2xl font-bold text-foreground">{computedStats.activeProjects}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-50/40 to-white/20 dark:from-purple-950/20 dark:to-background/20" />
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">总动态数</p>
                  <p className="text-2xl font-bold text-foreground">{computedStats.totalTimeline}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-700 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-orange-50/40 to-white/20 dark:from-orange-950/20 dark:to-background/20" />
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">本月动态</p>
                  <p className="text-2xl font-bold text-foreground">{computedStats.thisMonthTimeline}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-700 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和快速操作 */}
        <Card className="bg-card/30 backdrop-blur-sm border border-white/20">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="搜索项目或动态..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <SearchAndFilter
                  statusFilter={statusFilter}
                  categoryFilter={categoryFilter}
                  onStatusChange={setStatusFilter}
                  onCategoryChange={setCategoryFilter}
                />
              </div>
              <div className="flex items-center gap-2" data-tour="quick-actions">
                <Button size="sm" onClick={handleCreateProject}>
                  <Plus className="w-4 h-4 mr-2" />
                  新建项目
                </Button>
                <Button size="sm" variant="outline" onClick={handleCreateTimeline}>
                  <Plus className="w-4 h-4 mr-2" />
                  新建动态
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主要内容区域 */}
        <Card className="bg-card/30 backdrop-blur-sm border border-white/20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader>
              <TabsList className="grid grid-cols-2 w-full max-w-md">
                <TabsTrigger value="projects">
                  项目管理 ({filteredProjects.length})
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  动态管理 ({filteredTimelineItems.length})
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent className="p-0">
              <TabsContent value="projects" className="m-0">
          <ProjectManagementList
            projects={filteredProjects}
            searchQuery={searchQuery}
            isFiltered={isProjectListFiltered}
          />
              </TabsContent>
              
              <TabsContent value="timeline" className="m-0">
                <TimelineManagementList 
                  items={filteredTimelineItems}
                  searchQuery={searchQuery}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </>
  );
}
