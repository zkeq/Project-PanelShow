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
import { fetchProjects } from '@/lib/api';
import { Calendar, Clock, RefreshCcw, Save, Send } from 'lucide-react';

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...formState,
      projectId: formState.projectId || null,
      type: formState.type,
      tags: formState.tags,
      images: formState.images.map((image) => ({ id: image.id, fileName: image.file.name })),
    };

    console.table(payload);
    alert('表单数据已准备好提交，当前为演示模式。');
    setIsSubmitting(false);
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
    <div className="container mx-auto max-w-6xl space-y-8 py-10">
      <header className="space-y-1">
        <p className="text-sm font-medium text-primary/80">发布动态</p>
        <h1 className="text-3xl font-semibold tracking-tight">项目动态发布中心</h1>
        <p className="text-muted-foreground">
          记录项目的每一次重要更新，支持类型、标签、图文与链接的完整配置。
        </p>
      </header>

      <form className="space-y-8" onSubmit={handleSubmit}>
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

            <DynamicTypeSelector value={formState.type} onChange={(value) => updateFormState('type', value)} />

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">动态标签</Label>
              <DynamicTagManager tags={formState.tags} onChange={(tags) => updateFormState('tags', tags)} />
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
