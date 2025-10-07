'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
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
  AlertCircle
} from 'lucide-react';

interface Screenshot {
  id: string;
  name: string;
  description: string;
  url: string;
}

interface ScreenshotManagerProps {
  screenshots: Screenshot[];
  onChange: (screenshots: Screenshot[]) => void;
  onUpload?: (file: File) => Promise<{ url: string; name?: string }>;
}

interface SortableScreenshotItemProps {
  screenshot: Screenshot;
  onUpdate: (id: string, field: keyof Screenshot, value: string) => void;
  onRemove: (id: string) => void;
}

function SortableScreenshotItem({ screenshot, onUpdate, onRemove }: SortableScreenshotItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: screenshot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <Card className="p-4">
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

            {/* 表单区域 */}
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <Label htmlFor={`name-${screenshot.id}`}>图片名称</Label>
                <Input
                  id={`name-${screenshot.id}`}
                  value={screenshot.name}
                  onChange={(e) => onUpdate(screenshot.id, 'name', e.target.value)}
                  placeholder="输入图片名称"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${screenshot.id}`}>图片描述</Label>
                <Textarea
                  id={`description-${screenshot.id}`}
                  value={screenshot.description}
                  onChange={(e) => onUpdate(screenshot.id, 'description', e.target.value)}
                  placeholder="描述这张图片展示的内容"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`url-${screenshot.id}`}>图片地址</Label>
                <Input
                  id={`url-${screenshot.id}`}
                  type="url"
                  value={screenshot.url}
                  onChange={(e) => {
                    onUpdate(screenshot.id, 'url', e.target.value);
                    setImageError(false);
                    setImageLoading(true);
                  }}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* 预览区域 */}
            <div className="w-48 space-y-2">
              <Label>预览</Label>
              <div className="w-full border-2 border-dashed border-border rounded-lg bg-muted/30 relative overflow-hidden">
                {/* 图片预览 */}
                <div className="w-full h-32 flex items-center justify-center relative overflow-hidden">
                  {screenshot.url ? (
                    <>
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                        </div>
                      )}
                      {imageError ? (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                          <AlertCircle className="h-6 w-6" />
                          <span className="text-xs text-center">加载失败</span>
                        </div>
                      ) : (
                        <img
                          src={screenshot.url}
                          alt={screenshot.name || '预览图片'}
                          className="w-full h-full object-cover"
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                          style={{ display: imageLoading ? 'none' : 'block' }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-xs text-center">输入图片地址</span>
                    </div>
                  )}
                </div>
                
                {/* 底部信息展示 */}
                {screenshot.url && !imageError && (
                  <div className="px-3 py-2 bg-background/90 backdrop-blur-sm border-t border-border">
                    <div className="text-xs font-medium text-foreground truncate" title={screenshot.name || '未命名'}>
                      {screenshot.name || '未命名'}
                    </div>
                    {screenshot.description && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2" title={screenshot.description}>
                        {screenshot.description}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 删除按钮 */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(screenshot.id)}
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


export function ScreenshotManager({ screenshots, onChange, onUpload }: ScreenshotManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const generateId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `screenshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  };

  const addScreenshot = () => {
    const newScreenshot: Screenshot = {
      id: generateId(),
      name: '',
      description: '',
      url: ''
    };
    onChange([...screenshots, newScreenshot]);
  };

  const updateScreenshot = (id: string, field: keyof Screenshot, value: string) => {
    onChange(
      screenshots.map(screenshot =>
        screenshot.id === id ? { ...screenshot, [field]: value } : screenshot
      )
    );
  };

  const removeScreenshot = (id: string) => {
    onChange(screenshots.filter(screenshot => screenshot.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = screenshots.findIndex(item => item.id === active.id);
      const newIndex = screenshots.findIndex(item => item.id === over.id);

      onChange(arrayMove(screenshots, oldIndex, newIndex));
    }
  };

  const handleUploadResult = (file: File, result: { url: string; name?: string }) => {
    const newScreenshot: Screenshot = {
      id: generateId(),
      name: result.name || file.name || '未命名图片',
      description: '',
      url: result.url,
    };
    onChange([...screenshots, newScreenshot]);
  };

  const uploadFile = async (file: File) => {
    if (!onUpload) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const result = await onUpload(file);
      handleUploadResult(file, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : '上传失败，请重试';
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      await uploadFile(file);
    }
    event.target.value = '';
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    if (!onUpload) return;
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (onUpload) {
      event.preventDefault();
    }
  };

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {onUpload && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground transition-colors ${
            isUploading ? 'opacity-70' : 'hover:border-primary/60 hover:text-foreground'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <ImageIcon className="h-10 w-10" />
          <div className="text-center space-y-1">
            <p>{isUploading ? '图片上传中，请稍候…' : '拖拽图片到此处，或点击下方按钮上传图片'}</p>
            <Button type="button" variant="secondary" size="sm" onClick={triggerFileDialog} disabled={isUploading}>
              选择图片
            </Button>
          </div>
          {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
        </div>
      )}

      {screenshots.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">截图列表</Label>
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
              items={screenshots.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {screenshots.map((screenshot) => (
                  <SortableScreenshotItem
                    key={screenshot.id}
                    screenshot={screenshot}
                    onUpdate={updateScreenshot}
                    onRemove={removeScreenshot}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* 添加新截图按钮 */}
      <Button
        type="button"
        onClick={addScreenshot}
        variant="outline"
        className="w-full border-dashed"
        disabled={isUploading}
      >
        <Plus className="h-4 w-4 mr-2" />
        添加截图
      </Button>

      {screenshots.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>还没有添加任何截图</p>
          <p className="text-sm">{onUpload ? '可上传图片或手动添加截图信息' : '点击上方按钮添加项目截图'}</p>
        </div>
      )}
    </div>
  );
}
