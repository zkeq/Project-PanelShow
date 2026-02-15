'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import Markdown from '@/components/Markdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeSwitch } from '@/components/theme-switch';
import { useTheme } from 'next-themes';
import { Monitor, Home, Save, Share2, History } from 'lucide-react';
import { createTextShare } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEFAULT_MARKDOWN = `# 管理后台 Markdown 编辑器演示

这是 **Project-PanelShow** 开源项目的公开演示页，可直接体验管理后台同款编辑器能力。

- ✅ 无需登录即可体验编辑器
- ✅ 支持 Markdown 语法、表格、代码块
- ✅ 支持 Mermaid 思维导图与流程图

## 适用场景

| 场景 | 用途 | 备注 |
| --- | --- | --- |
| 产品规划 | 梳理路线图 | 可直接分享 |
| 运营说明 | 输出发布文案 | 支持高亮 |
| 技术文档 | 演示架构图 | Mermaid 渲染 |

## Mermaid 思维导图示例

\`\`\`mermaid
mindmap
  root((管理后台编辑器))
    体验
      即开即用
      免登录试用
    能力
      Markdown
      Mermaid
      预览同步
    价值
      更快协作
      更清晰表达
\`\`\`

## 小结

> 在上方编辑，下方即可看到渲染结果。可以直接修改内容，体验实时效果。
`;

type EditorThemeMode = 'github' | 'dracula';

interface LocalVersion {
  id: string;
  content: string;
  savedAt: string;
}

const DRAFT_KEY = 'editor-demo:draft';
const VERSIONS_KEY = 'editor-demo:versions';
const VERSION_LIMIT = 50;
const SNAPSHOT_INTERVAL_MS = 2 * 60 * 1000;

