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
  Smartphone
} from 'lucide-react';

interface ProjectType {
  id: string;
  label: string;
  icon: string;
}

interface ProjectTypeSelectorProps {
  value: ProjectType | null;
  onChange: (type: ProjectType | null) => void;
}

const defaultTypes: ProjectType[] = [
  { id: 'company', label: '公司项目', icon: 'Building2' },
  { id: 'personal', label: '个人项目', icon: 'User' },
  { id: 'startup', label: '创业项目', icon: 'Rocket' },
];

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
  const icon = iconOptions.find(opt => opt.name === iconName);
  return icon?.component || Building2;
}

export function ProjectTypeSelector({ value, onChange }: ProjectTypeSelectorProps) {
  const [types, setTypes] = useState<ProjectType[]>(defaultTypes);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newType, setNewType] = useState({
    label: '',
    icon: 'Building2'
  });

  const handleAddType = () => {
    if (!newType.label.trim()) return;
    
    const type: ProjectType = {
      id: `custom-${Date.now()}`,
      label: newType.label.trim(),
      icon: newType.icon
    };
    
    setTypes(prev => [...prev, type]);
    setNewType({ label: '', icon: 'Building2' });
    setIsAddDialogOpen(false);
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
              {types.map((type) => {
                const IconComponent = getIconComponent(type.icon);
                return (
                  <button
                    key={type.id}
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
                          onChange={(e) => setNewType(prev => ({ ...prev, label: e.target.value }))}
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
                                onClick={() => setNewType(prev => ({ ...prev, icon: icon.name }))}
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
                        <Button onClick={handleAddType} disabled={!newType.label.trim()}>
                          添加
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