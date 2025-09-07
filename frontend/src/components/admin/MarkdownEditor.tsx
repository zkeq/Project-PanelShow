'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import 'bytemd/dist/index.css';
import 'github-markdown-css/github-markdown-light.css';
import 'github-markdown-css/github-markdown-dark.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder = "输入项目详细介绍..." }: MarkdownEditorProps) {
  const [Editor, setEditor] = useState<any>(null);
  const [plugins, setPlugins] = useState<any[]>([]);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    // 动态导入 ByteMD 组件和插件
    const loadEditor = async () => {
      try {
        const [
          { Editor: BytemdEditor },
          { default: gfm },
          { default: highlight }
        ] = await Promise.all([
          import('@bytemd/react'),
          import('@bytemd/plugin-gfm'),
          import('@bytemd/plugin-highlight')
        ]);

        setEditor(() => BytemdEditor);
        setPlugins([gfm(), highlight()]);
      } catch (error) {
        console.error('加载 Markdown 编辑器失败:', error);
      }
    };

    loadEditor();
  }, []);

  if (!Editor) {
    return (
      <div className="space-y-2">
        <div className="border rounded-lg h-96 flex items-center justify-center bg-muted/30">
          <p className="text-muted-foreground">正在加载 Markdown 编辑器...</p>
        </div>
      </div>
    );
  }

  const isDarkMode = resolvedTheme === 'dark' || theme === 'dark';

  return (
    <div className="space-y-2">
      <div className={`bytemd-wrapper ${isDarkMode ? 'dark' : 'light'}`}>
        <style jsx global>{`
          /* ByteMD 基础样式 */
          .bytemd {
            height: 500px;
            border-radius: 8px;
            font-family: var(--font-sans);
          }
          
          /* 亮色模式预览文字颜色修复 */
          .bytemd-wrapper.light .markdown-body {
            color: #000000 !important;
          }
          
          .bytemd-wrapper.light .markdown-body h1,
          .bytemd-wrapper.light .markdown-body h2,
          .bytemd-wrapper.light .markdown-body h3,
          .bytemd-wrapper.light .markdown-body h4,
          .bytemd-wrapper.light .markdown-body h5,
          .bytemd-wrapper.light .markdown-body h6,
          .bytemd-wrapper.light .markdown-body p,
          .bytemd-wrapper.light .markdown-body li {
            color: #000000 !important;
          }
          
          /* 亮色模式标题底边框修复 */
          .bytemd-wrapper.light .markdown-body h1,
          .bytemd-wrapper.light .markdown-body h2 {
            border-bottom: 1px solid #d1d9e0 !important;
          }
          
          /* 亮色模式表格样式修复 */
          .bytemd-wrapper.light .markdown-body table th,
          .bytemd-wrapper.light .markdown-body table td {
            color: #000000 !important;
            border: 1px solid #d1d9e0 !important;
          }
          
          .bytemd-wrapper.light .markdown-body table tr {
            background-color: transparent !important;
            border-top: 1px solid #d1d9e0 !important;
          }
          
          /* 亮色模式代码块样式修复 */
          .bytemd-wrapper.light .markdown-body .highlight pre,
          .bytemd-wrapper.light .markdown-body pre {
            color: #24292f !important;
            background-color: #f6f8fa !important;
          }
          
          /* 暗色模式 */
          .bytemd-wrapper.dark .bytemd {
            background: rgb(27, 27, 27);
            color: hsl(var(--foreground));
            border: 1px solid rgb(49, 50, 50);
          }
          
          .bytemd-wrapper.dark .bytemd-toolbar {
            background: rgb(35, 35, 35);
            border-bottom: 1px solid rgb(49, 50, 50);
            border-radius: 8px 8px 0 0;
          }
          
          .bytemd-wrapper.dark .bytemd-toolbar-icon {
            color: hsl(var(--muted-foreground));
            border: none;
            background: transparent;
          }
          
          .bytemd-wrapper.dark .bytemd-toolbar-icon:hover {
            background: rgb(49, 50, 50);
            color: hsl(var(--foreground));
          }
          
          .bytemd-wrapper.dark .bytemd-toolbar-tab {
            border-color: rgb(49, 50, 50);
          }
          
          .bytemd-wrapper.dark .bytemd-body {
            background: rgb(27, 27, 27);
          }
          
          .bytemd-wrapper.dark .bytemd-editor {
            background: rgb(27, 27, 27) !important;
            color: hsl(var(--foreground)) !important;
            font-family: var(--font-mono);
          }
          
          .bytemd-wrapper.dark .bytemd-preview {
            background: rgb(27, 27, 27) !important;
            color: hsl(var(--foreground)) !important;
            border-left: 1px solid rgb(49, 50, 50);
          }
          
          /* CodeMirror 暗色模式 */
          .bytemd-wrapper.dark .CodeMirror {
            background: rgb(27, 27, 27) !important;
            color: rgb(255, 255, 255) !important;
          }
          
          .bytemd-wrapper.dark .CodeMirror-gutters {
            background: rgb(35, 35, 35) !important;
            border-color: rgb(49, 50, 50) !important;
          }
          
          .bytemd-wrapper.dark .CodeMirror-cursor {
            border-left: 2px solid rgb(255, 255, 255) !important;
          }
          
          .bytemd-wrapper.dark .CodeMirror-selected {
            background: rgb(49, 50, 50) !important;
          }
          
          /* 修复 CodeMirror 默认主题中的蓝色链接 */
          .bytemd-wrapper.dark .cm-s-default .cm-link {
            color: rgb(255, 255, 255) !important;
          }
          
          /* 其他 CodeMirror 语法高亮元素 */
          .bytemd-wrapper.dark .cm-s-default .cm-header {
            color: rgb(255, 255, 255) !important;
          }
          
          .bytemd-wrapper.dark .cm-s-default .cm-header-1,
          .bytemd-wrapper.dark .cm-s-default .cm-header-2,
          .bytemd-wrapper.dark .cm-s-default .cm-header-3,
          .bytemd-wrapper.dark .cm-s-default .cm-header-4,
          .bytemd-wrapper.dark .cm-s-default .cm-header-5,
          .bytemd-wrapper.dark .cm-s-default .cm-header-6 {
            color: rgb(255, 255, 255) !important;
          }
          
          /* 预览区域暗色模式 */
          .bytemd-wrapper.dark .markdown-body {
            background: rgb(27, 27, 27) !important;
            color: rgb(255, 255, 255) !important;
          }
          
          .bytemd-wrapper.dark .markdown-body h1,
          .bytemd-wrapper.dark .markdown-body h2,
          .bytemd-wrapper.dark .markdown-body h3,
          .bytemd-wrapper.dark .markdown-body h4,
          .bytemd-wrapper.dark .markdown-body h5,
          .bytemd-wrapper.dark .markdown-body h6 {
            color: rgb(255, 255, 255) !important;
            border-color: rgb(49, 50, 50) !important;
          }
          
          /* 额外的标题样式覆盖 - 确保所有标题都是白色 */
          .bytemd-wrapper.dark .markdown-body h1 {
            color: rgb(255, 255, 255) !important;
            border-bottom-color: rgb(49, 50, 50) !important;
          }
          
          .bytemd-wrapper.dark .markdown-body h2 {
            color: rgb(255, 255, 255) !important;
            border-bottom-color: rgb(49, 50, 50) !important;
          }
          
          .bytemd-wrapper.dark .markdown-body h3,
          .bytemd-wrapper.dark .markdown-body h4,
          .bytemd-wrapper.dark .markdown-body h5,
          .bytemd-wrapper.dark .markdown-body h6 {
            color: rgb(255, 255, 255) !important;
          }
          
          .bytemd-wrapper.dark .markdown-body p,
          .bytemd-wrapper.dark .markdown-body li {
            color: rgb(255, 255, 255) !important;
          }
          
          .bytemd-wrapper.dark .markdown-body code {
            background: rgb(49, 50, 50) !important;
            color: rgb(96, 165, 250) !important;
          }
          
          .bytemd-wrapper.dark .markdown-body pre {
            background: rgb(35, 35, 35) !important;
            border: 1px solid rgb(49, 50, 50) !important;
          }
          
          .bytemd-wrapper.dark .markdown-body blockquote {
            border-left: 4px solid rgb(96, 165, 250) !important;
            background: rgba(49, 50, 50, 0.3) !important;
            color: rgb(209, 213, 219) !important;
          }
          
          .bytemd-wrapper.dark .markdown-body table th,
          .bytemd-wrapper.dark .markdown-body table td {
            border: 1px solid rgb(49, 50, 50) !important;
            background: rgb(27, 27, 27) !important;
            color: rgb(255, 255, 255) !important;
          }
          
          .bytemd-wrapper.dark .markdown-body table th {
            background: rgb(35, 35, 35) !important;
          }
          
          .bytemd-wrapper.dark .markdown-body a {
            color: rgb(96, 165, 250) !important;
          }
          
          /* 状态栏暗色模式 */
          .bytemd-wrapper.dark .bytemd-status {
            background: rgb(35, 35, 35) !important;
            border-top: 1px solid rgb(49, 50, 50) !important;
            color: rgb(209, 213, 219) !important;
          }
          
          /* 响应式设计 */
          @media (max-width: 768px) {
            .bytemd {
              height: 400px;
            }
          }
        `}</style>
        <Editor
          value={value}
          onChange={onChange}
          plugins={plugins}
          placeholder={placeholder}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        支持 Markdown 语法，包括代码块、表格、链接等。左侧编辑，右侧预览。
      </p>
    </div>
  );
}