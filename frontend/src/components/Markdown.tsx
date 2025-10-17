"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import { useTheme } from "next-themes";

import { MermaidBlock } from "./markdown/MermaidBlock";

interface MarkdownProps {
  children: string;
}

export default function Markdown({ children }: MarkdownProps) {
  const { resolvedTheme } = useTheme();

  const components = useMemo<Partial<Components>>(() => {
    type CodeRendererProps = React.ComponentPropsWithoutRef<"code"> & {
      inline?: boolean;
      node?: unknown;
    };

    const code = ({
      inline,
      className,
      children,
      ...props
    }: CodeRendererProps) => {
      const match = /language-(\w+)/.exec(className ?? "");
      if (!inline && match?.[1] === "mermaid") {
        return (
          <MermaidBlock
            chart={String(children ?? "").replace(/\n$/, "")}
            theme={resolvedTheme === "dark" ? "dark" : "default"}
          />
        );
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    };

    return { code: code as Components["code"] };
  }, [resolvedTheme]);

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkToc, { maxDepth: 3, tight: true }]]}
        rehypePlugins={[rehypeSlug]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
