'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { ChevronDown, Plus } from 'lucide-react';

export interface DynamicTypeOption {
  id: string;
  label: string;
  color: string;
}

interface DynamicTypeSelectorProps {
  value: DynamicTypeOption | null;
  onChange: (value: DynamicTypeOption | null) => void;
  storageKey?: string;
}

const DEFAULT_DYNAMIC_TYPES: DynamicTypeOption[] = [
  { id: 'feature', label: '新功能', color: '#22c55e' },
  { id: 'refactor', label: '重构', color: '#6366f1' },
];

const DEFAULT_STORAGE_KEY = 'panelshow-admin-dynamic-types';

const parseStoredOptions = (raw: unknown): DynamicTypeOption[] => {
  if (!Array.isArray(raw)) return DEFAULT_DYNAMIC_TYPES;

  const seen = new Set<string>();
  const mapped: DynamicTypeOption[] = [];

  raw.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) return;
    const record = item as Record<string, unknown>;
    const label = typeof record.label === 'string' ? record.label.trim() : '';
    if (!label) return;

    const color = typeof record.color === 'string' ? record.color : '#3b82f6';
    const providedId = typeof record.id === 'string' ? record.id.trim() : '';
    const fallbackId = label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `type-${index + 1}`;
    let candidate = providedId || fallbackId;
    let counter = 1;
    while (!candidate || seen.has(candidate)) {
      candidate = `${fallbackId}-${counter++}`;
    }
    seen.add(candidate);

    mapped.push({ id: candidate, label, color });
  });

  return mapped.length > 0 ? mapped : DEFAULT_DYNAMIC_TYPES;
};

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
  storageKey = DEFAULT_STORAGE_KEY,
}: DynamicTypeSelectorProps) {
  const [options, setOptions] = useState<DynamicTypeOption[]>(DEFAULT_DYNAMIC_TYPES);
  const [hydrated, setHydrated] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('#22c55e');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) {
        setOptions(DEFAULT_DYNAMIC_TYPES);
        return;
      }
      const parsed = JSON.parse(stored);
      setOptions(parseStoredOptions(parsed));
    } catch (error) {
      console.warn('Failed to read dynamic type options from storage', error);
      setOptions(DEFAULT_DYNAMIC_TYPES);
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(options));
    } catch (error) {
      console.warn('Failed to persist dynamic type options', error);
    }
  }, [options, hydrated, storageKey]);

  const colorPalette = useMemo(() => buildColorPalette(), []);

  const handleCreateType = () => {
    const trimmedLabel = newTypeLabel.trim();
    if (!trimmedLabel) return;

    const baseId = trimmedLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `type-${Date.now()}`;
    let candidate = baseId;
    let counter = 1;
    while (options.some((option) => option.id === candidate)) {
      candidate = `${baseId}-${counter++}`;
    }

    const created: DynamicTypeOption = {
      id: candidate,
      label: trimmedLabel,
      color: newTypeColor,
    };

    setOptions((prev) => [...prev, created]);
    onChange(created);
    setIsDialogOpen(false);
    setNewTypeLabel('');
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
          >
            {selectedLabel}
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-2">
          <div className="space-y-1">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
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
              新增的类型会保存在本地，在整个管理台内复用。
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {value && (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
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
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-md border bg-muted/40 p-3">
                <div className="text-sm text-muted-foreground">效果预览</div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: `${newTypeColor}1a`, color: newTypeColor }}>
                  <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: newTypeColor }} />
                  <span>{newTypeLabel.trim() || '类型名称'}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={handleCreateType} disabled={!newTypeLabel.trim()}>
              确认新增
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
