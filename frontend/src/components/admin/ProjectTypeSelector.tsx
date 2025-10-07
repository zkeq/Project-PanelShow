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
import {
  Plus,
  Check,
  ChevronDown,
  Building2,
  User,
  Rocket,
  Monitor,
  Code,
  Palette,
  Database,
  Smartphone,
} from 'lucide-react';

export interface ProjectType {
  id: string;
  label: string;
  icon: string;
}


interface ProjectTypeSelectorProps {
  value: ProjectType | null;
  options: ProjectType[];
  onChange: (type: ProjectType | null) => void;
  onCreateOption?: (input: { label: string; icon: string }) => Promise<ProjectType> | ProjectType;
}

const iconOptions = [
  { name: 'Building2', component: Building2, label: '公司' },
  { name: 'User', component: User, label: '个人' },
  { name: 'Rocket', component: Rocket, label: '创业' },
  { name: 'Monitor', component: Monitor, label: '网站' },
  { name: 'Code', component: Code, label: '代码' },
  { name: 'Palette', component: Palette, label: '设计' },
  { name: 'Database', component: Database, label: '数据' },
  { name: 'Smartphone', component: Smartphone, label: '移动' },
];

function getIconComponent(iconName: string) {
  const icon = iconOptions.find((opt) => opt.name === iconName);
  return icon?.component || Building2;
}

export function ProjectTypeSelector({ value, options, onChange, onCreateOption }: ProjectTypeSelectorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newType, setNewType] = useState({
    label: '',
    icon: 'Building2',
  });
  const [adding, setAdding] = useState(false);

  const handleAddType = async () => {
    const trimmedLabel = newType.label.trim();
    if (!trimmedLabel) return;

    try {
      setAdding(true);
      let created: ProjectType;

      if (onCreateOption) {
        const result = await Promise.resolve(onCreateOption({
          label: trimmedLabel,
          icon: newType.icon,
        }));

        if (!result) {
          throw new Error('未获得新类型的返回数据');
        }

        created = result;
      } else {
        created = {
          id: `custom-${Date.now()}`,
          label: trimmedLabel,
          icon: newType.icon,
        };
      }

      onChange(created);
      setNewType({ label: '', icon: 'Building2' });
      setIsAddDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '添加类型失败，请稍后重试';
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
                  {(() => {
                    const IconComponent = getIconComponent(value.icon);
                    return <IconComponent className="w-4 h-4" />;
                  })()}
                  {value.label}
                </div>
              ) : (
                '选择项目类型'
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-2">
            <div className="space-y-1">
              {options.length === 0 && (
                <div className="px-2 py-2 text-xs text-muted-foreground">
                  暂无类型，请先创建一个。
                </div>
              )}

              {options.map((type) => {
                const IconComponent = getIconComponent(type.icon);
                return (
                  <button
                    key={type.id}
                    type="button"
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-accent rounded-sm"
                    onClick={() => onChange(type)}
                  >
                    <IconComponent className="w-4 h-4" />
                    {type.label}
                    {value?.id === type.id && <Check className="h-4 w-4 ml-auto" />}
                  </button>
                );
              })}

              <div className="border-t pt-2 mt-2">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-accent rounded-sm text-muted-foreground">
                      <Plus className="h-4 w-4" />
                      添加新类型
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>添加项目类型</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="type-label">类型名称</Label>
                        <Input
                          id="type-label"
                          value={newType.label}
                          onChange={(e) => setNewType((prev) => ({ ...prev, label: e.target.value }))}
                          placeholder="输入类型名称"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>选择图标</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {iconOptions.map((icon) => {
                            const IconComponent = icon.component;
                            return (
                              <button
                                key={icon.name}
                                type="button"
                                className={`flex flex-col items-center gap-1 p-2 rounded-md border-2 ${
                                  newType.icon === icon.name
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                                onClick={() => setNewType((prev) => ({ ...prev, icon: icon.name }))}
                              >
                                <IconComponent className="w-5 h-5" />
                                <span className="text-xs text-center">{icon.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 border rounded">
                        {(() => {
                          const IconComponent = getIconComponent(newType.icon);
                          return <IconComponent className="w-4 h-4" />;
                        })()}
                        <span className="text-sm">{newType.label || '预览'}</span>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          取消
                        </Button>
                        <Button
                          onClick={handleAddType}
                          disabled={!newType.label.trim() || adding}
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
