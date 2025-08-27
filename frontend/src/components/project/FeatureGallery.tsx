"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Plus, ExternalLink } from "lucide-react";

interface FeatureImage {
  src: string;
  alt: string;
  label: string;
  description?: string;
}

interface FeatureGalleryProps {
  images: FeatureImage[];
  previewUrl?: string;
  className?: string;
  variant?: "grid" | "compact"; // grid: 9张图片带背景, compact: 6张图片无背景
}

export default function FeatureGallery({ 
  images, 
  previewUrl, 
  className = "",
  variant = "grid"
}: FeatureGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!images || images.length === 0) return null;

  // 根据模式设置显示图片数量
  const maxImages = variant === "grid" ? 8 : 5; // grid模式9张(8+1), compact模式6张(5+1)
  const displayImages = images.slice(0, maxImages);
  const remainingCount = Math.max(0, images.length - maxImages);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsPreviewOpen(true);
  };

  const handleMoreClick = () => {
    setSelectedImageIndex(maxImages);
    setIsPreviewOpen(true);
  };

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => 
      prev > 0 ? prev - 1 : images.length - 1
    );
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => 
      prev < images.length - 1 ? prev + 1 : 0
    );
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    // 只有当点击的是背景容器本身时才关闭
    if (e.target === e.currentTarget) {
      setIsPreviewOpen(false);
    }
  };

  return (
    <div className={className}>
      {variant === "grid" ? (
        // Grid模式：9张图片，带Card背景
        <Card className="overflow-hidden w-full">
          <CardContent className="p-2 flex justify-center">
            <div className="aspect-square w-full max-w-[410px]">
              <div className="grid grid-cols-3 gap-1 h-full">
                {/* 显示前8张图片 */}
                {displayImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-md group cursor-pointer"
                    onClick={() => handleImageClick(index)}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition-all duration-300 group-hover:scale-110"
                      sizes="120px"
                    />
                    {/* 悬停遮罩 */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-white text-xs font-medium">
                        查看
                      </div>
                    </div>
                    
                    {/* 功能标签 */}
                    <div className="absolute bottom-1 left-1">
                      <div className="bg-white/90 dark:bg-black/90 text-foreground px-1 py-0.5 rounded-sm text-xs">
                        {image.label}
                      </div>
                    </div>

                    {/* 第一张图片的主要标签 */}
                    {index === 0 && (
                      <div className="absolute top-1 left-1">
                        <div className="bg-primary/90 text-primary-foreground px-1 py-0.5 rounded-sm text-xs font-medium">
                          主页
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* 第9格：显示+号或第9张图片 */}
                {images.length > maxImages ? (
                  <div
                    className="relative aspect-square overflow-hidden rounded-md group cursor-pointer bg-muted/50 border-2 border-dashed border-muted-foreground/30"
                    onClick={handleMoreClick}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                      <Plus className="w-8 h-8 mb-1" />
                      <span className="text-xs font-medium">
                        +{remainingCount}
                      </span>
                    </div>
                    {/* 悬停效果 */}
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ) : images.length === maxImages + 1 ? (
                  <div
                    className="relative aspect-square overflow-hidden rounded-md group cursor-pointer"
                    onClick={() => handleImageClick(maxImages)}
                  >
                    <Image
                      src={images[maxImages].src}
                      alt={images[maxImages].alt}
                      fill
                      className="object-cover transition-all duration-300 group-hover:scale-110"
                      sizes="120px"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-white text-xs font-medium">
                        查看
                      </div>
                    </div>
                    <div className="absolute bottom-1 left-1">
                      <div className="bg-white/90 dark:bg-black/90 text-foreground px-1 py-0.5 rounded-sm text-xs">
                        {images[maxImages].label}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Compact模式：6张图片，无背景
        <div className="w-full">
          <div className="grid grid-cols-3 gap-2">
            {/* 显示前5张图片 */}
            {displayImages.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-md group cursor-pointer bg-muted/30"
                onClick={() => handleImageClick(index)}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-all duration-300 group-hover:scale-110"
                  sizes="120px"
                />
                {/* 悬停遮罩 */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-white text-xs font-medium">
                    查看
                  </div>
                </div>
                
                {/* 功能标签 */}
                <div className="absolute bottom-1 left-1">
                  <div className="bg-white/90 dark:bg-black/90 text-foreground px-1 py-0.5 rounded-sm text-xs">
                    {image.label}
                  </div>
                </div>

                {/* 第一张图片的主要标签 */}
                {index === 0 && (
                  <div className="absolute top-1 left-1">
                    <div className="bg-primary/90 text-primary-foreground px-1 py-0.5 rounded-sm text-xs font-medium">
                      主要
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* 第6格：显示+号（仅当有超过5张图片时） */}
            {images.length > maxImages && (
              <div
                className="relative aspect-square overflow-hidden rounded-md group cursor-pointer bg-muted/20 border-2 border-dashed border-muted-foreground/20"
                onClick={handleMoreClick}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">
                    +{remainingCount}
                  </span>
                </div>
                {/* 悬停效果 */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 在线预览按钮 */}
      {previewUrl && (
        <div className="mt-3 flex justify-center">
          <Button 
            variant="outline"
            size="sm" 
            className="text-xs w-full" 
            onClick={() => window.open(previewUrl, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            在线预览
          </Button>
        </div>
      )}

      {/* 图片预览弹窗 */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent 
          className="max-w-none max-h-none w-[100vw] h-[100vh] p-0 bg-black border-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">
            图片预览 - {images[selectedImageIndex]?.alt}
          </DialogTitle>

          {/* 导航按钮 */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-50 text-white/80 hover:text-white p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-50 text-white/80 hover:text-white p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* 图片展示容器 */}
          <div 
            className="relative w-full h-full flex items-center justify-center cursor-pointer"
            onClick={handleBackgroundClick}
          >
            {images[selectedImageIndex] && (
              <div className="relative cursor-default" onClick={(e) => e.stopPropagation()}>
                <Image
                  src={images[selectedImageIndex].src}
                  alt={images[selectedImageIndex].alt}
                  width={1200}
                  height={800}
                  className="max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain"
                  sizes="90vw"
                  priority
                />
                
                {/* 图片底部渐变信息栏 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent p-6 text-white">
                  <div className="max-w-lg">
                    <h3 className="text-lg font-semibold mb-1">
                      {images[selectedImageIndex]?.label}
                    </h3>
                    {images[selectedImageIndex]?.description && (
                      <p className="text-sm text-white/90 mb-2 leading-relaxed">
                        {images[selectedImageIndex].description}
                      </p>
                    )}
                    <div className="text-xs text-white/70">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </div>
                </div>
                
                {/* 图片切换指示器 - 图片底部中间 */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 z-10">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === selectedImageIndex
                            ? "bg-white"
                            : "bg-white/40 hover:bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}