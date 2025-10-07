'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Loader2, Plus } from 'lucide-react';

export interface DynamicTypeOption {
  id: string;
  label: string;
  color: string;
}

interface DynamicTypeSelectorProps {
  value: DynamicTypeOption | null;
  onChange: (value: DynamicTypeOption | null) => void;
  options: DynamicTypeOption[];
  onCreate: (payload: { label: string; color: string }) => Promise<DynamicTypeOption>;
  disabled?: boolean;
  isLoading?: boolean;
  isSaving?: boolean;
}

const buildColorPalette = () => [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#22c55e',
  '#06b6d4',
  '#0ea5e9',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#facc15',
  '#14b8a6',
  '#64748b',
];

export function DynamicTypeSelector({
  value,
  onChange,
  options,
  onCreate,
  disabled = false,
  isLoading = false,
  isSaving = false,
}: DynamicTypeSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('#22c55e');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colorPalette = useMemo(() => buildColorPalette(), []);

  const handleCreateType = async () => {
    const trimmedLabel = newTypeLabel.trim();
    if (!trimmedLabel || isSubmitting) return;

    setIsSubmitting(true);
    setCreateError(null);
    try {
      const created = await onCreate({ label: trimmedLabel, color: newTypeColor });
      onChange(created);
      setIsDialogOpen(false);
      setNewTypeLabel('');
    } catch (error) {
      const message = error instanceof Error ? error.message : '新增动态类型失败，请稍后再试';
      setCreateError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLabel = value ? (
    <span className="flex items-center gap-2">
      <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: value.color }} />
      <span>{value.label}</span>
    </span>
  ) : (
    <span className="text-muted-foreground">选择动态类型</span>
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-medium text-muted-foreground">动态类型</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-1"
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
          新增类型
        </Button>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
            disabled={disabled || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                正在加载类型...
              </span>
            ) : (
              <>
                {selectedLabel}
                <ChevronDown className="h-4 w-4 opacity-70" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-2">
          <div className="space-y-1">
            {options.length === 0 && (
              <div className="rounded-md border border-dashed border-muted-foreground/40 px-3 py-6 text-center text-xs text-muted-foreground">
                暂无可用类型，请先新增一个类型。
              </div>
            )}
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition hover:bg-accent"
              >
                <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: option.color }} />
                <span>{option.label}</span>
                {value?.id === option.id && (
                  <Badge variant="secondary" className="ml-auto">
                    当前
                  </Badge>
                )}
              </button>
            ))}
            <div className="pt-2 text-xs text-muted-foreground">
              新增的类型会自动保存到设置中，可在全局复用。
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {value && (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)} disabled={disabled}>
            清除选择
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>新增动态类型</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dynamic-type-label">类型名称</Label>
              <Input
                id="dynamic-type-label"
                value={newTypeLabel}
                onChange={(event) => setNewTypeLabel(event.target.value)}
                placeholder="例如：紧急修复"
                disabled={isSaving || isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>标识颜色</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="color"
                  value={newTypeColor}
                  onChange={(event) => setNewTypeColor(event.target.value)}
                  className="h-10 w-16 p-1"
                  disabled={isSaving || isSubmitting}
                />
                <div className="grid flex-1 grid-cols-6 gap-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`选择颜色 ${color}`}
                      onClick={() => setNewTypeColor(color)}
                      className={`h-9 rounded-md border ${
                        newTypeColor === color ? 'border-ring ring-2 ring-ring' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      disabled={isSaving || isSubmitting}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-md border bg-muted/40 p-3">
                <div className="text-sm text-muted-foreground">效果预览</div>
                <div
                  className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
                  style={{ backgroundColor: `${newTypeColor}1a`, color: newTypeColor }}
                >
                  <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: newTypeColor }} />
                  <span>{newTypeLabel.trim() || '类型名称'}</span>
                </div>
              </div>
            </div>
            {createError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                {createError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving || isSubmitting}>
              取消
            </Button>
            <Button
              type="button"
              onClick={handleCreateType}
              disabled={!newTypeLabel.trim() || isSaving || isSubmitting}
            >
              {(isSaving || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认新增
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