export default function EditorDemoPage() {
  const [content, setContent] = useState(DEFAULT_MARKDOWN);
  const [versions, setVersions] = useState<LocalVersion[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const [isWideMode, setIsWideMode] = useState(false);
  const [editorThemeMode, setEditorThemeMode] = useState<EditorThemeMode>('github');
  const { setTheme } = useTheme();

  const [sharePassword, setSharePassword] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareResult, setShareResult] = useState<string | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const persistVersions = (versionList: LocalVersion[]) => {
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(versionList));
  };

  useEffect(() => {
    if (editorThemeMode === 'dracula') {
      setTheme('dark');
    }
  }, [editorThemeMode, setTheme]);

  useEffect(() => {
    const cachedDraft = localStorage.getItem(DRAFT_KEY);
    const cachedVersions = localStorage.getItem(VERSIONS_KEY);

    if (cachedDraft) {
      setContent(cachedDraft);
    }

    if (cachedVersions) {
      try {
        const parsedVersions = JSON.parse(cachedVersions) as LocalVersion[];
        if (Array.isArray(parsedVersions)) {
          setVersions(parsedVersions.slice(0, VERSION_LIMIT));
        }
      } catch {
        setVersions([]);
      }
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    localStorage.setItem(DRAFT_KEY, content);
    setLastSavedAt(new Date().toISOString());
  }, [content, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const saveSnapshot = () => {
      setVersions((current) => {
        if (current[0]?.content === content) {
          return current;
        }

        const nextVersions: LocalVersion[] = [
          {
            id: crypto.randomUUID(),
            content,
            savedAt: new Date().toISOString(),
          },
          ...current,
        ].slice(0, VERSION_LIMIT);

        persistVersions(nextVersions);
        setLastSavedAt(new Date().toISOString());
        return nextVersions;
      });
    };

    saveSnapshot();
    const timer = window.setInterval(saveSnapshot, SNAPSHOT_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [content, isHydrated]);

  const lastSavedLabel = useMemo(() => {
    if (!lastSavedAt) {
      return '尚未保存';
    }

    const date = new Date(lastSavedAt);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }, [lastSavedAt]);

  const rollbackToVersion = (version: LocalVersion) => {
    setContent(version.content);
    localStorage.setItem(DRAFT_KEY, version.content);
    setLastSavedAt(new Date().toISOString());
    setHistoryDialogOpen(false);
  };

  const handleManualSave = () => {
    setVersions((current) => {
      const nextVersions: LocalVersion[] = [
        {
          id: crypto.randomUUID(),
          content,
          savedAt: new Date().toISOString(),
        },
        ...current,
      ].filter((item, index, arr) => index === 0 || item.content !== arr[index - 1].content).slice(0, VERSION_LIMIT);

      persistVersions(nextVersions);
      localStorage.setItem(DRAFT_KEY, content);
      setLastSavedAt(new Date().toISOString());
      return nextVersions;
    });
  };

  const handleShare = async () => {
    if (sharePassword.trim().length < 4) {
      setShareError('分享密码至少 4 位');
      return;
    }

    setIsSharing(true);
    setShareError(null);

    try {
      const response = await createTextShare(content, sharePassword.trim());
      const absoluteUrl = `${window.location.origin}${response.share_url}`;
      setShareResult(absoluteUrl);
      await navigator.clipboard.writeText(absoluteUrl);
    } catch (error) {
      setShareError(error instanceof Error ? error.message : '分享失败，请稍后再试');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div
      className={cn(
        'editor-demo-page min-h-screen bg-background',
        isWideMode && 'editor-demo-wide',
        editorThemeMode === 'dracula' && 'editor-demo-dracula'
      )}
    >
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            <div>
              <p className="text-sm font-semibold">Markdown 编辑器演示</p>
              <p className="text-xs text-muted-foreground">Project-PanelShow Open Source</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={editorThemeMode === 'dracula' ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                setEditorThemeMode((current) => (current === 'github' ? 'dracula' : 'github'))
              }
            >
              {editorThemeMode === 'github' ? 'Github 主题' : 'Dracula 主题'}
            </Button>
            <Button
              variant={isWideMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsWideMode((current) => !current)}
            >
              {isWideMode ? '退出宽屏' : '宽屏模式'}
            </Button>
            {editorThemeMode === 'github' ? (
              <ThemeSwitch />
            ) : (
              <span className="rounded-md border border-border/60 px-2 py-1 text-xs text-muted-foreground">
                Dracula 固定暗色
              </span>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                返回首页
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container space-y-6 py-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-primary">公开演示</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">管理后台同款 Markdown 编辑器</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            面向开源社区的演示页面，展示 Markdown + Mermaid 的编辑与渲染能力。
          </p>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="space-y-4">
            <div>
              <CardTitle>编辑区</CardTitle>
              <CardDescription>上半屏为编辑器，可直接输入或修改示例内容。</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-1">
                <Save className="h-3.5 w-3.5" />
                输入即保存（LocalStorage）
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-1">
                <History className="h-3.5 w-3.5" />
                每 2 分钟保留快照，最多 50 个版本
              </span>
              <span>最近保存：{lastSavedLabel}</span>
              <Button size="sm" variant="outline" onClick={handleManualSave}>
                <Save className="mr-1 h-4 w-4" />
                手动保存
              </Button>
              <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <History className="mr-1 h-4 w-4" />
                    回档记录
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[70vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>本地回档记录</DialogTitle>
                    <DialogDescription>最多展示 50 条本地快照，点击即可恢复。</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    {versions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">暂无可回档版本，请先输入内容。</p>
                    ) : (
                      versions.map((version, index) => (
                        <div
                          key={version.id}
                          className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium">版本 #{versions.length - index}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {new Date(version.savedAt).toLocaleString()} ·{' '}
                              {version.content.slice(0, 40) || '空内容'}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => rollbackToVersion(version)}>
                            回档
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="ml-auto" variant="secondary">
                    <Share2 className="mr-1 h-4 w-4" />
                    分享
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>分享文本</DialogTitle>
                    <DialogDescription>
                      设置密码后生成分享链接。系统会按每 1500 字切片调用文本审核。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="share-password">分享密码</Label>
                    <Input
                      id="share-password"
                      type="password"
                      placeholder="至少 4 位"
                      value={sharePassword}
                      onChange={(event) => setSharePassword(event.target.value)}
                    />
                    {shareError ? <p className="text-sm text-destructive">{shareError}</p> : null}
                    {shareResult ? (
                      <p className="break-all text-sm text-emerald-600">
                        分享成功（已复制）：
                        {shareResult}
                      </p>
                    ) : null}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleShare} disabled={isSharing}>
                      {isSharing ? '分享中...' : '确认分享'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="输入要演示的 Markdown 内容..."
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>渲染预览</CardTitle>
            <CardDescription>下半屏展示固定内容的渲染效果（同步上方编辑器）。</CardDescription>
          </CardHeader>
          <CardContent>
            <Markdown>{content}</Markdown>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
