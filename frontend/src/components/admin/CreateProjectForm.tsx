'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { DynamicTags } from './DynamicTags';
import { ProjectStatusSelector, type ProjectStatus } from './ProjectStatusSelector';
import { ProjectTypeSelector, type ProjectType } from './ProjectTypeSelector';
import { ProjectFeatureSelector, type ProjectFeature } from './ProjectFeatureSelector';
import { MarkdownEditor } from './MarkdownEditor';
import { ScreenshotManager } from './ScreenshotManager';
import { ProjectInfoManager, type ProjectInfo } from './ProjectInfoManager';
import { FeatureHighlightManager, type FeatureHighlight } from './FeatureHighlightManager';
import {
  createProject,
  fetchSettings,
  updateSettings,
  uploadImage,
  fetchProject,
  updateProject,
} from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useShallow } from 'zustand/react/shallow';
import { useRouter } from 'next/navigation';
import {
  Monitor,
  Smartphone,
  Github,
  FileText,
  Type,
  Tags,
  Activity,
  Package,
  Star,
  Code,
  FileCode,
  FolderOpen,
  Image,
  Layers,
  Sparkles,
  Save,
  Send
} from 'lucide-react';
import { StatusToast, type StatusToastState } from '@/components/admin/settings/StatusToast';
import {
  DEFAULT_FEATURE_CHIP_PRESET_ID,
  parseFeatureChipAppearance,
  type FeatureChipPresetId
} from '@/lib/feature-chips';

const DEFAULT_STATUS_OPTIONS: ProjectStatus[] = [
  { id: 'active', label: '活跃项目', color: 'bg-green-500' },
  { id: 'building', label: '施工中', color: 'bg-yellow-500' },
  { id: 'iterated', label: '已迭代', color: 'bg-blue-500' },
  { id: 'archived', label: '已归档', color: 'bg-gray-500' },
];

const DEFAULT_TYPE_OPTIONS: ProjectType[] = [
  { id: 'company', label: '公司项目', icon: 'Building2' },
  { id: 'personal', label: '个人项目', icon: 'User' },
  { id: 'startup', label: '创业项目', icon: 'Rocket' },
];

const DEFAULT_FEATURE_OPTIONS: ProjectFeature[] = [
  { id: 'performance', label: '高性能', icon: 'Zap', appearance: { presetId: 'golden-glow' } },
  { id: 'security', label: '安全可靠', icon: 'Shield', appearance: { presetId: 'forest-breeze' } },
  { id: 'modern', label: '现代化', icon: 'Sparkles', appearance: { presetId: 'skyline' } },
];

const SETTINGS_KEYS = {
  statuses: 'projectStatuses',
  types: 'projectTypes',
  features: 'projectFeatures',
} as const;

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function createUniqueId(label: string, existing: string[], fallbackPrefix: string) {
  const base = slugify(label) || `${fallbackPrefix}-${Date.now()}`;
  let candidate = base;
  let counter = 1;
  while (existing.includes(candidate)) {
    candidate = `${base}-${counter++}`;
  }
  return candidate;
}


function normalizeStatusOptions(data: unknown): ProjectStatus[] {
  if (!Array.isArray(data)) {
    return DEFAULT_STATUS_OPTIONS;
  }

  const seen = new Set<string>();
  const sanitized: ProjectStatus[] = [];

  data.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) return;
    const record = item as Record<string, unknown>;
    const rawLabel = record.label ?? record.name;
    const label = typeof rawLabel === 'string' ? rawLabel.trim() : '';
    if (!label) return;

    const color = typeof record.color === 'string' ? record.color : 'bg-blue-500';
    const providedId = typeof record.id === 'string' ? record.id.trim() : '';
    const baseId = providedId || slugify(label) || `status-${index + 1}`;
    let uniqueId = baseId;
    let count = 1;
    while (seen.has(uniqueId)) {
      uniqueId = `${baseId}-${count++}`;
    }
    seen.add(uniqueId);

    sanitized.push({ id: uniqueId, label, color });
  });

  return sanitized.length > 0 ? sanitized : DEFAULT_STATUS_OPTIONS;
}

