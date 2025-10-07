'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Check, ChevronDown } from 'lucide-react';

export interface ProjectStatus {
  id: string;
  label: string;
  color: string;
}


interface ProjectStatusSelectorProps {
  value: ProjectStatus | null;
  options: ProjectStatus[];
  onChange: (status: ProjectStatus | null) => void;
  onCreateOption?: (input: { label: string; color: string }) => Promise<ProjectStatus> | ProjectStatus;
}

const colorOptions = [
  'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
  'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
  'bg-gray-500', 'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500'
];

export function ProjectStatusSelector({ value, options, onChange, onCreateOption }: ProjectStatusSelectorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState({
    label: '',
    color: 'bg-blue-500'
  });
  const [adding, setAdding] = useState(false);

  const handleAddStatus = async () => {
    const trimmedLabel = newStatus.label.trim();
    if (!trimmedLabel) return;

    try {
      setAdding(true);
      let created: ProjectStatus;

      if (onCreateOption) {
        const result = await Promise.resolve(onCreateOption({
          label: trimmedLabel,
          color: newStatus.color,
        }));

        if (!result) {
          throw new Error('未获得新状态的返回数据');
        }

        created = result;
      } else {
        created = {
          id: `custom-${Date.now()}`,
          label: trimmedLabel,
          color: newStatus.color,
        };
      }

      onChange(created);
      setNewStatus({ label: '', color: 'bg-blue-500' });
      setIsAddDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '添加状态失败，请稍后重试';
      alert(message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between min-w-[200px]">
              {value ? (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${value.color}`} />
                  {value.label}
                </div>
              ) : (
                '选择项目状态'
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-2">
            <div className="space-y-1">
              {options.length === 0 && (
                <div className="px-2 py-2 text-xs text-muted-foreground">
                  暂无状态，请先创建一个。
                </div>
              )}

              {options.map((status) => (
                <button
                  key={status.id}
                  type="button"
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-accent rounded-sm"
                  onClick={() => onChange(status)}
                >
                  <div className={`w-3 h-3 rounded-full ${status.color}`} />
                  {status.label}
                  {value?.id === status.id && <Check className="h-4 w-4 ml-auto" />}
                </button>
              ))}

              <div className="border-t pt-2 mt-2">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-accent rounded-sm text-muted-foreground">
                      <Plus className="h-4 w-4" />
                      添加新状态
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>添加项目状态</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="status-label">状态名称</Label>
                        <Input
                          id="status-label"
                          value={newStatus.label}
                          onChange={(e) => setNewStatus((prev) => ({ ...prev, label: e.target.value }))}
                          placeholder="输入状态名称"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>选择颜色</Label>
                        <div className="grid grid-cols-6 gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-8 h-8 rounded-full ${color} border-2 ${
                                newStatus.color === color ? 'border-foreground' : 'border-border'
                              }`}
                              onClick={() => setNewStatus((prev) => ({ ...prev, color }))}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${newStatus.color}`} />
                        <span className="text-sm">{newStatus.label || '预览'}</span>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          取消
                        </Button>
                        <Button
                          onClick={handleAddStatus}
                          disabled={!newStatus.label.trim() || adding}
                        >
                          {adding ? '添加中…' : '添加'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
          >
            清除
          </Button>
        )}
      </div>
    </div>
  );
}
