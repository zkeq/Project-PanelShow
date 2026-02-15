'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Markdown from '@/components/Markdown';
import { getTextShare, updateTextShare } from '@/lib/api';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import { Home, PencilLine } from 'lucide-react';

export default function SharedTextPage() {
  const params = useParams<{ shareId: string }>();
  const shareId = params?.shareId;

  const [content, setContent] = useState('');
  const [draft, setDraft] = useState('');
  const [password, setPassword] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) {
      return;
    }

    const loadShare = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getTextShare(shareId);
        setContent(response.content);
        setDraft(response.content);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : '加载分享失败');
      } finally {
        setIsLoading(false);
      }
    };

    void loadShare();
  }, [shareId]);

  const saveEdit = async () => {
    if (!shareId) {
      return;
    }

    if (password.trim().length < 4) {
      setError('请输入正确的分享密码');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await updateTextShare(shareId, draft, password.trim());
      setContent(draft);
      setSuccess('更新成功，当前内容已重新分享。');
      setIsEditMode(false);
      setPassword('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '修改失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 max-w-4xl items-center justify-between">
          <div>
            <p className="text-sm font-semibold">分享内容预览</p>
            <p className="text-xs text-muted-foreground">只读浏览，可在此输入密码后修改</p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditMode ? (
              <Button size="sm" onClick={() => setIsEditMode(true)}>
                <PencilLine className="mr-1 h-4 w-4" />
                修改内容
              </Button>
            ) : null}
            <Button size="sm" variant="outline" asChild>
              <Link href="/">
                <Home className="mr-1 h-4 w-4" />
                返回首页
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl space-y-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>分享内容预览</CardTitle>
            <CardDescription>该页面为只读预览，可输入密码进入编辑模式。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? <p className="text-sm text-muted-foreground">正在加载分享内容...</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

            {!isLoading && isEditMode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-password">分享密码</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    placeholder="输入分享密码后可保存"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
                <MarkdownEditor value={draft} onChange={setDraft} placeholder="输入新的 Markdown 内容..." />
                <div className="flex gap-2">
                  <Button onClick={saveEdit} disabled={isSubmitting}>
                    {isSubmitting ? '保存中...' : '保存修改'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDraft(content);
                      setIsEditMode(false);
                      setPassword('');
                    }}
                  >
                    取消
                  </Button>
                </div>
              </div>
            ) : !isLoading ? (
              <div className="space-y-4">
                <Markdown>{content}</Markdown>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
