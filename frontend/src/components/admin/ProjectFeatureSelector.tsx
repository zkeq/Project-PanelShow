'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Plus,
  X,
  Zap,
  Shield,
  Sparkles,
  Rocket,
  Users,
  Globe,
  Smartphone,
  Code,
  Palette,
  Database,
  Settings,
  TrendingUp,
} from 'lucide-react';

export interface ProjectFeature {
  id: string;
  label: string;
  color: string;
  icon: string;
}


interface ProjectFeatureSelectorProps {
  features: ProjectFeature[];
  options: ProjectFeature[];
  onChange: (features: ProjectFeature[]) => void;
  onCreateOption?: (
    input: { label: string; color: string; icon: string }
  ) => Promise<ProjectFeature> | ProjectFeature;
}

const colorOptions = [
  'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
  'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
  'bg-gray-500', 'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500'
];

const colorHexMap: Record<string, string> = {
  'bg-red-500': '#ef4444',
  'bg-orange-500': '#f97316',
  'bg-yellow-500': '#eab308',
  'bg-green-500': '#22c55e',
  'bg-blue-500': '#3b82f6',
  'bg-indigo-500': '#6366f1',
  'bg-purple-500': '#a855f7',
  'bg-pink-500': '#ec4899',
  'bg-gray-500': '#6b7280',
  'bg-cyan-500': '#06b6d4',
  'bg-teal-500': '#14b8a6',
  'bg-emerald-500': '#10b981',
};

const iconOptions = [
  { name: 'Zap', component: Zap, label: '闪电' },
  { name: 'Shield', component: Shield, label: '盾牌' },
  { name: 'Sparkles', component: Sparkles, label: '星光' },
  { name: 'Rocket', component: Rocket, label: '火箭' },
  { name: 'Users', component: Users, label: '用户' },
  { name: 'Globe', component: Globe, label: '全球' },
  { name: 'Smartphone', component: Smartphone, label: '手机' },
  { name: 'Code', component: Code, label: '代码' },
  { name: 'Palette', component: Palette, label: '调色板' },
  { name: 'Database', component: Database, label: '数据库' },
  { name: 'Settings', component: Settings, label: '设置' },
  { name: 'TrendingUp', component: TrendingUp, label: '趋势' },
];

function getIconComponent(iconName: string) {
  const icon = iconOptions.find((opt) => opt.name === iconName);
  return icon?.component || Zap;
}

function getColorHex(color: string) {
  return colorHexMap[color] ?? '#3b82f6';
}

export function ProjectFeatureSelector({ features, options, onChange, onCreateOption }: ProjectFeatureSelectorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFeature, setNewFeature] = useState({
    label: '',
    color: 'bg-blue-500',
    icon: 'Zap',
  });
  const [adding, setAdding] = useState(false);

  const unselectedFeatures = useMemo(
    () => options.filter((option) => !features.some((feature) => feature.id === option.id)),
    [features, options]
  );

  const addFeature = (feature: ProjectFeature) => {
    if (!features.some((item) => item.id === feature.id)) {
      onChange([...features, feature]);
    }
  };

  const removeFeature = (featureId: string) => {
    onChange(features.filter((feature) => feature.id !== featureId));
  };

  const handleAddCustomFeature = async () => {
    const trimmedLabel = newFeature.label.trim();
    if (!trimmedLabel) return;

    try {
      setAdding(true);
      let created: ProjectFeature;

      if (onCreateOption) {
        const result = await Promise.resolve(onCreateOption({
          label: trimmedLabel,
          color: newFeature.color,
          icon: newFeature.icon,
        }));

        if (!result) {
          throw new Error('未获得新特性的返回数据');
        }

        created = result;
      } else {
        created = {
          id: `custom-${Date.now()}`,
          label: trimmedLabel,
          color: newFeature.color,
          icon: newFeature.icon,
        };
      }

      addFeature(created);
      setNewFeature({ label: '', color: 'bg-blue-500', icon: 'Zap' });
      setIsAddDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '添加特性失败，请稍后重试';
      alert(message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      {features.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {features.map((feature) => {
              const IconComponent = getIconComponent(feature.icon);
              const backgroundColor = getColorHex(feature.color);
              return (
                <Badge
                  key={feature.id}
                  className="flex items-center gap-1 px-2 py-1 text-white"
                  style={{ backgroundColor }}
                >
                  <IconComponent className="h-3 w-3" />
                  {feature.label}
                  <button
                    type="button"
                    onClick={() => removeFeature(feature.id)}
                    className="ml-1 hover:text-red-200 transition-colors"
                    aria-label={`删除特性 ${feature.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {unselectedFeatures.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {unselectedFeatures.map((feature) => {
              const IconComponent = getIconComponent(feature.icon);
              const backgroundColor = getColorHex(feature.color);
              return (
                <Button
                  key={feature.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addFeature(feature)}
                  className="flex items-center gap-1"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor }}
                  />
                  <IconComponent className="h-3 w-3" />
                  {feature.label}
                  <Plus className="h-3 w-3" />
                </Button>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" className="w-full border-dashed border-2 hover:bg-muted/50">
            <Plus className="h-4 w-4 mr-2" />
            添加自定义特性
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加项目特性</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feature-label">特性名称</Label>
              <Input
                id="feature-label"
                value={newFeature.label}
                onChange={(e) => setNewFeature((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="输入特性名称"
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
                      newFeature.color === color ? 'border-foreground' : 'border-border'
                    }`}
                    onClick={() => setNewFeature((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
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
                        newFeature.icon === icon.name
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setNewFeature((prev) => ({ ...prev, icon: icon.name }))}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-xs text-center">{icon.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getColorHex(newFeature.color) }}
              />
              {(() => {
                const IconComponent = getIconComponent(newFeature.icon);
                return <IconComponent className="w-4 h-4" />;
              })()}
              <span className="text-sm font-medium">{newFeature.label || '预览特性'}</span>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                取消
              </Button>
              <Button
                onClick={handleAddCustomFeature}
                disabled={!newFeature.label.trim() || adding}
              >
                {adding ? '添加中…' : '添加特性'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