function normalizeTypeOptions(data: unknown): ProjectType[] {
  if (!Array.isArray(data)) {
    return DEFAULT_TYPE_OPTIONS;
  }

  const seen = new Set<string>();
  const sanitized: ProjectType[] = [];

  data.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) return;
    const record = item as Record<string, unknown>;
    const rawLabel = record.label ?? record.name;
    const label = typeof rawLabel === 'string' ? rawLabel.trim() : '';
    if (!label) return;

    const icon = typeof record.icon === 'string' ? record.icon : 'Building2';
    const providedId = typeof record.id === 'string' ? record.id.trim() : '';
    const baseId = providedId || slugify(label) || `type-${index + 1}`;
    let uniqueId = baseId;
    let count = 1;
    while (seen.has(uniqueId)) {
      uniqueId = `${baseId}-${count++}`;
    }
    seen.add(uniqueId);

    sanitized.push({ id: uniqueId, label, icon });
  });

  return sanitized.length > 0 ? sanitized : DEFAULT_TYPE_OPTIONS;
}

function normalizeFeatureOptions(data: unknown): ProjectFeature[] {
  if (!Array.isArray(data)) {
    return DEFAULT_FEATURE_OPTIONS;
  }

  const seen = new Set<string>();
  const sanitized: ProjectFeature[] = [];

  data.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) return;
    const record = item as Record<string, unknown>;
    const rawLabel = record.label ?? record.name;
    const label = typeof rawLabel === 'string' ? rawLabel.trim() : '';
    if (!label) return;

    const color = typeof record.color === 'string' ? record.color : undefined;
    const icon = typeof record.icon === 'string' ? record.icon : 'Sparkles';
    const providedId = typeof record.id === 'string' ? record.id.trim() : '';
    const baseId = providedId || slugify(label) || `feature-${index + 1}`;
    let uniqueId = baseId;
    let count = 1;
    while (seen.has(uniqueId)) {
      uniqueId = `${baseId}-${count++}`;
    }
    seen.add(uniqueId);

    const appearance =
      parseFeatureChipAppearance(record.appearance) ??
      parseFeatureChipAppearance(record.style) ??
      parseFeatureChipAppearance(record.visuals);

    sanitized.push({
      id: uniqueId,
      label,
      icon,
      color,
      appearance: appearance ?? (!color ? { presetId: DEFAULT_FEATURE_CHIP_PRESET_ID } : undefined),
    });
  });

  return sanitized.length > 0 ? sanitized : DEFAULT_FEATURE_OPTIONS;
}

interface ProjectFormData {
  id?: string;
  name: string;
  description: string;
  tags: string[];
  status: ProjectStatus | null;
  type: ProjectType | null;
  features: ProjectFeature[];
  previewUrl: string;
  mobilePreviewUrl: string;
  sourceUrl: string;
  leftSidebarMarkdown: string;
  rightSidebarMarkdown: string;
  isOpenSource: boolean;
  readme: string;
  screenshots: Array<{
    id: string;
    name: string;
    description: string;
    url: string;
  }>;
  projectInfos: ProjectInfo[];
  projectIntroduction: string;
  featureHighlights: FeatureHighlight[];
  createdAt?: string;
  updatedAt?: string;
  statusId?: string | null;
  typeId?: string | null;
  longDescription?: string;
}

const INITIAL_FORM_DATA: ProjectFormData = {
  id: undefined,
  name: '',
  description: '',
  tags: [],
  status: null,
  type: null,
  features: [],
  previewUrl: '',
  mobilePreviewUrl: '',
  sourceUrl: '',
  leftSidebarMarkdown: '',
  rightSidebarMarkdown: '',
  isOpenSource: false,
  readme: '',
  screenshots: [],
  projectInfos: [],
  projectIntroduction: '',
  featureHighlights: [],
  createdAt: undefined,
  updatedAt: undefined,
  statusId: null,
  typeId: null,
  longDescription: '',
};

interface CreateProjectFormProps {
  mode?: 'create' | 'edit';
  projectId?: string;
}

