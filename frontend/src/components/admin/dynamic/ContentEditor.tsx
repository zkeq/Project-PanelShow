"use client";

import { Editor } from "@bytemd/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit3 } from "lucide-react";

const plugins = [];

interface ContentEditorProps {
  content: string;
  setContent: (content: string) => void;
}

export function ContentEditor({ content, setContent }: ContentEditorProps) {
  return (
    <Card className="border-0 shadow-lg shadow-slate-200/50">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 rounded-lg">
            <Edit3 className="h-5 w-5" />
          </div>
          动态内容
          <span className="text-red-500 text-lg">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bytemd-wrapper rounded-xl overflow-hidden border-2 border-slate-200">
          <Editor
            value={content}
            plugins={plugins}
            onChange={(v) => setContent(v)}
            placeholder="使用 Markdown 编写您的动态内容..."
          />
        </div>
        <div className="mt-4 p-4 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-700 dark:text-white font-medium">
            💡 支持 Markdown 语法：
            <code className="px-2 py-1 rounded text-blue-800 dark:text-white">
              **粗体**
            </code>
            、
            <code className="px-2 py-1 rounded text-blue-800 dark:text-white">
              *斜体*
            </code>
            、
            <code className="px-2 py-1 rounded text-blue-800 dark:text-white">
              `代码`
            </code>
            、
            <code className="px-2 py-1 rounded text-blue-800 dark:text-white">
              [链接](url)
            </code>
            、列表等
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
