"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
}

export default function ImagePreview({
  images,
  currentIndex,
  onClose,
}: ImagePreviewProps) {
  const [index, setIndex] = useState(currentIndex);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 禁止页面滚动
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handlePrevious = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      {/* 关闭按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-[10000]"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* 左侧箭头 */}
      {images.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 text-white hover:bg-white/20 z-[10000]"
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {/* 图片容器 */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full">
          <img
            src={images[index]}
            alt={`预览图片 ${index + 1}`}
            className="object-contain max-w-full max-h-[90vh]"
          />
        </div>
      </div>

      {/* 右侧箭头 */}
      {images.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 text-white hover:bg-white/20 z-[10000]"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* 图片计数 */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full text-sm">
          {index + 1} / {images.length}
        </div>
      )}
    </div>,
    document.body
  );
}
