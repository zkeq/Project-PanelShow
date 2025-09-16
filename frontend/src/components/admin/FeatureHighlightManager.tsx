'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ColorfulTags } from './ColorfulTags';
import { ScreenshotManager } from './ScreenshotManager';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  X, 
  GripVertical, 
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
  Monitor,
  Smartphone
} from 'lucide-react';

interface ColorfulTag {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

interface Screenshot {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface FeatureHighlight {
  id: string;
  title: string;
  description: string;
  techStack: ColorfulTag[];
  screenshots: Screenshot[];
  previewUrl: string;
  mobilePreviewUrl?: string;
  leftMarkdown: string;
  rightMarkdown: string;
}

interface FeatureHighlightManagerProps {
  features: FeatureHighlight[];
  onChange: (features: FeatureHighlight[]) => void;
}

interface SortableFeatureItemProps {
  feature: FeatureHighlight;
  onUpdate: (id: string, updates: Partial<FeatureHighlight>) => void;
  onRemove: (id: string) => void;
}

function SortableFeatureItem({ feature, onUpdate, onRemove }: SortableFeatureItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: feature.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="flex gap-4">
            {/* 拖拽手柄 */}
            <div
              {...attributes}
              {...listeners}
              className="flex items-center justify-center w-8 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5" />
            </div>

            {/* 主要内容区域 */}
            <div className="flex-1 space-y-6">
              {/* 标题 */}
              <div className="space-y-2">
                <Label htmlFor={`title-${feature.id}`}>
                  <Sparkles className="inline h-4 w-4 mr-1" />
                  功能标题
                </Label>
                <Input
                  id={`title-${feature.id}`}
                  value={feature.title}
                  onChange={(e) => onUpdate(feature.id, { title: e.target.value })}
                  placeholder="输入特色功能标题"
                />
              </div>

              {/* 描述 */}
              <div className="space-y-2">
                <Label htmlFor={`description-${feature.id}`}>功能描述</Label>
                <Textarea
                  id={`description-${feature.id}`}
                  value={feature.description}
                  onChange={(e) => onUpdate(feature.id, { description: e.target.value })}
                  placeholder="详细描述这个功能的特点和优势"
                  rows={3}
                />
              </div>

              {/* 技术栈 */}
              <div className="space-y-2">
                <ColorfulTags
                  tags={feature.techStack}
                  onChange={(techStack) => onUpdate(feature.id, { techStack })}
                  label="技术栈"
                  placeholder="输入技术名称，按回车选择颜色"
                  maxTags={8}
                />
              </div>

              {/* 功能截图 */}
              <div className="space-y-2">
                <Label>功能截图</Label>
                <ScreenshotManager
                  screenshots={feature.screenshots}
                  onChange={(screenshots) => onUpdate(feature.id, { screenshots })}
                />
              </div>

              {/* 预览地址 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`preview-${feature.id}`}>
                    <Monitor className="inline h-4 w-4 mr-1" />
                    在线预览地址
                  </Label>
                  <Input
                    id={`preview-${feature.id}`}
                    type="url"
                    value={feature.previewUrl}
                    onChange={(e) => onUpdate(feature.id, { previewUrl: e.target.value })}
                    placeholder="https://example.com/demo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`mobile-preview-${feature.id}`}>
                    <Smartphone className="inline h-4 w-4 mr-1" />
                    移动端预览地址 (可选)
                  </Label>
                  <Input
                    id={`mobile-preview-${feature.id}`}
                    type="url"
                    value={feature.mobilePreviewUrl || ''}
                    onChange={(e) => onUpdate(feature.id, { mobilePreviewUrl: e.target.value })}
                    placeholder="https://m.example.com/demo"
                  />
                </div>
              </div>

              {/* Markdown 内容 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`left-md-${feature.id}`}>展示信息左侧栏 Markdown</Label>
                  <Textarea
                    id={`left-md-${feature.id}`}
                    value={feature.leftMarkdown}
                    onChange={(e) => onUpdate(feature.id, { leftMarkdown: e.target.value })}
                    placeholder="输入左侧栏展示的 Markdown 内容..."
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`right-md-${feature.id}`}>展示信息右侧栏 Markdown</Label>
                  <Textarea
                    id={`right-md-${feature.id}`}
                    value={feature.rightMarkdown}
                    onChange={(e) => onUpdate(feature.id, { rightMarkdown: e.target.value })}
                    placeholder="输入右侧栏展示的 Markdown 内容..."
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 删除按钮 */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(feature.id)}
              className="self-start text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FeatureHighlightManager({ features, onChange }: FeatureHighlightManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addFeature = () => {
    const newFeature: FeatureHighlight = {
      id: `feature-${Date.now()}`,
      title: '',
      description: '',
      techStack: [],
      screenshots: [],
      previewUrl: '',
      mobilePreviewUrl: '',
      leftMarkdown: '',
      rightMarkdown: ''
    };
    onChange([...features, newFeature]);
  };

  const updateFeature = (id: string, updates: Partial<FeatureHighlight>) => {
    onChange(
      features.map(feature =>
        feature.id === id ? { ...feature, ...updates } : feature
      )
    );
  };

  const removeFeature = (id: string) => {
    onChange(features.filter(feature => feature.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = features.findIndex(item => item.id === active.id);
      const newIndex = features.findIndex(item => item.id === over.id);

      onChange(arrayMove(features, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-6">
      {features.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">特色功能列表</Label>
            <span className="text-sm text-muted-foreground">
              拖拽左侧图标可调整顺序
            </span>
          </div>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={features.map(f => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {features.map((feature) => (
                  <SortableFeatureItem
                    key={feature.id}
                    feature={feature}
                    onUpdate={updateFeature}
                    onRemove={removeFeature}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* 添加新特色功能按钮 */}
      <Button
        type="button"
        onClick={addFeature}
        variant="outline"
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        添加特色功能
      </Button>

      {features.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>还没有添加任何特色功能</p>
          <p className="text-sm">点击上方按钮添加项目的特色功能介绍</p>
        </div>
      )}
    </div>
  );
}