"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
}

export function ImageUpload({ images, setImages }: ImageUploadProps) {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="border-0">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 rounded-lg">
            <Upload className="h-5 w-5" />
          </div>
          动态图片
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[0, 1, 2].map((index) => (
            <div key={index} className="relative">
              {images[index] ? (
                <div className="relative aspect-square rounded-2xl border-2 border-slate-200 overflow-hidden shadow-md">
                  <img
                    src={
                      URL.createObjectURL(images[index]) ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-3 right-3 rounded-full w-8 h-8 p-0 shadow-lg"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 cursor-pointer transition-all duration-300 group">
                  <Upload className="h-10 w-10 group-hover:text-blue-500 mb-3 transition-colors" />
                  <span className="text-sm group-hover:text-blue-600 text-center font-medium transition-colors">
                    点击上传图片
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    支持 JPG, PNG
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    multiple
                  />
                </label>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
