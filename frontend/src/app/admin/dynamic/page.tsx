'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import { DynamicTagManager, type DynamicTagItem } from '@/components/admin/dynamic/DynamicTagManager';
import { DynamicTypeSelector, type DynamicTypeOption } from '@/components/admin/dynamic/DynamicTypeSelector';
import { DynamicImageManager, type DynamicImageAsset } from '@/components/admin/dynamic/DynamicImageManager';
import { useAuthStore } from '@/store/useAuthStore';
import { useShallow } from 'zustand/react/shallow';
import {
  createTimeline,
  fetchProject,
  fetchProjects,
  fetchSettings,
  updateSettings,
  uploadImage,
} from '@/lib/api';
import { AlertCircle, Calendar, CheckCircle2, Clock, RefreshCcw, Save, Send } from 'lucide-react';

interface ProjectOption {
  id: string;
  name: string;
  description?: string;
}

interface DynamicFormState {
  publishDate: string;
  projectId: string;
  description: string;
  type: DynamicTypeOption | null;
  tags: DynamicTagItem[];
  details: string;
  images: DynamicImageAsset[];
  codeUrl: string;
  demoUrl: string;
  mobileUrl: string;
  demoLeftMarkdown: string;
  demoRightMarkdown: string;
}

const DRAFT_STORAGE_KEY = 'panelshow-admin-dynamic-draft';

const createInitialFormState = (): DynamicFormState => ({
  publishDate: new Date().toISOString().slice(0, 10),
  projectId: '',
  description: '',
  type: null,
  tags: [],
  details: '',
  images: [],
  codeUrl: '',
  demoUrl: '',
  mobileUrl: '',
  demoLeftMarkdown: '',
  demoRightMarkdown: '',
});

const DYNAMIC_SETTINGS_KEYS = {
  types: 'dynamicTypes',
  tags: 'dynamicTags',
} as const;

const DEFAULT_DYNAMIC_TYPES: DynamicTypeOption[] = [
  { id: 'feature', label: '新功能', color: '#22c55e' },
  { id: 'refactor', label: '重构', color: '#6366f1' },
];

const DEFAULT_DYNAMIC_TAGS: DynamicTagItem[] = [
  { id: 'code-update', label: '代码更新', icon: 'code2' },
  { id: 'performance', label: '性能优化', icon: 'flame' },
  { id: 'bugfix', label: '问题修复', icon: 'bug' },
];

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createUniqueId = (label: string, existing: string[], fallbackPrefix: string) => {
  const base = slugify(label) || `${fallbackPrefix}-${Date.now()}`;
  let candidate = base;
  let counter = 1;
  while (!candidate || existing.includes(candidate)) {
    candidate = `${base}-${counter++}`;
  }
  return candidate;
};

const getStatusCode = (error: unknown): number | null => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as Record<string, unknown>).status;
    if (typeof status === 'number') {
      return status;
    }
  }
  return null;
};

const normalizeTypeOptions = (data: unknown): DynamicTypeOption[] => {
  if (!Array.isArray(data)) {
    return DEFAULT_DYNAMIC_TYPES;
  }

  const seen = new Set<string>();
  const normalized: DynamicTypeOption[] = [];

  data.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) return;
    const record = item as Record<string, unknown>;
    const rawLabel = record.label ?? record.name;
    const label = typeof rawLabel === 'string' ? rawLabel.trim() : '';
    if (!label) return;

    const color = typeof record.color === 'string' ? record.color : '#6366f1';
    const providedId = typeof record.id === 'string' ? record.id.trim() : '';
    const baseId = providedId || slugify(label) || `type-${index + 1}`;
    let uniqueId = baseId;
    let counter = 1;
    while (!uniqueId || seen.has(uniqueId)) {
      uniqueId = `${baseId}-${counter++}`;
    }
    seen.add(uniqueId);

    normalized.push({ id: uniqueId, label, color });
  });

  return normalized.length > 0 ? normalized : DEFAULT_DYNAMIC_TYPES;
};

const ALLOWED_TAG_ICONS = new Set([
  'code2',
  'sparkles',
  'rocket',
  'lightbulb',
  'star',
  'gitbranch',
  'wrench',
  'bug',
  'shield',
  'flame',
  'brush',
  'wand',
  'cpu',
  'layers',
  'globe',
  'linechart',
  'box',
]);

