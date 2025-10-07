'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, X, MoveVertical } from 'lucide-react';

export interface DynamicImageAsset {
  id: string;
  file: File;
  preview: string;
}

interface DynamicImageManagerProps {
  images: DynamicImageAsset[];
  onChange: (images: DynamicImageAsset[]) => void;
}

export function DynamicImageManager({ images, onChange }: DynamicImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<DynamicImageAsset[]>(images);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, []);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const nextImages: DynamicImageAsset[] = [];
      Array.from(fileList).forEach((file) => {
        const preview = URL.createObjectURL(file);
        nextImages.push({
          id: `image-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          file,
          preview,
        });
      });
      onChange([...images, ...nextImages]);
    },
    [images, onChange]
  );

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleRemove = (id: string) => {
    const image = images.find((item) => item.id === id);
    if (image) {
      URL.revokeObjectURL(image.preview);
    }
    onChange(images.filter((item) => item.id !== id));
  };

  const reorderImages = useCallback(
    (sourceId: string, targetId: string) => {
      if (sourceId === targetId) return;
      const current = [...images];
      const fromIndex = current.findIndex((item) => item.id === sourceId);
      const toIndex = current.findIndex((item) => item.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return;
      const [moved] = current.splice(fromIndex, 1);
      current.splice(toIndex, 0, moved);
      onChange(current);
    },
    [images, onChange]
  );

  const dropHandlers = useMemo(
    () => ({
      onDragStart: (id: string) => setDraggingId(id),
      onDragEnter: (id: string) => {
        if (draggingId && draggingId !== id) {
          reorderImages(draggingId, id);
        }
      },
      onDragEnd: () => setDraggingId(null),
    }),
    [draggingId, reorderImages]
  );

  const handleDropZone = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFiles(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
    setDraggingId(null);
  };

  const isDraggingOver = draggingId === 'dropzone';

  return (
    <Card className="border-dashed border-muted-foreground/40">
      <CardContent className="space-y-4 p-6">
        <Label className="text-sm font-medium text-muted-foreground">动态图片</Label>
        <div
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${
            isDraggingOver ? 'border-primary bg-primary/5' : 'border-muted'
          }`}
          onDrop={handleDropZone}
          onDragOver={(event) => {
            event.preventDefault();
            setDraggingId('dropzone');
          }}
          onDragLeave={() => setDraggingId(null)}
        >
          <Upload className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">拖拽图片到此处，或</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={openFileDialog}>
            选择图片文件
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
        </div>

        {images.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative rounded-lg border bg-background shadow-sm"
                draggable
                onDragStart={() => dropHandlers.onDragStart(image.id)}
                onDragEnter={() => dropHandlers.onDragEnter(image.id)}
                onDragEnd={dropHandlers.onDragEnd}
              >
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.preview} alt="动态图片" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 hidden items-center justify-center bg-black/40 text-white group-hover:flex">
                    <MoveVertical className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
                  <span className="truncate" title={image.file.name}>
                    {image.file.name}
                  </span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemove(image.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
