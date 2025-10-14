'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  updateTimeline,
  fetchProject,
  fetchProjects,
  fetchTimeline,
  fetchSettings,
  updateSettings,
  uploadImage,
} from '@/lib/api';
import { AlertCircle, Braces, Calendar, Check, Clock, RefreshCcw, Save, Send } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StatusToast, type StatusToastState } from '@/components/admin/settings/StatusToast';

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

const pad = (value: number) => value.toString().padStart(2, '0');

const toDatetimeLocalValue = (input: Date | string) => {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const createInitialFormState = (): DynamicFormState => ({
  publishDate: toDatetimeLocalValue(new Date()),
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { token, user, hydrated } = useAuthStore(
    useShallow((state) => ({ token: state.token, user: state.user, hydrated: state.hydrated }))
  );
  const boundUsername = user?.bound_username ?? null;
  const timelineId = searchParams.get('id');
  const isEditMode = Boolean(timelineId);

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
  const [projectDetail, setProjectDetail] = useState<Record<string, unknown> | null>(null);
  const [projectDetailLoading, setProjectDetailLoading] = useState(false);
  const [statusToast, setStatusToast] = useState<StatusToastState | null>(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [timelineRecord, setTimelineRecord] = useState<Record<string, unknown> | null>(null);
  const hasPrefilledTimelineRef = useRef(false);
  const [jsonEditorValue, setJsonEditorValue] = useState(() => JSON.stringify(createInitialFormState(), null, 2));
  const [jsonEditorDirty, setJsonEditorDirty] = useState(false);
  const [jsonEditorError, setJsonEditorError] = useState<string | null>(null);

  const isProjectSelectionDisabled = useMemo(() => !token || !boundUsername, [token, boundUsername]);

  const resolveTypeOptionFromInput = useCallback(
    (value: unknown): DynamicTypeOption | null => {
      if (!value) return null;
      const fallbackColor = '#6366f1';
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;
        return (
          typeOptions.find((option) => option.id === trimmed || option.label === trimmed) ?? {
            id: trimmed,
            label: trimmed,
            color: fallbackColor,
          }
        );
      }

      if (isRecord(value)) {
        const id = typeof value.id === 'string' ? value.id : undefined;
        const label = typeof value.label === 'string'
          ? value.label
          : typeof value.name === 'string'
            ? value.name
            : '';
        const color = typeof value.color === 'string' ? value.color : fallbackColor;

        if (id) {
          const matched = typeOptions.find((option) => option.id === id);
          if (matched) {
            return matched;
          }
        }

        if (label) {
          const matched = typeOptions.find((option) => option.label === label);
          if (matched) {
            return matched;
          }
        }

        if (!label && !id) {
          return null;
        }

        const baseId = id ?? createUniqueId(label || 'type', typeOptions.map((option) => option.id), 'type');
        return {
          id: baseId,
          label: label || baseId,
          color,
        };
      }

      return null;
    },
    [typeOptions]
  );

  const resolveTagListFromInput = useCallback(
    (value: unknown): DynamicTagItem[] => {
      const usedIds = new Set(tagLibrary.map((tag) => tag.id));

      const normalize = (input: unknown, index: number): DynamicTagItem | null => {
        if (typeof input === 'string') {
          const trimmed = input.trim();
          if (!trimmed) {
            return null;
          }
          const matched = tagLibrary.find((tag) => tag.id === trimmed || tag.label === trimmed);
          if (matched) {
            return matched;
          }
          const newId = createUniqueId(trimmed, Array.from(usedIds), 'tag');
          usedIds.add(newId);
          return { id: newId, label: trimmed, icon: 'code2' };
        }

        if (isRecord(input)) {
          const id = typeof input.id === 'string' ? input.id : undefined;
          const label = typeof input.label === 'string'
            ? input.label
            : typeof input.name === 'string'
              ? input.name
              : '';
          const icon = typeof input.icon === 'string' && ALLOWED_TAG_ICONS.has(input.icon)
            ? (input.icon as DynamicTagItem['icon'])
            : 'code2';

          if (id) {
            const matched = tagLibrary.find((tag) => tag.id === id);
            if (matched) {
              return matched;
            }
          }

          if (label) {
            const matched = tagLibrary.find((tag) => tag.label === label);
            if (matched) {
              return matched;
            }
          }

          const baseId = id ?? createUniqueId(label || `tag-${index}`, Array.from(usedIds), 'tag');
          usedIds.add(baseId);
          return {
            id: baseId,
            label: label || baseId,
            icon,
          };
        }

        return null;
      };

      if (Array.isArray(value)) {
        return value
          .map((item, index) => normalize(item, index))
          .filter((item): item is DynamicTagItem => Boolean(item));
      }

      const single = normalize(value, 0);
      return single ? [single] : [];
    },
    [tagLibrary]
  );

  const resolveImagesFromInput = useCallback((value: unknown): DynamicImageAsset[] => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item, index): DynamicImageAsset | null => {
        if (typeof item === 'string') {
          const url = item.trim();
          if (!url) {
            return null;
          }
          return {
            id: `json-image-${index}`,
            file: null,
            preview: url,
            source: 'remote' as const,
            metadata: { url },
          } satisfies DynamicImageAsset;
        }

        if (isRecord(item)) {
          const rawUrl =
            typeof item.url === 'string'
              ? item.url
              : typeof item.preview === 'string'
                ? item.preview
                : typeof item.src === 'string'
                  ? item.src
                  : '';
          if (!rawUrl) {
            return null;
          }
          const identifier = typeof item.id === 'string' ? item.id : `json-image-${index}`;
          return {
            id: identifier,
            file: null,
            preview: rawUrl,
            source: 'remote' as const,
            metadata: {
              url: rawUrl,
              filename: typeof item.filename === 'string' ? item.filename : null,
              contentType: typeof item.contentType === 'string' ? item.contentType : null,
              size:
                typeof item.size === 'number' && Number.isFinite(item.size)
                  ? item.size
                  : null,
            },
          } satisfies DynamicImageAsset;
        }

        return null;
      })
      .filter((asset): asset is DynamicImageAsset => Boolean(asset));
  }, []);

  const buildJsonFromFormState = useCallback((state: DynamicFormState) => ({
    publishDate: state.publishDate,
    projectId: state.projectId,
    description: state.description,
    type: state.type,
    tags: state.tags,
    details: state.details,
    images: state.images.map((image) => ({
      id: image.id,
      source: image.source,
      preview: image.preview,
      metadata: image.metadata,
    })),
    codeUrl: state.codeUrl,
    demoUrl: state.demoUrl,
    mobileUrl: state.mobileUrl,
    demoLeftMarkdown: state.demoLeftMarkdown,
    demoRightMarkdown: state.demoRightMarkdown,
    demoIntroduction: {
      left: state.demoLeftMarkdown,
      right: state.demoRightMarkdown,
    },
  }), []);

  const mapJsonToDynamicFormState = useCallback(
    (record: Record<string, unknown>, previous: DynamicFormState): DynamicFormState => {
      const publishValue =
        typeof record.publishDate === 'string'
          ? record.publishDate
          : typeof record.publishedAt === 'string'
            ? record.publishedAt
            : previous.publishDate;
      const projectIdValue =
        typeof record.projectId === 'string'
          ? record.projectId
          : typeof record.project_id === 'string'
            ? record.project_id
            : previous.projectId;
      const descriptionValue =
        typeof record.description === 'string'
          ? record.description
          : typeof record.changelog === 'string'
            ? record.changelog
            : previous.description;
      const detailsValue = typeof record.details === 'string' ? record.details : previous.details;
      const codeUrlValue =
        typeof record.codeUrl === 'string'
          ? record.codeUrl
          : typeof record.repositoryUrl === 'string'
            ? record.repositoryUrl
            : previous.codeUrl;
      const demoUrlValue =
        typeof record.demoUrl === 'string'
          ? record.demoUrl
          : typeof record.liveUrl === 'string'
            ? record.liveUrl
            : previous.demoUrl;
      const mobileUrlValue =
        typeof record.mobileUrl === 'string'
          ? record.mobileUrl
          : typeof record.mobilePreviewUrl === 'string'
            ? record.mobilePreviewUrl
            : previous.mobileUrl;

      const typeValue =
        resolveTypeOptionFromInput(record.type ?? record.updateType ?? previous.type) ??
        previous.type ??
        (typeOptions[0] ?? null);

      const tagsValue = resolveTagListFromInput(record.tags ?? record.labels ?? record.tagIds ?? previous.tags);
      const imagesValue = resolveImagesFromInput(record.images ?? record.previewImages ?? record.assets ?? []);

      const demoIntroductionRecord = isRecord(record.demoIntroduction) ? record.demoIntroduction : null;
      const demoLeftValue =
        typeof record.demoLeftMarkdown === 'string'
          ? record.demoLeftMarkdown
          : demoIntroductionRecord && typeof demoIntroductionRecord.left === 'string'
            ? (demoIntroductionRecord.left as string)
            : previous.demoLeftMarkdown;
      const demoRightValue =
        typeof record.demoRightMarkdown === 'string'
          ? record.demoRightMarkdown
          : demoIntroductionRecord && typeof demoIntroductionRecord.right === 'string'
            ? (demoIntroductionRecord.right as string)
            : previous.demoRightMarkdown;

      return {
        ...previous,
        publishDate: toDatetimeLocalValue(publishValue),
        projectId: projectIdValue,
        description: descriptionValue,
        type: typeValue,
        tags: tagsValue,
        details: detailsValue,
        images: imagesValue,
        codeUrl: codeUrlValue,
        demoUrl: demoUrlValue,
        mobileUrl: mobileUrlValue,
        demoLeftMarkdown: demoLeftValue,
        demoRightMarkdown: demoRightValue,
      };
    },
    [resolveImagesFromInput, resolveTagListFromInput, resolveTypeOptionFromInput, typeOptions]
  );

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
    if (!isEditMode) {
      setTimelineRecord(null);
      setTimelineError(null);
      setTimelineLoading(false);
      hasPrefilledTimelineRef.current = false;
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    if (!timelineId) {
      setTimelineError('未提供要编辑的动态ID。');
      return;
    }

    if (!token || !boundUsername) {
      setTimelineError('请先登录并绑定用户名后再编辑动态。');
      return;
    }

    let cancelled = false;
    setTimelineLoading(true);
    setTimelineError(null);

    void fetchTimeline(boundUsername, token)
      .then((response) => {
        if (cancelled) return;
        const list = Array.isArray(response?.data) ? response.data : [];
        const match = list.find((item) => isRecord(item) && item.id === timelineId);
        if (!match || !isRecord(match)) {
          setTimelineError('未找到对应的动态记录。');
          setTimelineRecord(null);
          return;
        }
        setTimelineRecord(match);
        hasPrefilledTimelineRef.current = false;
      })
      .catch((error) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : '加载动态信息失败，请稍后重试。';
        setTimelineError(message);
        setTimelineRecord(null);
      })
      .finally(() => {
        if (!cancelled) {
          setTimelineLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isEditMode, timelineId, token, boundUsername]);

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
    if (!isEditMode || !timelineRecord || hasPrefilledTimelineRef.current) {
      return;
    }

    const record = timelineRecord;
    const projectData = isRecord(record.project) ? (record.project as Record<string, unknown>) : null;
    const publishDateRaw =
      typeof record.publishedAt === 'string'
        ? record.publishedAt
        : typeof record.published_at === 'string'
          ? record.published_at
          : typeof record.date === 'string'
            ? record.date
            : '';
    const projectIdFromRecord =
      typeof record.project_id === 'string'
        ? record.project_id
        : typeof record.projectId === 'string'
          ? record.projectId
          : projectData && typeof projectData.id === 'string'
            ? (projectData.id as string)
            : '';

    const updateTypeMeta = isRecord(record.updateTypeMeta) ? (record.updateTypeMeta as Record<string, unknown>) : null;
    const updateTypeId =
      typeof record.updateType === 'string'
        ? record.updateType
        : updateTypeMeta && typeof updateTypeMeta.id === 'string'
          ? (updateTypeMeta.id as string)
          : '';

    let resolvedType: DynamicTypeOption | null = null;
    if (updateTypeId) {
      resolvedType = typeOptions.find((option) => option.id === updateTypeId) ?? null;
    }

    if (!resolvedType && updateTypeMeta) {
      const label = typeof updateTypeMeta.label === 'string' ? updateTypeMeta.label : updateTypeId || '动态类型';
      const color = typeof updateTypeMeta.color === 'string' ? updateTypeMeta.color : '#6366f1';
      const metaId = typeof updateTypeMeta.id === 'string' ? updateTypeMeta.id : updateTypeId;
      if (metaId) {
        resolvedType = { id: metaId, label, color };
        setTypeOptions((prev) => (prev.some((option) => option.id === metaId) ? prev : [...prev, resolvedType!]));
      }
    } else if (!resolvedType && updateTypeId) {
      const fallbackType: DynamicTypeOption = {
        id: updateTypeId,
        label: updateTypeId,
        color: '#6366f1',
      };
      resolvedType = fallbackType;
      setTypeOptions((prev) => (prev.some((option) => option.id === fallbackType.id) ? prev : [...prev, fallbackType]));
    }

    const resolvedTags: DynamicTagItem[] = [];
    if (Array.isArray(record.tags)) {
      record.tags.forEach((item, index) => {
        if (!isRecord(item)) return;
        const labelSource =
          typeof item.label === 'string'
            ? item.label
            : typeof item.name === 'string'
              ? item.name
              : `标签${index + 1}`;
        const normalizedLabel = labelSource.trim();
        if (!normalizedLabel) return;
        const idSource =
          typeof item.id === 'string'
            ? item.id
            : createUniqueId(normalizedLabel, resolvedTags.map((tag) => tag.id), `tag-${index + 1}`);
        const iconSource =
          typeof item.icon === 'string' && ALLOWED_TAG_ICONS.has(item.icon.toLowerCase())
            ? (item.icon.toLowerCase() as DynamicTagItem['icon'])
            : 'code2';
        if (!resolvedTags.some((tag) => tag.id === idSource)) {
          resolvedTags.push({ id: idSource, label: normalizedLabel, icon: iconSource });
        }
      });
    }

    if (resolvedTags.length > 0) {
      setTagLibrary((prev) => {
        const next = [...prev];
        resolvedTags.forEach((tag) => {
          if (!next.some((item) => item.id === tag.id)) {
            next.push(tag);
          }
        });
        return next;
      });
    }

    const linksRecord = isRecord(record.links) ? (record.links as Record<string, unknown>) : null;
    const demoIntroductionRecord = isRecord(record.demoIntroduction)
      ? (record.demoIntroduction as Record<string, unknown>)
      : null;
    const assetsRecord = isRecord(record.assets) ? (record.assets as Record<string, unknown>) : null;
    const assetImagesRaw = assetsRecord && Array.isArray(assetsRecord.images) ? assetsRecord.images : [];

    const resolvedImages: DynamicImageAsset[] = [];
    assetImagesRaw.forEach((item, index) => {
      if (!isRecord(item)) return;
      const url = typeof item.url === 'string' ? item.url : typeof item.src === 'string' ? item.src : null;
      if (!url) return;
      const id = typeof item.id === 'string' ? item.id : `remote-${index}`;
      const filename = typeof item.filename === 'string' ? item.filename : undefined;
      const contentType = typeof item.contentType === 'string' ? item.contentType : undefined;
      const size = typeof item.size === 'number' ? item.size : undefined;
      resolvedImages.push({
        id,
        file: null,
        preview: url,
        source: 'remote',
        metadata: {
          url,
          filename,
          contentType,
          size,
        },
      });
    });

    if (resolvedImages.length === 0 && projectData && Array.isArray(projectData.previewImages)) {
      (projectData.previewImages as unknown[])
        .filter((item): item is string => typeof item === 'string')
        .forEach((url, index) => {
          resolvedImages.push({
            id: `project-image-${index}`,
            file: null,
            preview: url,
            source: 'remote',
            metadata: { url },
          });
        });
    }

    hasPrefilledTimelineRef.current = true;
    setFormState((prev) => {
      prev.images.forEach((image) => {
        if (image.source === 'local' && image.file) {
          URL.revokeObjectURL(image.preview);
        }
      });

      return {
        ...prev,
        publishDate: publishDateRaw ? toDatetimeLocalValue(publishDateRaw) : prev.publishDate,
        projectId: projectIdFromRecord || prev.projectId,
        description:
          typeof record.changelog === 'string'
            ? record.changelog
            : typeof record.content === 'string'
              ? record.content
              : prev.description,
        type: resolvedType,
        tags: resolvedTags,
        details:
          typeof record.details === 'string'
            ? record.details
            : projectData && typeof projectData.readme === 'string'
              ? (projectData.readme as string)
              : prev.details,
        images: resolvedImages,
        codeUrl:
          (linksRecord && typeof linksRecord.repository === 'string'
            ? (linksRecord.repository as string)
            : projectData && typeof projectData.repositoryUrl === 'string'
              ? (projectData.repositoryUrl as string)
              : prev.codeUrl) || '',
        demoUrl:
          (linksRecord && typeof linksRecord.demo === 'string'
            ? (linksRecord.demo as string)
            : projectData && typeof projectData.liveUrl === 'string'
              ? (projectData.liveUrl as string)
              : prev.demoUrl) || '',
        mobileUrl:
          (linksRecord && typeof linksRecord.mobile === 'string'
            ? (linksRecord.mobile as string)
            : projectData && typeof projectData.mobileUrl === 'string'
              ? (projectData.mobileUrl as string)
              : prev.mobileUrl) || '',
        demoLeftMarkdown:
          (demoIntroductionRecord && typeof demoIntroductionRecord.left === 'string'
            ? (demoIntroductionRecord.left as string)
            : prev.demoLeftMarkdown) || '',
        demoRightMarkdown:
          (demoIntroductionRecord && typeof demoIntroductionRecord.right === 'string'
            ? (demoIntroductionRecord.right as string)
            : prev.demoRightMarkdown) || '',
      };
    });
  }, [isEditMode, timelineRecord, typeOptions, setFormState]);

  useEffect(() => {
    if (typeof window === 'undefined' || isEditMode) return;
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
  }, [isEditMode]);

  useEffect(() => {
    return () => {
      formState.images.forEach((image) => {
        if (image.source === 'local' && image.file) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [formState.images]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (jsonEditorDirty) {
      return;
    }

    const nextJson = JSON.stringify(buildJsonFromFormState(formState), null, 2);
    setJsonEditorValue(nextJson);
    setJsonEditorError(null);
  }, [buildJsonFromFormState, formState, jsonEditorDirty]);

  const updateFormState = <K extends keyof DynamicFormState>(key: K, value: DynamicFormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleJsonEditorChange = (value: string) => {
    setJsonEditorValue(value);
    setJsonEditorDirty(true);
    if (jsonEditorError) {
      setJsonEditorError(null);
    }
  };

  const handleRefreshJson = () => {
    const nextJson = JSON.stringify(buildJsonFromFormState(formState), null, 2);
    setJsonEditorValue(nextJson);
    setJsonEditorDirty(false);
    setJsonEditorError(null);
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonEditorValue) as unknown;
      if (!isRecord(parsed)) {
        throw new Error('JSON 结构必须是对象。');
      }

      setFormState((previous) => {
        previous.images.forEach((image) => {
          if (image.source === 'local' && image.file) {
            URL.revokeObjectURL(image.preview);
          }
        });

        return mapJsonToDynamicFormState(parsed, previous);
      });

      setJsonEditorDirty(false);
      setJsonEditorError(null);
    } catch (error) {
      const message =
        error instanceof Error ? `解析 JSON 失败：${error.message}` : '解析 JSON 失败，请检查格式。';
      setJsonEditorError(message);
    }
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

    if (!token || !boundUsername) {
      setStatusToast({ type: 'error', message: '请先登录并绑定用户名后再发布动态。' });
      return;
    }

    if (!formState.projectId) {
      setStatusToast({ type: 'error', message: '请选择动态归属的项目。' });
      return;
    }

    if (!formState.type) {
      setStatusToast({ type: 'error', message: '请选择动态类型。' });
      return;
    }

    setIsSubmitting(true);

    try {
      const publishDate = new Date(formState.publishDate);
      if (Number.isNaN(publishDate.getTime())) {
        throw new Error('请选择有效的发布时间。');
      }
      const publishDateIso = publishDate.toISOString();

      const localUploads = formState.images.filter((image) => image.source === 'local' && image.file);
      const uploadedImages = await Promise.all(
        localUploads.map(async (image) => {
          if (!image.file) {
            throw new Error('选择的本地图片无效，请重新上传。');
          }
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

      const persistedImages = formState.images
        .filter((image) => image.source === 'remote')
        .map((image) => ({
          id: image.id,
          url: image.metadata?.url ?? image.preview,
          filename: image.metadata?.filename ?? null,
          contentType: image.metadata?.contentType ?? null,
          size: image.metadata?.size ?? null,
        }));

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

      const existingPreviewImages = persistedImages
        .map((item) => item.url)
        .filter((url): url is string => Boolean(url));
      const uploadedPreviewImages = uploadedImages.map((item) => item.url);
      const previewImages = [...existingPreviewImages, ...uploadedPreviewImages];
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

      const payload: Record<string, unknown> = {
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
          images: [...persistedImages, ...uploadedImages],
        },
      };

      if (isEditMode) {
        payload.updatedAt = new Date().toISOString();
      } else {
        payload.createdAt = new Date().toISOString();
      }

      if (isEditMode && timelineId) {
        await updateTimeline(boundUsername, timelineId, payload, token);
      } else {
        await createTimeline(boundUsername, payload, token);
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      }

      formState.images.forEach((image) => {
        if (image.source === 'local' && image.file) {
          URL.revokeObjectURL(image.preview);
        }
      });

      const nextImagesForState: DynamicImageAsset[] = [...persistedImages, ...uploadedImages]
        .filter((asset) => typeof asset.url === 'string' && asset.url)
        .map((asset, index) => ({
          id: typeof asset.id === 'string' && asset.id ? asset.id : `remote-${index}`,
          file: null,
          preview: asset.url as string,
          source: 'remote',
          metadata: {
            url: asset.url as string,
            filename: asset.filename ?? null,
            contentType: asset.contentType ?? null,
            size: asset.size ?? null,
          },
        }));

      if (isEditMode) {
        setFormState((prev) => ({
          ...prev,
          images: nextImagesForState,
        }));
        setStatusToast({ type: 'success', message: '动态更新成功！' });
      } else {
        setStatusToast({ type: 'success', message: '动态已成功发布！' });
        setFormState(createInitialFormState());
        setProjectDetail(null);
      }

      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/admin');
      }, 1200);
    } catch (error) {
      const message = error instanceof Error ? error.message : '提交失败，请稍后重试。';
      setStatusToast({ type: 'error', message });
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
      setStatusToast({ type: 'success', message: '草稿已保存到本地浏览器。' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存草稿失败，请稍后再试。';
      setStatusToast({ type: 'error', message });
    }
  };

  const pageTitle = isEditMode ? '编辑项目动态' : '项目动态发布中心';
  const pageSubtitle = isEditMode
    ? '加载并更新已发布的动态内容，保存后将覆盖原有信息。'
    : '记录项目的每一次重要更新，支持类型、标签、图文与链接的完整配置。';

  return (
    <div className="container relative z-10 mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-1">
        <p className="text-sm font-medium text-primary/80">发布动态</p>
        <h1 className="text-3xl font-semibold tracking-tight">{pageTitle}</h1>
        <p className="text-muted-foreground">{pageSubtitle}</p>
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

        {timelineLoading && (
          <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            正在加载动态详情...
          </div>
        )}

        {timelineError && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <span>{timelineError}</span>
          </div>
        )}

        <Card className="bg-card shadow-sm">
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
                  type="datetime-local"
                  step={60}
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

        <Card className="bg-card shadow-sm">
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

        <Card className="bg-card shadow-sm">
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

        <Card className="bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Braces className="h-5 w-5 text-primary" />
              JSON 预览与编辑
            </CardTitle>
            <CardDescription>同步或编辑 JSON 数据后可应用至上方表单，也可将表单内容刷新到此处。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {jsonEditorError && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <span>{jsonEditorError}</span>
              </div>
            )}
            <Textarea
              value={jsonEditorValue}
              onChange={(event) => handleJsonEditorChange(event.target.value)}
              className="min-h-[320px] font-mono text-xs"
              spellCheck={false}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{jsonEditorDirty ? 'JSON 已修改，应用前请先预览结果。' : 'JSON 与当前表单内容保持同步。'}</span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleRefreshJson} disabled={isSubmitting}>
                  <RefreshCcw className="mr-1 h-4 w-4" /> 同步表单
                </Button>
                <Button type="button" onClick={handleApplyJson} disabled={isSubmitting}>
                  <Check className="mr-1 h-4 w-4" /> 应用到表单
                </Button>
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
            {isEditMode ? '更新动态' : '发布动态'}
          </Button>
        </div>
      </form>

      {statusToast && <StatusToast status={statusToast} onClose={() => setStatusToast(null)} />}
    </div>
  );
}
