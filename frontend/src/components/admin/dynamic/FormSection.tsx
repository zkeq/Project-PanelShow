"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface FormSectionProps {
  title: string;
  setTitle: (title: string) => void;
  author: string;
  setAuthor: (author: string) => void;
  category: string;
  setCategory: (category: string) => void;
  publishUrl: string;
  setPublishUrl: (url: string) => void;
  demoUrl: string;
  setDemoUrl: (url: string) => void;
}

export function FormSection({
  title,
  setTitle,
  author,
  setAuthor,
  category,
  setCategory,
  publishUrl,
  setPublishUrl,
  demoUrl,
  setDemoUrl,
}: FormSectionProps) {
  return (
    <Card className="border-0 shadow-lg shadow-slate-200/50">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 rounded-lg">
            <FileText className="h-5 w-5" />
          </div>
          基本信息
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-3">
          <Label
            htmlFor="title"
            className="text-base font-semibold flex items-center gap-2"
          >
            动态标题
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入一个吸引人的标题..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label
              htmlFor="author"
              className="text-base font-semibold text-slate-700 dark:text-slate-200"
            >
              作者姓名
            </Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="输入作者姓名..."
            />
          </div>
          <div className="space-y-3">
            <Label
              htmlFor="category"
              className="text-base font-semibold flex items-center gap-2"
            >
              分类
              <span className="text-red-500">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 rounded-sm transition-all duration-200 w-full">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-600 backdrop-blur-sm">
                <SelectItem
                  value="design"
                  className="rounded-lg text-slate-900 dark:text-slate-100"
                >
                  🎨 设计作品
                </SelectItem>
                <SelectItem
                  value="development"
                  className="rounded-lg text-slate-900 dark:text-slate-100"
                >
                  💻 开发项目
                </SelectItem>
                <SelectItem
                  value="photography"
                  className="rounded-lg text-slate-900 dark:text-slate-100"
                >
                  📸 摄影作品
                </SelectItem>
                <SelectItem
                  value="writing"
                  className="rounded-lg text-slate-900 dark:text-slate-100"
                >
                  ✍️ 文字创作
                </SelectItem>
                <SelectItem
                  value="video"
                  className="rounded-lg text-slate-900 dark:text-slate-100"
                >
                  🎬 视频制作
                </SelectItem>
                <SelectItem
                  value="other"
                  className="rounded-lg text-slate-900 dark:text-slate-100"
                >
                  🔧 其他
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label
              htmlFor="publishUrl"
              className="text-base font-semibold text-slate-700 dark:text-slate-200"
            >
              🔗 发布地址
            </Label>
            <Input
              id="publishUrl"
              value={publishUrl}
              onChange={(e) => setPublishUrl(e.target.value)}
              placeholder="https://..."
              type="url"
            />
          </div>
          <div className="space-y-3">
            <Label
              htmlFor="demoUrl"
              className="text-base font-semibold text-slate-700 dark:text-slate-200"
            >
              🚀 演示地址
            </Label>
            <Input
              id="demoUrl"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://..."
              type="url"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
