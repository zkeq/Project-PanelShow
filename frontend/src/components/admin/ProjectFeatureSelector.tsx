'use client';

import { useMemo, useState } from 'react';
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
import { cn } from '@/lib/utils';
import {
  computeFeatureChipVisuals,
  DEFAULT_FEATURE_CHIP_PRESET_ID,
  FEATURE_CHIP_PRESET_LIST,
  type FeatureChipAppearance,
  type FeatureChipPresetId,
} from '@/lib/feature-chips';

export interface ProjectFeature {
  id: string;
  label: string;
  icon: string;
  color?: string;
  appearance?: FeatureChipAppearance;
}

interface ProjectFeatureSelectorProps {
  features: ProjectFeature[];
  options: ProjectFeature[];
  onChange: (features: ProjectFeature[]) => void;
  onCreateOption?: (
    input: { label: string; presetId: FeatureChipPresetId; icon: string }
  ) => Promise<ProjectFeature> | ProjectFeature;
}

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

function FeatureChipPreview({
  feature,
  placeholderLabel = '特性预览',
  className,
  iconSize = 'h-3.5 w-3.5',
}: {
  feature: ProjectFeature;
  placeholderLabel?: string;
  className?: string;
  iconSize?: string;
}) {
  const IconComponent = getIconComponent(feature.icon);
  const visuals = computeFeatureChipVisuals(feature);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-all backdrop-blur-sm',
        visuals.containerClass,
        className,
      )}
    >
      <IconComponent className={cn(iconSize, visuals.iconClass)} />
      <span className={cn('leading-none', visuals.labelClass)}>
        {feature.label || placeholderLabel}
      </span>
    </span>
  );
}

export function ProjectFeatureSelector({ features, options, onChange, onCreateOption }: ProjectFeatureSelectorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFeature, setNewFeature] = useState({
    label: '',
    presetId: DEFAULT_FEATURE_CHIP_PRESET_ID as FeatureChipPresetId,
    icon: 'Sparkles',
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
          presetId: newFeature.presetId,
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
          icon: newFeature.icon,
          appearance: { presetId: newFeature.presetId },
        };
      }

      addFeature(created);
      setNewFeature({ label: '', presetId: DEFAULT_FEATURE_CHIP_PRESET_ID, icon: 'Sparkles' });
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
          <Label className="text-sm font-medium text-muted-foreground">已选特性</Label>
          <div className="flex flex-wrap gap-2">
            {features.map((feature) => {
              const IconComponent = getIconComponent(feature.icon);
              const visuals = computeFeatureChipVisuals(feature);
              return (
                <span
                  key={feature.id}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-all backdrop-blur-sm',
                    visuals.containerClass,
                  )}
                >
                  <IconComponent className={cn('h-3.5 w-3.5', visuals.iconClass)} />
                  <span className={cn('leading-none', visuals.labelClass)}>{feature.label}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(feature.id)}
                    className="ml-1 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={`删除特性 ${feature.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {unselectedFeatures.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">可选特性</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {unselectedFeatures.map((feature) => {
              const IconComponent = getIconComponent(feature.icon);
              const visuals = computeFeatureChipVisuals(feature);
              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => addFeature(feature)}
                  className="group flex items-center justify-between rounded-2xl border border-dashed border-muted-foreground/30 p-3 text-left transition-all hover:border-primary/50 hover:bg-muted/40"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-all backdrop-blur-sm',
                        visuals.containerClass,
                      )}
                    >
                      <IconComponent className={cn('h-3.5 w-3.5', visuals.iconClass)} />
                      <span className={cn('leading-none', visuals.labelClass)}>{feature.label}</span>
                    </span>
                  </span>
                  <Plus className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                </button>
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
              <Label>选择配色风格</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {FEATURE_CHIP_PRESET_LIST.map((preset) => {
                  const previewFeature: ProjectFeature = {
                    id: preset.id,
                    label: newFeature.label,
                    icon: newFeature.icon,
                    appearance: { presetId: preset.id },
                  };

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setNewFeature((prev) => ({ ...prev, presetId: preset.id }))}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all',
                        newFeature.presetId === preset.id
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-transparent bg-muted/20 hover:border-primary/40 hover:bg-muted/40',
                      )}
                    >
                      <FeatureChipPreview
                        feature={previewFeature}
                        placeholderLabel={preset.label}
                        className="text-[0.8rem]"
                      />
                      <span className="text-xs text-muted-foreground">{preset.label}</span>
                    </button>
                  );
                })}
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
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-md border-2 p-2 text-xs transition-colors',
                        newFeature.icon === icon.name
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40',
                      )}
                      onClick={() => setNewFeature((prev) => ({ ...prev, icon: icon.name }))}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-xs text-muted-foreground">{icon.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>预览效果</Label>
              <FeatureChipPreview
                feature={{
                  id: 'preview',
                  label: newFeature.label,
                  icon: newFeature.icon,
                  appearance: { presetId: newFeature.presetId },
                }}
                placeholderLabel="特性预览"
                className="text-sm"
                iconSize="h-4 w-4"
              />
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
