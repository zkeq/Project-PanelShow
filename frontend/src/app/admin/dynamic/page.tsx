"use client";

import type React from "react";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { FormSection } from "@/components/admin/dynamic/FormSection";
import { ContentEditor } from "@/components/admin/dynamic/ContentEditor";
import { ImageUpload } from "@/components/admin/dynamic/ImageUpload";
import { TagManager } from "@/components/admin/dynamic/TagManager";
import { ActionButtons } from "@/components/admin/dynamic/ActionButtons";

export default function CreateDynamicPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [publishUrl, setPublishUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveDraft = () => {
    console.log("保存草稿", {
      title,
      content,
      author,
      publishUrl,
      demoUrl,
      category,
      tags,
      images,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 模拟提交过程
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("发布动态", {
        title,
        content,
        author,
        publishUrl,
        demoUrl,
        category,
        tags,
        images,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-8 max-w-3xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-balance">新建动态</h1>
                <p className="text-muted-foreground text-lg text-pretty mt-1">
                  创建并分享您的精彩作品动态
                </p>
              </div>
            </div>
            <ActionButtons
              onSaveDraft={handleSaveDraft}
              onPublish={() => {}}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSection
              title={title}
              setTitle={setTitle}
              author={author}
              setAuthor={setAuthor}
              category={category}
              setCategory={setCategory}
              publishUrl={publishUrl}
              setPublishUrl={setPublishUrl}
              demoUrl={demoUrl}
              setDemoUrl={setDemoUrl}
            />

            <TagManager tags={tags} setTags={setTags} />
          </div>
          <ContentEditor content={content} setContent={setContent} />

          <ImageUpload images={images} setImages={setImages} />
        </form>
      </div>
    </div>
  );
}
