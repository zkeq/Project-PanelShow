import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import React from "react";

interface MarkdownProps {
  children: string;
}

export default function Markdown({ children }: MarkdownProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkToc, { maxDepth: 3, tight: true }]]}
        rehypePlugins={[rehypeSlug]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
