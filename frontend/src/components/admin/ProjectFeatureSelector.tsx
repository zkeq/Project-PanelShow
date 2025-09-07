'use client';

import { useState } from 'react';
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
  TrendingUp
} from 'lucide-react';

interface ProjectFeature {
  id: string;
  label: string;
  color: string;
  icon: string;
}

interface ProjectFeatureSelectorProps {
  features: ProjectFeature[];
  onChange: (features: ProjectFeature[]) => void;
}

const defaultFeatures: ProjectFeature[] = [
  { id: 'performance', label: '高性能', color: 'bg-green-500', icon: 'Zap' },
  { id: 'security', label: '安全可靠', color: 'bg-blue-500', icon: 'Shield' },
  { id: 'modern', label: '现代化', color: 'bg-purple-500', icon: 'Sparkles' },
];

const colorOptions = [
  'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
  'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
  'bg-gray-500', 'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500'
];

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
  const icon = iconOptions.find(opt => opt.name === iconName);
  return icon?.component || Zap;
}

export function ProjectFeatureSelector({ features, onChange }: ProjectFeatureSelectorProps) {
  const [availableFeatures, setAvailableFeatures] = useState<ProjectFeature[]>(defaultFeatures);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFeature, setNewFeature] = useState({
    label: '',
    color: 'bg-blue-500',
    icon: 'Zap'
  });

  const addFeature = (feature: ProjectFeature) => {
    if (!features.find(f => f.id === feature.id)) {
      onChange([...features, feature]);
    }
  };

  const removeFeature = (featureId: string) => {
    onChange(features.filter(f => f.id !== featureId));
  };

  const handleAddCustomFeature = () => {
    if (!newFeature.label.trim()) return;
    
    const feature: ProjectFeature = {
      id: `custom-${Date.now()}`,
      label: newFeature.label.trim(),
      color: newFeature.color,
      icon: newFeature.icon
    };
    
    setAvailableFeatures(prev => [...prev, feature]);
    addFeature(feature);
    setNewFeature({ label: '', color: 'bg-blue-500', icon: 'Zap' });
    setIsAddDialogOpen(false);
  };

  const unselectedFeatures = availableFeatures.filter(
    af => !features.find(f => f.id === af.id)
  );

  return (
    <div className="space-y-4">
      {/* 已选择的特性 */}
      {features.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {features.map((feature) => {
              const IconComponent = getIconComponent(feature.icon);
              return (
                <Badge 
                  key={feature.id}
                  className="flex items-center gap-1 px-2 py-1 text-white"
                  style={{ backgroundColor: feature.color.replace('bg-', '').replace('-500', '') === 'red' ? '#ef4444' :
                    feature.color.replace('bg-', '').replace('-500', '') === 'orange' ? '#f97316' :
                    feature.color.replace('bg-', '').replace('-500', '') === 'yellow' ? '#eab308' :
                    feature.color.replace('bg-', '').replace('-500', '') === 'green' ? '#22c55e' :
                    feature.color.replace('bg-', '').replace('-500', '') === 'blue' ? '#3b82f6' :
                    feature.color.replace('bg-', '').replace('-500', '') === 'indigo' ? '#6366f1' :
                    feature.color.replace('bg-', '').replace('-500', '') === 'purple' ? '#a855f7' :
                    feature.color.replace('bg-', '').replace('-500', '') === 'pink' ? '#ec4899' :
                    feature.color.replace('bg-', '').replace('-500', '') === 'gray' ? '#6b7280' :
                    feature.color.replace('bg-', '').replace('-500', '') === 'cyan' ? '#06b6d4' :
                    feature.color.replace('bg-', '').replace('-500', '') === 'teal' ? '#14b8a6' :
                    feature.color.replace('bg-', '').replace('-500', '') === 'emerald' ? '#10b981' : '#3b82f6'
                  }}
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

      {/* 可选择的特性 */}
      {unselectedFeatures.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {unselectedFeatures.map((feature) => {
              const IconComponent = getIconComponent(feature.icon);
              return (
                <Button
                  key={feature.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addFeature(feature)}
                  className="flex items-center gap-1"
                >
                  <div className={`w-3 h-3 rounded-full ${feature.color}`} />
                  <IconComponent className="h-3 w-3" />
                  {feature.label}
                  <Plus className="h-3 w-3" />
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* 添加自定义特性 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="dashed" className="w-full">
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
                onChange={(e) => setNewFeature(prev => ({ ...prev, label: e.target.value }))}
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
                    onClick={() => setNewFeature(prev => ({ ...prev, color }))}
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
                      onClick={() => setNewFeature(prev => ({ ...prev, icon: icon.name }))}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-xs text-center">{icon.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
              <div className={`w-3 h-3 rounded-full ${newFeature.color}`} />
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
              <Button onClick={handleAddCustomFeature} disabled={!newFeature.label.trim()}>
                添加特性
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}