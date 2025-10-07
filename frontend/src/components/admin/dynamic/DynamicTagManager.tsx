'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Box,
  Brush,
  Bug,
  Code2,
  Cpu,
  Flame,
  GitBranch,
  Globe,
  Layers,
  Lightbulb,
  LineChart,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Wand2,
  Wrench,
  X,
  Plus,
  Loader2,
  type LucideIcon,
} from 'lucide-react';

export interface DynamicTagItem {
  id: string;
  label: string;
  icon: keyof typeof ICON_MAP;
}

interface DynamicTagManagerProps {
  tags: DynamicTagItem[];
  onChange: (tags: DynamicTagItem[]) => void;
  availableTags: DynamicTagItem[];
  onCreateTag: (payload: { label: string; icon: DynamicTagItem['icon'] }) => Promise<DynamicTagItem>;
  disabled?: boolean;
  isSaving?: boolean;
}

const ICON_MAP: Record<string, LucideIcon> = {
  code2: Code2,
  sparkles: Sparkles,
  rocket: Rocket,
  lightbulb: Lightbulb,
  star: Star,
  gitbranch: GitBranch,
  wrench: Wrench,
  bug: Bug,
  shield: ShieldCheck,
  flame: Flame,
  brush: Brush,
  wand: Wand2,
  cpu: Cpu,
  layers: Layers,
  globe: Globe,
  linechart: LineChart,
  box: Box,
};

const ICON_OPTIONS = [
  { value: 'code2', label: '代码' },
  { value: 'sparkles', label: '灵感' },
  { value: 'rocket', label: '发布' },
  { value: 'lightbulb', label: '思路' },
  { value: 'star', label: '亮点' },
  { value: 'gitbranch', label: '版本' },
  { value: 'wrench', label: '维护' },
  { value: 'bug', label: '修复' },
  { value: 'shield', label: '安全' },
  { value: 'flame', label: '性能' },
  { value: 'brush', label: '设计' },
  { value: 'wand', label: '体验' },
  { value: 'cpu', label: '技术' },
  { value: 'layers', label: '架构' },
  { value: 'globe', label: '国际化' },
  { value: 'linechart', label: '增长' },
  { value: 'box', label: '组件' },
];

const findIcon = (icon: string) => ICON_MAP[icon] ?? Code2;

export function DynamicTagManager({
  tags,
  onChange,
  availableTags,
  onCreateTag,
  disabled = false,
  isSaving = false,
}: DynamicTagManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tagLabel, setTagLabel] = useState('');
  const [tagIcon, setTagIcon] = useState<(typeof ICON_OPTIONS)[number]['value']>('code2');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const IconPreview = useMemo(() => findIcon(tagIcon), [tagIcon]);

  const handleToggleTag = (tag: DynamicTagItem) => {
    const exists = tags.some((item) => item.id === tag.id);
    if (exists) {
      onChange(tags.filter((item) => item.id !== tag.id));
    } else {
      onChange([...tags, tag]);
    }
  };

  const handleRemoveTag = (id: string) => {
    onChange(tags.filter((tag) => tag.id !== id));
  };

  const handleCreateTag = async () => {
    const trimmedLabel = tagLabel.trim();
    if (!trimmedLabel || isSubmitting) return;

    setIsSubmitting(true);
    setCreateError(null);
    try {
      const created = await onCreateTag({ label: trimmedLabel, icon: tagIcon });
      onChange([...tags, created]);
      setTagLabel('');
      setTagIcon('code2');
      setIsDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '新增标签失败，请稍后再试';
      setCreateError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTagBadge = (tag: DynamicTagItem) => {
    const TagIcon = findIcon(tag.icon);
    return (
      <Badge
        key={tag.id}
        variant="secondary"
        className="flex items-center rounded-full px-3 py-1 text-xs sm:text-sm"
      >
        <TagIcon className="w-3 h-3 mr-1" />
        <span>{tag.label}</span>
        <button
          type="button"
          className="ml-1 text-muted-foreground transition hover:text-destructive"
          onClick={() => handleRemoveTag(tag.id)}
          aria-label={`删除标签 ${tag.label}`}
          disabled={disabled}
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map(renderTagBadge)}
        <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} disabled={disabled}>
          <Plus className="mr-1 h-4 w-4" /> 添加标签
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">快速选择已有标签</Label>
        <div className="flex flex-wrap gap-2">
          {availableTags.length === 0 && (
            <div className="rounded-md border border-dashed border-muted-foreground/40 px-3 py-2 text-xs text-muted-foreground">
              暂无已保存的标签，请先新增。
            </div>
          )}
          {availableTags.map((tag) => {
            const TagIcon = findIcon(tag.icon);
            const isActive = tags.some((item) => item.id === tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleToggleTag(tag)}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs sm:text-sm transition ${
                  isActive
                    ? 'border-primary/60 bg-primary/10 text-primary'
                    : 'border-muted-foreground/30 bg-background hover:border-primary/40 hover:text-primary'
                }`}
                disabled={disabled}
              >
                <TagIcon className="w-3 h-3 mr-1" />
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>新增动态标签</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dynamic-tag-label">标签名称</Label>
              <Input
                id="dynamic-tag-label"
                value={tagLabel}
                onChange={(event) => setTagLabel(event.target.value)}
                placeholder="例如：性能优化"
                disabled={disabled || isSaving || isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>标签图标</Label>
              <Select
                value={tagIcon}
                onValueChange={(value) => setTagIcon(value as DynamicTagItem['icon'])}
                disabled={disabled || isSaving || isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择一个图标" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-48">
                    {ICON_OPTIONS.map((option) => {
                      const OptionIcon = findIcon(option.value);
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <OptionIcon className="h-4 w-4" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border bg-muted/40 p-3">
              <div className="text-sm text-muted-foreground">预览</div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-sm shadow-sm">
                {IconPreview && <IconPreview className="w-4 h-4" />}
                <span>{tagLabel.trim() || '标签名称'}</span>
              </div>
            </div>
            {createError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                {createError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={disabled || isSaving || isSubmitting}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleCreateTag}
              disabled={!tagLabel.trim() || disabled || isSaving || isSubmitting}
            >
              {(isSaving || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
