"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  BarChart3,
  Calendar,
  Clock,
  Users,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalStore } from '@/store/useGlobalStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ProjectManagementList } from './ProjectManagementList';
import { TimelineManagementList } from './TimelineManagementList';
import { SearchAndFilter } from './SearchAndFilter';
import { AdminHeader } from './AdminHeader';
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

const mapProjectFromApi = (raw: unknown): Project => {
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

  const allowedStatuses = new Set<Project['status']>(['active', 'maintained', 'completed']);
  const rawStatus = pickString(raw['status'], 'active').toLowerCase();
  const status = allowedStatuses.has(rawStatus as Project['status'])
    ? (rawStatus as Project['status'])
    : rawStatus === 'archived'
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

  return {
    id: pickString(raw['id'], pickString(raw['project_id'], `${Date.now()}`)),
    name: pickString(raw['name'], '未命名项目'),
    description: pickString(raw['description'], '暂无项目描述'),
    status,
    category: pickString(raw['category'], 'general'),
    previewImage: previewFallback,
    updatedAt: pickString(raw['updatedAt'], pickString(raw['updated_at'], new Date().toISOString().split('T')[0])),
    attributes,
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

export function AdminDashboard({ className }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [remoteStats, setRemoteStats] = useState<ProjectStatsResponse['data'] | null>(null);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const hydratedAuth = useAuthStore((state) => state.hydrated);
  const token = useAuthStore((state) => state.token);
  const boundUsername = useAuthStore((state) => state.user?.bound_username ?? null);
  const redirectingRef = useRef(false);
  const dataFetchKeyRef = useRef<string | null>(null);

  const projects = useGlobalStore((state) => state.projects);
  const timelineItems = useGlobalStore((state) => state.timelineItems);
  const setProjects = useGlobalStore((state) => state.setProjects);
  const setTimelineItems = useGlobalStore((state) => state.setTimelineItems);

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
        const mappedProjects: Project[] = projectData.map((item: unknown) => mapProjectFromApi(item));
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

  const filteredTimelineItems = useMemo(() => {
    return timelineItems.filter(item => {
      const matchesSearch = item.project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.project.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [timelineItems, searchQuery]);

  return (
    <>
        {/* 主内容区域 */}
        <div className="relative z-10 container mx-auto p-6 space-y-6 pt-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="flex items-center gap-2">
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
