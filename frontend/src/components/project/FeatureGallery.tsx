"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, ExternalLink } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import type { SlideImage } from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

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
  variant?: "grid" | "compact" | "carousel"; // grid: 9张图片带背景, compact: 6张图片无背景, carousel: 轮播图
  onPreviewClick?: () => void;
}

export default function FeatureGallery({
  images,
  previewUrl,
  className = "",
  variant = "grid",
  onPreviewClick
}: FeatureGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 自动轮播功能 - 必须在所有hook之前定义
  useEffect(() => {
    if (variant !== "carousel" || !images || images.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => 
        prev < images.length - 1 ? prev + 1 : 0
      );
    }, 4000); // 4秒切换一次

    return () => clearInterval(interval);
  }, [variant, images, isPaused]);

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

  const handleCarouselPrevious = () => {
    setCurrentSlideIndex((prev) => 
      prev > 0 ? prev - 1 : images.length - 1
    );
    // 手动操作时暂时暂停自动切换
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 6000); // 6秒后恢复自动切换
  };

  const handleCarouselNext = () => {
    setCurrentSlideIndex((prev) => 
      prev < images.length - 1 ? prev + 1 : 0
    );
    // 手动操作时暂时暂停自动切换
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 6000); // 6秒后恢复自动切换
  };

  const handleIndicatorClick = (index: number) => {
    setCurrentSlideIndex(index);
    // 手动操作时暂时暂停自动切换
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 6000); // 6秒后恢复自动切换
  };

  return (
    <div className={className}>
      {variant === "carousel" ? (
        // Carousel模式：轮播图
        <Card className="overflow-hidden w-full h-[460px] flex flex-col">
          <CardContent className="p-0 h-full flex flex-col">
            <div 
              className="relative flex-1 w-full"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* 主轮播图 */}
              <div className="relative w-full h-full overflow-hidden rounded-t-lg bg-muted/10 flex items-center justify-center">
                <img
                  src={images[currentSlideIndex].src}
                  alt={images[currentSlideIndex].alt}
                  className="w-full object-contain max-h-[336px]"
                />
                
                {/* 轮播导航按钮 */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handleCarouselPrevious}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all duration-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCarouselNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all duration-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* 轮播图指示器 */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleIndicatorClick(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentSlideIndex
                            ? "bg-white scale-110"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* 点击查看大图区域 - 移除加号图标 */}
                <button
                  onClick={() => handleImageClick(currentSlideIndex)}
                  className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors duration-200"
                >
                </button>
              </div>
            </div>

            {/* 底部信息栏 - 固定在底部 */}
            <div className="flex-shrink-0 p-4 bg-card border-t">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {images[currentSlideIndex].label}
                  </h3>
                  {images[currentSlideIndex].description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {images[currentSlideIndex].description}
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground ml-4 flex-shrink-0">
                  {currentSlideIndex + 1} / {images.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : variant === "grid" ? (
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
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
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
                    <img
                      src={images[maxImages].src}
                      alt={images[maxImages].alt}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
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
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
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
      {(previewUrl || onPreviewClick) && (
        <div className="mt-3 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            className="text-xs w-full"
            onClick={() => {
              if (onPreviewClick) {
                onPreviewClick()
                return
              }

              if (previewUrl) {
                window.open(previewUrl, '_blank')
              }
            }}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            在线预览
          </Button>
        </div>
      )}

      <Lightbox
        open={isPreviewOpen}
        close={() => setIsPreviewOpen(false)}
        slides={images.map((image) => ({
          src: image.src,
          title: image.label,
          description: image.description,
          alt: image.alt
        }))}
        index={selectedImageIndex}
        plugins={[Zoom]}
        carousel={{ finite: images.length <= 1 }}
        animation={{ swipe: 400 }}
        controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
        on={{
          view: ({ index }) => {
            if (typeof index === "number") {
              setSelectedImageIndex(index);
            }
          }
        }}
        render={{
          slideFooter: ({ slide }) => {
            const currentImage = images[selectedImageIndex];

            if (!currentImage) {
              return null;
            }

            const slideWithMeta = slide as SlideImage & {
              title?: string;
              description?: string;
            };

            const title = slideWithMeta.title ?? currentImage.label;
            const description =
              typeof slideWithMeta.description === "string"
                ? slideWithMeta.description
                : currentImage.description;

            return (
              <div className="pointer-events-none absolute left-6 bottom-6 text-left text-white">
                <div className="max-w-xl rounded-lg bg-black/50 p-4 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold leading-6">
                        {title}
                      </h3>
                      {description && (
                        <p className="mt-1 text-sm text-white/90">
                          {description}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-medium text-white/80">
                      {selectedImageIndex + 1} / {images.length}
                    </span>
                  </div>
                </div>
              </div>
            );
          }
        }}
        zoom={{ maxZoomPixelRatio: 4, scrollToZoom: true }}
        styles={{
          root: {
            backgroundColor: "rgba(0, 0, 0, 0.95)"
          }
        }}
      />
    </div>
  );
}