const normalizeTagOptions = (data: unknown): DynamicTagItem[] => {
  if (!Array.isArray(data)) {
    return DEFAULT_DYNAMIC_TAGS;
  }

  const seen = new Set<string>();
  const normalized: DynamicTagItem[] = [];

  data.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) return;
    const record = item as Record<string, unknown>;
    const rawLabel = record.label ?? record.name;
    const label = typeof rawLabel === 'string' ? rawLabel.trim() : '';
    if (!label) return;

    const icon = typeof record.icon === 'string' && ALLOWED_TAG_ICONS.has(record.icon)
      ? (record.icon as DynamicTagItem['icon'])
      : 'code2';

    const providedId = typeof record.id === 'string' ? record.id.trim() : '';
    const baseId = providedId || slugify(label) || `tag-${index + 1}`;
    let uniqueId = baseId;
    let counter = 1;
    while (!uniqueId || seen.has(uniqueId)) {
      uniqueId = `${baseId}-${counter++}`;
    }
    seen.add(uniqueId);

    normalized.push({ id: uniqueId, label, icon });
  });

  return normalized.length > 0 ? normalized : DEFAULT_DYNAMIC_TAGS;
};

const normalizeProjectOption = (value: unknown, index: number): ProjectOption | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const rawId = record.id ?? record.slug ?? record.uid ?? index;
  const rawName = record.name ?? record.title ?? record.project_name ?? record.label;

  const id = typeof rawId === 'string' ? rawId : typeof rawId === 'number' ? String(rawId) : '';
  const name = typeof rawName === 'string' ? rawName : '';
  if (!id || !name) {
    return null;
  }

  const description = typeof record.description === 'string' ? record.description : undefined;
  return { id, name, description };
};

