'use client';

import { useState } from 'react';
import Link from 'next/link'
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import Markdown from '@/components/Markdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeSwitch } from '@/components/theme-switch';
import { Monitor, Home } from 'lucide-react';

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

export default function EditorDemoPage() {
  const [content, setContent] = useState(DEFAULT_MARKDOWN);

  return (
    <div className="min-h-screen bg-background">
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
            <ThemeSwitch />
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
          <CardHeader>
            <CardTitle>编辑区</CardTitle>
            <CardDescription>上半屏为编辑器，可直接输入或修改示例内容。</CardDescription>
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
