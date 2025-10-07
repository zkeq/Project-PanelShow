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
  type LucideIcon,
} from 'lucide-react';
import { X, Plus } from 'lucide-react';

export interface DynamicTagItem {
  id: string;
  label: string;
  icon: keyof typeof ICON_MAP;
}

interface DynamicTagManagerProps {
  tags: DynamicTagItem[];
  onChange: (tags: DynamicTagItem[]) => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
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

export function DynamicTagManager({ tags, onChange }: DynamicTagManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tagLabel, setTagLabel] = useState('');
  const [tagIcon, setTagIcon] = useState<(typeof ICON_OPTIONS)[number]['value']>('sparkles');

  const IconPreview = useMemo(() => ICON_MAP[tagIcon], [tagIcon]);

  const handleAddTag = () => {
    const trimmedLabel = tagLabel.trim();
    if (!trimmedLabel) return;

    const newTag: DynamicTagItem = {
      id: `tag-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      label: trimmedLabel,
      icon: tagIcon,
    };

    onChange([...tags, newTag]);
    setTagLabel('');
    setTagIcon('sparkles');
    setIsDialogOpen(false);
  };

  const handleRemoveTag = (id: string) => {
    onChange(tags.filter((tag) => tag.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const TagIcon = ICON_MAP[tag.icon] ?? Sparkles;
          return (
            <Badge
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1 rounded-full px-3 py-1 text-sm"
            >
              <TagIcon className="h-3.5 w-3.5" />
              <span>{tag.label}</span>
              <button
                type="button"
                className="ml-1 text-muted-foreground transition hover:text-destructive"
                onClick={() => handleRemoveTag(tag.id)}
                aria-label={`删除标签 ${tag.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
        <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> 添加标签
        </Button>
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
              />
            </div>
            <div className="space-y-2">
              <Label>标签图标</Label>
              <Select value={tagIcon} onValueChange={(value) => setTagIcon(value as DynamicTagItem['icon'])}>
                <SelectTrigger>
                  <SelectValue placeholder="选择一个图标" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-48">
                    {ICON_OPTIONS.map((option) => {
                      const OptionIcon = ICON_MAP[option.value] ?? Sparkles;
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
                {IconPreview && <IconPreview className="h-4 w-4" />}
                <span>{tagLabel.trim() || '标签名称'}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={handleAddTag} disabled={!tagLabel.trim()}>
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