export default function AdminDynamicPage() {
  const { token, user, hydrated } = useAuthStore(
    useShallow((state) => ({ token: state.token, user: state.user, hydrated: state.hydrated }))
  );
  const boundUsername = user?.bound_username ?? null;

  const [formState, setFormState] = useState<DynamicFormState>(() => createInitialFormState());
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typeOptions, setTypeOptions] = useState<DynamicTypeOption[]>(DEFAULT_DYNAMIC_TYPES);
  const [tagLibrary, setTagLibrary] = useState<DynamicTagItem[]>(DEFAULT_DYNAMIC_TAGS);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [typeSaving, setTypeSaving] = useState(false);
  const [tagSaving, setTagSaving] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [projectDetail, setProjectDetail] = useState<Record<string, unknown> | null>(null);
  const [projectDetailLoading, setProjectDetailLoading] = useState(false);

  const isProjectSelectionDisabled = useMemo(() => !token || !boundUsername, [token, boundUsername]);

  const loadProjects = useCallback(async () => {
    if (!token || !boundUsername) {
      setProjectOptions([]);
      setProjectError('请先绑定用户名并登录以加载项目列表。');
      return;
    }

    setProjectLoading(true);
    setProjectError(null);
    try {
      const response = await fetchProjects(boundUsername, token);
      const rawList = Array.isArray(response?.data) ? response.data : [];
      const normalized = rawList
        .map((item, index) => normalizeProjectOption(item, index))
        .filter((item): item is ProjectOption => Boolean(item));
      setProjectOptions(normalized);
      if (normalized.length === 0) {
        setProjectError('未找到可用的项目，请先创建项目。');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取项目列表失败，请稍后重试。';
      setProjectError(message);
    } finally {
      setProjectLoading(false);
    }
  }, [token, boundUsername]);

  useEffect(() => {
    if (hydrated) {
      void loadProjects();
    }
  }, [hydrated, loadProjects]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!token || !boundUsername) {
      setTypeOptions(DEFAULT_DYNAMIC_TYPES);
      setTagLibrary(DEFAULT_DYNAMIC_TAGS);
      setSettingsError(null);
      setSettingsLoading(false);
      return;
    }

    let cancelled = false;
    const loadSettings = async () => {
      setSettingsLoading(true);
      setSettingsError(null);
      try {
        const [typeResponse, tagResponse] = await Promise.all([
          fetchSettings<DynamicTypeOption[]>(boundUsername, DYNAMIC_SETTINGS_KEYS.types, token).catch((error) => {
            if (getStatusCode(error) === 404) {
              return { success: true, data: DEFAULT_DYNAMIC_TYPES };
            }
            throw error;
          }),
          fetchSettings<DynamicTagItem[]>(boundUsername, DYNAMIC_SETTINGS_KEYS.tags, token).catch((error) => {
            if (getStatusCode(error) === 404) {
              return { success: true, data: DEFAULT_DYNAMIC_TAGS };
            }
            throw error;
          }),
        ]);

        if (cancelled) return;

        setTypeOptions(normalizeTypeOptions(typeResponse?.data));
        setTagLibrary(normalizeTagOptions(tagResponse?.data));
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : '加载动态设置失败，请稍后重试。';
        setSettingsError(message);
        setTypeOptions(DEFAULT_DYNAMIC_TYPES);
        setTagLibrary(DEFAULT_DYNAMIC_TAGS);
      } finally {
        if (!cancelled) {
          setSettingsLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, [hydrated, token, boundUsername]);

  useEffect(() => {
    if (!formState.projectId || !token || !boundUsername) {
      setProjectDetail(null);
      setProjectDetailLoading(false);
      return;
    }

    let cancelled = false;
    setProjectDetailLoading(true);

    void fetchProject<Record<string, unknown>>(boundUsername, formState.projectId, token)
      .then((response) => {
        if (!cancelled) {
          setProjectDetail(response.data ?? null);
        }
      })
      .catch((error) => {
        console.warn('加载项目详情失败', error);
        if (!cancelled) {
          setProjectDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setProjectDetailLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [formState.projectId, token, boundUsername]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<DynamicFormState> & { savedAt?: string };
      const shouldRestore = window.confirm('检测到本地草稿，是否恢复？');
      if (!shouldRestore) return;
      setFormState((prev) => ({
        ...prev,
        ...parsed,
        images: [],
      }));
    } catch (error) {
      console.warn('恢复草稿失败', error);
    }
  }, []);

  useEffect(() => {
    return () => {
      formState.images.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [formState.images]);

  const updateFormState = <K extends keyof DynamicFormState>(key: K, value: DynamicFormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateDynamicType = async ({ label, color }: { label: string; color: string }) => {
    if (!token || !boundUsername) {
      throw new Error('请先登录并绑定用户名后再新增类型。');
    }

    const normalizedLabel = label.trim();
    const normalizedLabelLower = normalizedLabel.toLowerCase();
    if (typeOptions.some((option) => option.label.toLowerCase() === normalizedLabelLower)) {
      throw new Error('该类型已存在，请直接选择。');
    }

    const newId = createUniqueId(normalizedLabel, typeOptions.map((option) => option.id), 'type');
    const newType: DynamicTypeOption = { id: newId, label: normalizedLabel, color };
    const updated = [...typeOptions, newType];

    setTypeSaving(true);
    try {
      await updateSettings(boundUsername, DYNAMIC_SETTINGS_KEYS.types, updated, token);
      setTypeOptions(updated);
    } catch (error) {
      throw error instanceof Error ? error : new Error('新增动态类型失败，请稍后再试。');
    } finally {
      setTypeSaving(false);
    }

    return newType;
  };

  const handleCreateDynamicTag = async ({
    label,
    icon,
  }: {
    label: string;
    icon: DynamicTagItem['icon'];
  }) => {
    if (!token || !boundUsername) {
      throw new Error('请先登录并绑定用户名后再新增标签。');
    }

    const normalizedLabel = label.trim();
    const normalizedLabelLower = normalizedLabel.toLowerCase();
    if (tagLibrary.some((tag) => tag.label.toLowerCase() === normalizedLabelLower)) {
      throw new Error('该标签已存在，请直接选择。');
    }

    const newId = createUniqueId(normalizedLabel, tagLibrary.map((tag) => tag.id), 'tag');
    const newTag: DynamicTagItem = { id: newId, label: normalizedLabel, icon };
    const updated = [...tagLibrary, newTag];

    setTagSaving(true);
    try {
      await updateSettings(boundUsername, DYNAMIC_SETTINGS_KEYS.tags, updated, token);
      setTagLibrary(updated);
    } catch (error) {
      throw error instanceof Error ? error : new Error('新增动态标签失败，请稍后再试。');
    } finally {
      setTagSaving(false);
    }

    return newTag;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setSubmissionError(null);
    setSubmissionMessage(null);

    if (!token || !boundUsername) {
      setSubmissionError('请先登录并绑定用户名后再发布动态。');
      return;
    }

    if (!formState.projectId) {
      setSubmissionError('请选择动态归属的项目。');
      return;
    }

    if (!formState.type) {
      setSubmissionError('请选择动态类型。');
      return;
    }

    setIsSubmitting(true);

    try {
      const publishDateIso = new Date(`${formState.publishDate}T00:00:00`).toISOString();

      const uploadedImages = await Promise.all(
        formState.images.map(async (image) => {
          const result = await uploadImage(boundUsername, image.file, token, 'timeline');
          return {
            id: image.id,
            url: result.url,
            filename: image.file.name,
            contentType: result.content_type,
            size: result.size,
          };
        })
      );

      const selectedProject = projectOptions.find((option) => option.id === formState.projectId);
      const detail = projectDetail;

      const detailPreviewImages = Array.isArray(detail?.images)
        ? (detail?.images as unknown[])
            .map((item) => {
              if (typeof item === 'string') return item;
              if (typeof item === 'object' && item !== null && 'src' in item) {
                const src = (item as Record<string, unknown>).src;
                return typeof src === 'string' ? src : null;
              }
              return null;
            })
            .filter((item): item is string => Boolean(item))
        : [];

      const previewImages = uploadedImages.map((item) => item.url);
      const combinedPreviewImages = previewImages.length > 0 ? previewImages : detailPreviewImages;

      const projectName =
        (typeof detail?.name === 'string' && detail.name.trim()) || selectedProject?.name || '';

      const projectLogo = typeof detail?.previewImage === 'string' ? detail.previewImage : '';

      const projectDescription =
        formState.description || (typeof detail?.description === 'string' ? detail.description : '');

      const projectReadme =
        formState.details || (typeof detail?.longDescription === 'string' ? detail.longDescription : '');

      const projectTechStack = Array.isArray(detail?.techStacks)
        ? (detail?.techStacks as unknown[])
            .map((item) => (typeof item === 'string' ? item : null))
            .filter((item): item is string => Boolean(item))
        : [];

      const repositoryUrl =
        formState.codeUrl ||
        (typeof detail?.sourceUrl === 'string' ? detail.sourceUrl : undefined) ||
        (typeof detail?.repositoryUrl === 'string' ? detail.repositoryUrl : undefined);

      const liveUrl =
        formState.demoUrl ||
        (typeof detail?.previewUrl === 'string' ? detail.previewUrl : undefined) ||
        (typeof detail?.liveUrl === 'string' ? detail.liveUrl : undefined);

      const mobileUrl =
        formState.mobileUrl ||
        (typeof detail?.mobilePreviewUrl === 'string' ? detail.mobilePreviewUrl : undefined) ||
        (typeof detail?.mobileUrl === 'string' ? detail.mobileUrl : undefined);

      const payload = {
        project_id: formState.projectId,
        publishedAt: publishDateIso,
        author: {
          name: boundUsername,
          avatar: '',
          username: boundUsername,
        },
        project: {
          id: formState.projectId,
          name: projectName,
          logo: projectLogo,
          description: projectDescription,
          techStack: projectTechStack,
          readme: projectReadme,
          previewImages: combinedPreviewImages,
          repositoryUrl: repositoryUrl || undefined,
          liveUrl: liveUrl || undefined,
          mobileUrl: mobileUrl || undefined,
        },
        updateType: formState.type.id,
        updateTypeMeta: formState.type,
        changelog: formState.description,
        tags: formState.tags,
        details: formState.details,
        demoIntroduction: {
          left: formState.demoLeftMarkdown,
          right: formState.demoRightMarkdown,
        },
        links: {
          repository: formState.codeUrl || null,
          demo: formState.demoUrl || null,
          mobile: formState.mobileUrl || null,
        },
        assets: {
          images: uploadedImages,
        },
        likes: 0,
        comments: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
      } as const;

      await createTimeline(boundUsername, payload, token);

      setSubmissionMessage('动态已成功发布！');
      formState.images.forEach((image) => URL.revokeObjectURL(image.preview));
      setFormState(createInitialFormState());
      setProjectDetail(null);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '提交失败，请稍后重试。';
      setSubmissionError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    if (typeof window === 'undefined') return;
    try {
      const draft = {
        publishDate: formState.publishDate,
        projectId: formState.projectId,
        description: formState.description,
        type: formState.type,
        tags: formState.tags,
        details: formState.details,
        codeUrl: formState.codeUrl,
        demoUrl: formState.demoUrl,
        mobileUrl: formState.mobileUrl,
        demoLeftMarkdown: formState.demoLeftMarkdown,
        demoRightMarkdown: formState.demoRightMarkdown,
        savedAt: new Date().toISOString(),
      } satisfies Partial<DynamicFormState> & { savedAt: string };
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      alert('草稿已保存到本地浏览器。');
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存草稿失败，请稍后再试。';
      alert(message);
    }
  };

  return (
    <div className="container relative z-10 mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-1">
        <p className="text-sm font-medium text-primary/80">发布动态</p>
        <h1 className="text-3xl font-semibold tracking-tight">项目动态发布中心</h1>
        <p className="text-muted-foreground">
          记录项目的每一次重要更新，支持类型、标签、图文与链接的完整配置。
        </p>
      </header>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {settingsLoading && (
          <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            正在加载动态配置，请稍候...
          </div>
        )}

        {settingsError && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <span>{settingsError}</span>
          </div>
        )}

        {submissionError && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <span>{submissionError}</span>
          </div>
        )}

        {submissionMessage && (
          <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4" />
            <span>{submissionMessage}</span>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="h-5 w-5 text-primary" />
              发布信息
            </CardTitle>
            <CardDescription>设置动态的时间、归属项目和简要描述。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="publishDate" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  发布时间
                </Label>
                <Input
                  id="publishDate"
                  type="date"
                  value={formState.publishDate}
                  onChange={(event) => updateFormState('publishDate', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectId" className="text-sm font-medium text-muted-foreground">
                  项目归属
                </Label>
                <div className="flex gap-2">
                  <select
                    id="projectId"
                    value={formState.projectId}
                    onChange={(event) => updateFormState('projectId', event.target.value)}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={isProjectSelectionDisabled || projectLoading}
                  >
                    <option value="" disabled>
                      {projectLoading ? '正在加载项目...' : '请选择归属项目'}
                    </option>
                    {projectOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => void loadProjects()}
                    disabled={projectLoading || isProjectSelectionDisabled}
                    title="刷新项目列表"
                  >
                    <RefreshCcw className={`h-4 w-4 ${projectLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                {projectError && (
                  <p className="text-xs text-destructive">{projectError}</p>
                )}
                {projectDetailLoading && !projectError && (
                  <p className="text-xs text-muted-foreground">正在加载项目详情...</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-muted-foreground">
                动态描述
              </Label>
              <Textarea
                id="description"
                placeholder="简要说明本次动态的核心内容..."
                value={formState.description}
                onChange={(event) => updateFormState('description', event.target.value)}
                rows={3}
              />
            </div>

            <DynamicTypeSelector
              value={formState.type}
              onChange={(value) => updateFormState('type', value)}
              options={typeOptions}
              onCreate={handleCreateDynamicType}
              disabled={!token || !boundUsername}
              isLoading={settingsLoading}
              isSaving={typeSaving}
            />

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">动态标签</Label>
              <DynamicTagManager
                tags={formState.tags}
                onChange={(tags) => updateFormState('tags', tags)}
                availableTags={tagLibrary}
                onCreateTag={handleCreateDynamicTag}
                disabled={!token || !boundUsername}
                isSaving={tagSaving}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">动态详情</CardTitle>
            <CardDescription>使用 Markdown 编辑器撰写完整的更新说明。</CardDescription>
          </CardHeader>
          <CardContent>
            <MarkdownEditor
              value={formState.details}
              onChange={(value) => updateFormState('details', value)}
              placeholder="使用 Markdown 描述此次动态的详细内容、亮点、注意事项等..."
            />
          </CardContent>
        </Card>

        <DynamicImageManager images={formState.images} onChange={(images) => updateFormState('images', images)} />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">相关链接与说明</CardTitle>
            <CardDescription>补充代码仓库、演示地址及更详细的介绍。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="codeUrl">代码地址</Label>
                <Input
                  id="codeUrl"
                  type="url"
                  placeholder="https://github.com/your/repository"
                  value={formState.codeUrl}
                  onChange={(event) => updateFormState('codeUrl', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demoUrl">演示地址</Label>
                <Input
                  id="demoUrl"
                  type="url"
                  placeholder="https://demo.example.com"
                  value={formState.demoUrl}
                  onChange={(event) => updateFormState('demoUrl', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileUrl">移动端地址</Label>
                <Input
                  id="mobileUrl"
                  type="url"
                  placeholder="https://m.example.com"
                  value={formState.mobileUrl}
                  onChange={(event) => updateFormState('mobileUrl', event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="demoLeftMarkdown">演示介绍左侧栏 (Markdown)</Label>
                <Textarea
                  id="demoLeftMarkdown"
                  className="min-h-[180px] font-mono text-sm"
                  placeholder="填写演示页左侧栏的说明内容..."
                  value={formState.demoLeftMarkdown}
                  onChange={(event) => updateFormState('demoLeftMarkdown', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demoRightMarkdown">演示介绍右侧栏 (Markdown)</Label>
                <Textarea
                  id="demoRightMarkdown"
                  className="min-h-[180px] font-mono text-sm"
                  placeholder="填写演示页右侧栏的说明内容..."
                  value={formState.demoRightMarkdown}
                  onChange={(event) => updateFormState('demoRightMarkdown', event.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleSaveDraft}>
            <Save className="mr-2 h-4 w-4" />
            保存草稿
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Send className="mr-2 h-4 w-4" />
            发布动态
          </Button>
        </div>
      </form>
    </div>
  );
}