export function CreateProjectForm({ mode = 'create', projectId }: CreateProjectFormProps) {
  const router = useRouter();
  const isEditMode = mode === 'edit' && typeof projectId === 'string';
  const [formData, setFormData] = useState<ProjectFormData>(() => ({
    ...INITIAL_FORM_DATA,
  }));
  const { token, boundUsername } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
      boundUsername: state.user?.bound_username ?? null,
    }))
  );
  const [statusOptions, setStatusOptions] = useState<ProjectStatus[]>(DEFAULT_STATUS_OPTIONS);
  const [typeOptions, setTypeOptions] = useState<ProjectType[]>(DEFAULT_TYPE_OPTIONS);
  const [featureOptions, setFeatureOptions] = useState<ProjectFeature[]>(DEFAULT_FEATURE_OPTIONS);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftRestoredAt, setDraftRestoredAt] = useState<string | null>(null);
  const [projectLoading, setProjectLoading] = useState(isEditMode);
  const [projectError, setProjectError] = useState<string | null>(null);
  const canUploadAssets = Boolean(token && boundUsername);
  const canUseDraft = !isEditMode;
  const [statusToast, setStatusToast] = useState<StatusToastState | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const requireAuthContext = () => {
    if (!token) {
      throw new Error('未登录，无法执行此操作');
    }
    if (!boundUsername) {
      throw new Error('请先绑定站点后再执行此操作');
    }
    return { username: boundUsername, authToken: token };
  };

  const handleCreateStatusOption = async ({ label, color }: { label: string; color: string }) => {
    const { username, authToken } = requireAuthContext();
    const id = createUniqueId(label, statusOptions.map((option) => option.id), 'status');
    const newStatus: ProjectStatus = { id, label, color };
    const updated = [...statusOptions, newStatus];
    await updateSettings(username, SETTINGS_KEYS.statuses, updated, authToken);
    setStatusOptions(updated);
    return newStatus;
  };

  const handleCreateTypeOption = async ({ label, icon }: { label: string; icon: string }) => {
    const { username, authToken } = requireAuthContext();
    const id = createUniqueId(label, typeOptions.map((option) => option.id), 'type');
    const newType: ProjectType = { id, label, icon };
    const updated = [...typeOptions, newType];
    await updateSettings(username, SETTINGS_KEYS.types, updated, authToken);
    setTypeOptions(updated);
    return newType;
  };

  const handleCreateFeatureOption = async ({
    label,
    presetId,
    icon,
  }: {
    label: string;
    presetId: FeatureChipPresetId;
    icon: string;
  }) => {
    const { username, authToken } = requireAuthContext();
    const id = createUniqueId(label, featureOptions.map((option) => option.id), 'feature');
    const newFeature: ProjectFeature = { id, label, icon, appearance: { presetId } };
    const updated = [...featureOptions, newFeature];
    await updateSettings(username, SETTINGS_KEYS.features, updated, authToken);
    setFeatureOptions(updated);
    return newFeature;
  };

  const uploadProjectScreenshot = async (file: File) => {
    const { username, authToken } = requireAuthContext();
    const result = await uploadImage(username, file, authToken, 'project-screenshots');
    return { url: result.url, name: file.name || result.filename };
  };

  const uploadFeatureScreenshot = async (featureId: string, file: File) => {
    const { username, authToken } = requireAuthContext();
    const result = await uploadImage(username, file, authToken, `feature-${featureId}`);
    return { url: result.url, name: file.name || result.filename };
  };

  const ensureStatusValue = useCallback((value: unknown): ProjectStatus | null => {
    if (!value) return null;
    if (typeof value === 'object' && value !== null) {
      const record = value as Record<string, unknown>;
      const id = typeof record.id === 'string' ? record.id : undefined;
      const label = typeof record.label === 'string'
        ? record.label
        : typeof record.name === 'string'
          ? record.name
          : undefined;
      const color = typeof record.color === 'string' ? record.color : 'bg-blue-500';
      if (label) {
        const fallbackId = slugify(label) || `status-${Date.now()}`;
        return {
          id: id ?? fallbackId,
          label,
          color,
        };
      }
    }
    if (typeof value === 'string') {
      return { id: value, label: value, color: 'bg-blue-500' };
    }
    return null;
  }, []);

  const ensureTypeValue = useCallback((value: unknown): ProjectType | null => {
    if (!value) return null;
    if (typeof value === 'object' && value !== null) {
      const record = value as Record<string, unknown>;
      const id = typeof record.id === 'string' ? record.id : undefined;
      const label = typeof record.label === 'string'
        ? record.label
        : typeof record.name === 'string'
          ? record.name
          : undefined;
      const icon = typeof record.icon === 'string' ? record.icon : 'FolderOpen';
      if (label) {
        const fallbackId = slugify(label) || `type-${Date.now()}`;
        return {
          id: id ?? fallbackId,
          label,
          icon,
        };
      }
    }
    if (typeof value === 'string') {
      return { id: value, label: value, icon: 'FolderOpen' };
    }
    return null;
  }, []);

  const ensureFeatureList = useCallback((value: unknown): ProjectFeature[] => {
    if (!Array.isArray(value)) return [];
    const usedIds = new Set<string>();
    return value
      .map((item, index) => {
        if (typeof item !== 'object' || item === null) return null;
        const record = item as Record<string, unknown>;
        const label = typeof record.label === 'string'
          ? record.label
          : typeof record.name === 'string'
            ? record.name
            : '';
        if (!label) return null;
        const slug = slugify(label) || `feature-${index}`;
        let id = typeof record.id === 'string' ? record.id : slug;
        let counter = 1;
        while (usedIds.has(id)) {
          id = `${slug}-${counter++}`;
        }
        usedIds.add(id);
        const color = typeof record.color === 'string' ? record.color : undefined;
        const icon = typeof record.icon === 'string' ? record.icon : 'Sparkles';
        const appearance =
          parseFeatureChipAppearance(record.appearance) ??
          parseFeatureChipAppearance(record.style) ??
          parseFeatureChipAppearance(record.visuals);
        return {
          id,
          label,
          color,
          icon,
          appearance: appearance ?? (!color ? { presetId: DEFAULT_FEATURE_CHIP_PRESET_ID } : undefined),
        };
      })
      .filter((item): item is ProjectFeature => item !== null);
  }, []);

  const ensureScreenshots = useCallback((
    value: unknown,
    fallback?: unknown
  ): ProjectFormData['screenshots'] => {
    const normalize = (item: Record<string, unknown>, index: number) => {
      const url = typeof item.url === 'string' ? item.url : typeof item.src === 'string' ? item.src : '';
      if (!url) return null;
      const baseId = typeof item.id === 'string' ? item.id : slugify(url) || `screenshot-${index}`;
      const name = typeof item.name === 'string'
        ? item.name
        : typeof item.label === 'string'
          ? item.label
          : typeof item.alt === 'string'
            ? item.alt
            : '';
      const description = typeof item.description === 'string' ? item.description : '';
      return {
        id: baseId,
        name,
        description,
        url,
      };
    };

    if (Array.isArray(value)) {
      const normalized = value
        .map((item, index) => (typeof item === 'object' && item !== null ? normalize(item as Record<string, unknown>, index) : null))
        .filter((item): item is ProjectFormData['screenshots'][number] => item !== null);
      if (normalized.length > 0) {
        return normalized;
      }
    }

    if (Array.isArray(fallback)) {
      const normalized = fallback
        .map((item, index) => (typeof item === 'object' && item !== null ? normalize(item as Record<string, unknown>, index) : null))
        .filter((item): item is ProjectFormData['screenshots'][number] => item !== null);
      if (normalized.length > 0) {
        return normalized;
      }
    }

    return [];
  }, []);

  const ensureFeatureHighlights = useCallback((value: unknown): FeatureHighlight[] => {
    if (!Array.isArray(value)) return [];
    return value
      .map((item, index) => {
        if (typeof item !== 'object' || item === null) return null;
        const record = item as Record<string, unknown>;
        const id = typeof record.id === 'string' ? record.id : `feature-${Date.now()}-${index}`;
        const title = typeof record.title === 'string' ? record.title : '';
        const description = typeof record.description === 'string' ? record.description : '';
        const techStack = Array.isArray(record.techStack)
          ? (record.techStack as FeatureHighlight['techStack'])
          : [];
        const screenshots = ensureScreenshots(record.screenshots, (record as Record<string, unknown>).images);
        const previewUrl = typeof record.previewUrl === 'string' ? record.previewUrl : '';
        const mobilePreviewUrl = typeof record.mobilePreviewUrl === 'string' ? record.mobilePreviewUrl : '';
        const leftMarkdown = typeof record.leftMarkdown === 'string' ? record.leftMarkdown : '';
        const rightMarkdown = typeof record.rightMarkdown === 'string' ? record.rightMarkdown : '';
        return {
          id,
          title,
          description,
          techStack,
          screenshots,
          previewUrl,
          mobilePreviewUrl,
          leftMarkdown,
          rightMarkdown,
        } as FeatureHighlight;
      })
      .filter((item): item is FeatureHighlight => item !== null);
  }, [ensureScreenshots]);

  const handleSaveDraft = () => {
    if (!canUseDraft) {
      return;
    }
    // 保存草稿到本地存储
    const draftData = {
      ...formData,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem('project-draft', JSON.stringify(draftData));
    setStatusToast({ type: 'success', message: '草稿已保存到本地' });
  };

  // 在组件挂载时尝试恢复草稿（仅创建模式）
  useEffect(() => {
    if (!canUseDraft) return;
    const savedDraft = localStorage.getItem('project-draft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        const { lastSaved, ...projectData } = draftData;

        setFormData(projectData);
        if (typeof lastSaved === 'string') {
          setDraftRestoredAt(new Date(lastSaved).toLocaleString());
        } else {
          setDraftRestoredAt('最近');
        }
      } catch (error) {
        console.error('恢复草稿失败:', error);
      }
    }
  }, [canUseDraft]);

  useEffect(() => {
    if (!isEditMode) return;
    if (token && boundUsername) return;
    setProjectLoading(false);
  }, [isEditMode, token, boundUsername]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!token || !boundUsername) {
      setStatusOptions(DEFAULT_STATUS_OPTIONS);
      setTypeOptions(DEFAULT_TYPE_OPTIONS);
      setFeatureOptions(DEFAULT_FEATURE_OPTIONS);
      return;
    }

    let cancelled = false;

    const loadSettings = async () => {
      setSettingsLoading(true);
      setSettingsError(null);

      try {
        const results = await Promise.allSettled([
          fetchSettings<ProjectStatus[]>(boundUsername, SETTINGS_KEYS.statuses, token),
          fetchSettings<ProjectType[]>(boundUsername, SETTINGS_KEYS.types, token),
          fetchSettings<ProjectFeature[]>(boundUsername, SETTINGS_KEYS.features, token),
        ]);

        if (cancelled) {
          return;
        }

        const [statusResult, typeResult, featureResult] = results;

        if (statusResult.status === 'fulfilled' && statusResult.value?.data) {
          setStatusOptions(normalizeStatusOptions(statusResult.value.data));
        } else {
          setStatusOptions(DEFAULT_STATUS_OPTIONS);
          if (statusResult.status === 'rejected') {
            const reason = statusResult.reason;
            const message = reason instanceof Error ? reason.message : '项目状态配置加载失败';
            setSettingsError(message);
          }
        }

        if (typeResult.status === 'fulfilled' && typeResult.value?.data) {
          setTypeOptions(normalizeTypeOptions(typeResult.value.data));
        } else {
          setTypeOptions(DEFAULT_TYPE_OPTIONS);
          if (typeResult.status === 'rejected') {
            const reason = typeResult.reason;
            const message = reason instanceof Error ? reason.message : '项目类型配置加载失败';
            setSettingsError(message);
          }
        }

        if (featureResult.status === 'fulfilled' && featureResult.value?.data) {
          setFeatureOptions(normalizeFeatureOptions(featureResult.value.data));
        } else {
          setFeatureOptions(DEFAULT_FEATURE_OPTIONS);
          if (featureResult.status === 'rejected') {
            const reason = featureResult.reason;
            const message = reason instanceof Error ? reason.message : '项目特性配置加载失败';
            setSettingsError(message);
          }
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : '加载项目配置失败';
        setSettingsError(message);
        setStatusOptions(DEFAULT_STATUS_OPTIONS);
        setTypeOptions(DEFAULT_TYPE_OPTIONS);
        setFeatureOptions(DEFAULT_FEATURE_OPTIONS);
      } finally {
        if (!cancelled) {
          setSettingsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [token, boundUsername]);
  useEffect(() => {
    if (!isEditMode) return;
    if (!token || !boundUsername || !projectId) return;

    let cancelled = false;

    const loadProject = async () => {
      setProjectLoading(true);
      setProjectError(null);
      try {
        const response = await fetchProject<Record<string, unknown>>(boundUsername, projectId, token);
        if (cancelled) return;
        if (response?.success && response.data) {
          const projectRecord = response.data as Record<string, unknown>;
          const status = ensureStatusValue(projectRecord.status);
          const type = ensureTypeValue(projectRecord.type);
          const features = ensureFeatureList(projectRecord.features);
          const screenshots = ensureScreenshots(projectRecord.screenshots, projectRecord.images);
          const featureHighlights = ensureFeatureHighlights(projectRecord.featureHighlights);
          const projectInfos = Array.isArray(projectRecord.projectInfos)
            ? (projectRecord.projectInfos as ProjectInfo[])
            : [];
          const tags = Array.isArray(projectRecord.tags)
            ? (projectRecord.tags as unknown[]).filter((tag): tag is string => typeof tag === 'string')
            : [];

          const mapped: ProjectFormData = {
            ...INITIAL_FORM_DATA,
            ...projectRecord,
            id: typeof projectRecord.id === 'string' ? projectRecord.id : projectId,
            name: typeof projectRecord.name === 'string' ? projectRecord.name : '',
            description: typeof projectRecord.description === 'string' ? projectRecord.description : '',
            tags,
            status,
            type,
            features,
            previewUrl: typeof projectRecord.previewUrl === 'string' ? projectRecord.previewUrl : '',
            mobilePreviewUrl: typeof projectRecord.mobilePreviewUrl === 'string' ? projectRecord.mobilePreviewUrl : '',
            sourceUrl: typeof projectRecord.sourceUrl === 'string' ? projectRecord.sourceUrl : '',
            leftSidebarMarkdown: typeof projectRecord.leftSidebarMarkdown === 'string' ? projectRecord.leftSidebarMarkdown : '',
            rightSidebarMarkdown: typeof projectRecord.rightSidebarMarkdown === 'string' ? projectRecord.rightSidebarMarkdown : '',
            isOpenSource: typeof projectRecord.isOpenSource === 'boolean' ? projectRecord.isOpenSource : Boolean(projectRecord.sourceUrl),
            readme: typeof projectRecord.readme === 'string' ? projectRecord.readme : '',
            screenshots,
            projectInfos,
            projectIntroduction:
              typeof projectRecord.projectIntroduction === 'string'
                ? projectRecord.projectIntroduction
                : typeof projectRecord.longDescription === 'string'
                  ? projectRecord.longDescription
                  : '',
            featureHighlights,
            createdAt: typeof projectRecord.createdAt === 'string' ? projectRecord.createdAt : undefined,
            updatedAt: typeof projectRecord.updatedAt === 'string' ? projectRecord.updatedAt : undefined,
            statusId: typeof projectRecord.statusId === 'string' || projectRecord.statusId === null ? (projectRecord.statusId as string | null) : null,
            typeId: typeof projectRecord.typeId === 'string' || projectRecord.typeId === null ? (projectRecord.typeId as string | null) : null,
            longDescription: typeof projectRecord.longDescription === 'string' ? projectRecord.longDescription : undefined,
          };

          setFormData(mapped);
          setDraftRestoredAt(null);

          if (status) {
            setStatusOptions((prev) =>
              prev.some((item) => item.id === status.id) ? prev : [...prev, status]
            );
          }

          if (type) {
            setTypeOptions((prev) =>
              prev.some((item) => item.id === type.id) ? prev : [...prev, type]
            );
          }
        } else {
          setProjectError('未能加载项目数据');
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : '加载项目数据失败';
          setProjectError(message);
        }
      } finally {
        if (!cancelled) {
          setProjectLoading(false);
        }
      }
    };

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, token, boundUsername, projectId, ensureStatusValue, ensureTypeValue, ensureFeatureList, ensureScreenshots, ensureFeatureHighlights]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors: string[] = [];
    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();
    const sanitizedTags = formData.tags.map((tag) => tag.trim()).filter(Boolean);

    if (!trimmedName) {
      errors.push('项目名称不能为空');
    }

    if (!trimmedDescription) {
      errors.push('项目简介不能为空');
    }

    if (formData.isOpenSource && !formData.sourceUrl.trim()) {
      errors.push('开源项目必须提供源码地址');
    }

    if (errors.length > 0) {
      setStatusToast({
        type: 'error',
        message: `请修正以下问题：${errors.join('；')}`,
      });
      return;
    }

    let authContext: { username: string; authToken: string };
    try {
      authContext = requireAuthContext();
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : '请完成账号绑定后再提交';
      setStatusToast({ type: 'error', message });
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const payload: ProjectFormData = {
        ...formData,
        id: isEditMode ? (projectId ?? formData.id) : formData.id,
        name: trimmedName,
        description: trimmedDescription,
        tags: sanitizedTags,
        statusId: formData.status?.id ?? null,
        typeId: formData.type?.id ?? null,
        updatedAt: now,
        longDescription: formData.projectIntroduction,
      };

      if (!isEditMode) {
        payload.createdAt = now;
        await createProject(authContext.username, payload as unknown as Record<string, unknown>, authContext.authToken);
        localStorage.removeItem('project-draft');
        setFormData({ ...INITIAL_FORM_DATA });
        setStatusToast({ type: 'success', message: '作品集创建成功！' });
      } else if (projectId) {
        await updateProject(authContext.username, projectId, payload as unknown as Record<string, unknown>, authContext.authToken);
        setStatusToast({ type: 'success', message: '作品集更新成功！' });
      }

      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/admin');
      }, 1200);
    } catch (error) {
      const message = error instanceof Error ? error.message : '提交失败，请稍后重试';
      setStatusToast({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageTitle = isEditMode ? '编辑作品集' : '创建新作品集';
  const pageSubtitle = isEditMode
    ? '更新作品的详细信息，并保持展示内容最新。'
    : '完善作品集信息，以便在前端页面完整展示。';
  const submitButtonLabel = isEditMode ? '更新作品集' : '创建作品集';
  const submitButtonLoadingLabel = isEditMode ? '更新中…' : '创建中…';

  if (isEditMode && projectLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground">正在加载项目数据，请稍候...</p>
        </div>
        <div className="rounded-md border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
          正在加载项目数据，请稍候...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8 relative z-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">{pageTitle}</h1>
        <p className="text-sm text-muted-foreground">{pageSubtitle}</p>
      </div>

      {settingsLoading && (
        <div className="rounded-md border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          正在加载项目配置，请稍候...
        </div>
      )}

      {projectError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          {projectError}
        </div>
      )}

      {settingsError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          {settingsError}
        </div>
      )}

      {(!token || !boundUsername) && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300">
          请先登录并绑定站点后再继续。您仍然可以填写表单并保存草稿。
        </div>
      )}

      {!isEditMode && draftRestoredAt && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
          已自动恢复草稿内容（最后保存时间：{draftRestoredAt}）。
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 作品信息 */}
        <Card>
          <CardHeader>
            <CardTitle>
              <FolderOpen className="inline h-5 w-5 mr-2" />
              作品信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 项目名称 */}
            <div className="space-y-2">
              <Label htmlFor="name">
                <Type className="inline h-4 w-4 mr-1" />
                项目名称 *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="输入项目名称"
                required
              />
            </div>

            {/* 项目简介 */}
            <div className="space-y-2">
              <Label htmlFor="description">
                <FileText className="inline h-4 w-4 mr-1" />
                项目简介 *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="简要描述项目的功能和特点"
                rows={3}
                required
              />
            </div>

            {/* 项目标签 */}
            <div className="space-y-2">
              <Label>
                <Tags className="inline h-4 w-4 mr-1" />
                项目标签
              </Label>
              <DynamicTags
                tags={formData.tags}
                onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
              />
            </div>

            {/* 项目状态 */}
            <div className="space-y-2">
              <Label>
                <Activity className="inline h-4 w-4 mr-1" />
                项目状态
              </Label>
              <ProjectStatusSelector
                value={formData.status}
                options={statusOptions}
                onChange={(status) => setFormData(prev => ({ ...prev, status }))}
                onCreateOption={handleCreateStatusOption}
              />
            </div>

            {/* 项目类型 */}
            <div className="space-y-2">
              <Label>
                <Package className="inline h-4 w-4 mr-1" />
                项目类型
              </Label>
              <ProjectTypeSelector
                value={formData.type}
                options={typeOptions}
                onChange={(type) => setFormData(prev => ({ ...prev, type }))}
                onCreateOption={handleCreateTypeOption}
              />
            </div>

            {/* 项目特性 */}
            <div className="space-y-2">
              <Label>
                <Star className="inline h-4 w-4 mr-1" />
                项目特性
              </Label>
              <ProjectFeatureSelector
                features={formData.features}
                options={featureOptions}
                onChange={(features) => setFormData(prev => ({ ...prev, features }))}
                onCreateOption={handleCreateFeatureOption}
              />
            </div>

            <Separator />

            {/* URL 信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="previewUrl">
                  <Monitor className="inline h-4 w-4 mr-1" />
                  项目预览地址
                </Label>
                <Input
                  id="previewUrl"
                  type="url"
                  value={formData.previewUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, previewUrl: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobilePreviewUrl">
                  <Smartphone className="inline h-4 w-4 mr-1" />
                  移动端预览地址 (可选)
                </Label>
                <Input
                  id="mobilePreviewUrl"
                  type="url"
                  value={formData.mobilePreviewUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobilePreviewUrl: e.target.value }))}
                  placeholder="https://m.example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceUrl">
                  <Github className="inline h-4 w-4 mr-1" />
                  项目源码地址
                </Label>
                <Input
                  id="sourceUrl"
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, sourceUrl: e.target.value }))}
                  placeholder="https://github.com/username/repo"
                  disabled={!formData.isOpenSource}
                />
              </div>
            </div>

            {/* 侧边栏 Markdown 内容 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leftSidebarMarkdown">
                  <Code className="inline h-4 w-4 mr-1" />
                  展示信息左侧栏 Markdown
                </Label>
                <Textarea
                  id="leftSidebarMarkdown"
                  value={formData.leftSidebarMarkdown}
                  onChange={(e) => setFormData(prev => ({ ...prev, leftSidebarMarkdown: e.target.value }))}
                  placeholder="输入左侧栏展示的 Markdown 内容..."
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rightSidebarMarkdown">
                  <FileCode className="inline h-4 w-4 mr-1" />
                  展示信息右侧栏 Markdown
                </Label>
                <Textarea
                  id="rightSidebarMarkdown"
                  value={formData.rightSidebarMarkdown}
                  onChange={(e) => setFormData(prev => ({ ...prev, rightSidebarMarkdown: e.target.value }))}
                  placeholder="输入右侧栏展示的 Markdown 内容..."
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            {/* 开源选项 */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isOpenSource"
                checked={formData.isOpenSource}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  isOpenSource: checked,
                  sourceUrl: checked ? prev.sourceUrl : ''
                }))}
              />
              <Label htmlFor="isOpenSource">
                <Github className="inline h-4 w-4 mr-1" />
                项目开源
              </Label>
            </div>
          </CardContent>
        </Card>
        {/* 作品截图展示 */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Image className="inline h-5 w-5 mr-2" />
              作品截图展示
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScreenshotManager
              screenshots={formData.screenshots}
              onChange={(screenshots) => setFormData(prev => ({ ...prev, screenshots }))}
              onUpload={canUploadAssets ? uploadProjectScreenshot : undefined}
            />
          </CardContent>
        </Card>

        {/* 项目概览 - 信息展示区域 */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Layers className="inline h-5 w-5 mr-2" />
              项目概览 - 信息展示区域
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectInfoManager
              projectInfos={formData.projectInfos}
              onChange={(infos) => setFormData(prev => ({ ...prev, projectInfos: infos }))}
            />
          </CardContent>
        </Card>

        {/* 项目介绍 Markdown 编辑器 */}
        <Card>
          <CardHeader>
            <CardTitle>
              <FileText className="inline h-5 w-5 mr-2" />
              项目介绍
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <MarkdownEditor
                value={formData.projectIntroduction}
                onChange={(projectIntroduction) => setFormData(prev => ({ ...prev, projectIntroduction }))}
                placeholder="输入项目介绍..."
              />
            </div>
          </CardContent>
        </Card>

        {/* 特色功能介绍 */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Sparkles className="inline h-5 w-5 mr-2" />
              特色功能介绍
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FeatureHighlightManager
              features={formData.featureHighlights}
              onChange={(features) => setFormData(prev => ({ ...prev, featureHighlights: features }))}
              onUploadScreenshot={canUploadAssets ? uploadFeatureScreenshot : undefined}
            />
          </CardContent>
        </Card>

        {/* 提交按钮 */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={!canUseDraft || isSubmitting}
            title={canUseDraft ? undefined : '编辑模式暂不支持草稿保存'}
          >
            <Save className="w-4 h-4 mr-2" />
            保存草稿
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !token || !boundUsername}
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? submitButtonLoadingLabel : submitButtonLabel}
          </Button>
        </div>
      </form>
      {statusToast && (
        <StatusToast status={statusToast} onClose={() => setStatusToast(null)} />
      )}
    </div>
  );
}
