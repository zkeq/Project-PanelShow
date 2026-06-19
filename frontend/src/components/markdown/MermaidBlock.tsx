"use client";

import { useEffect, useRef, useState } from "react";

import { renderMermaidDiagram, type MermaidTheme } from "@/lib/mermaid";

interface MermaidBlockProps {
  chart: string;
  theme?: MermaidTheme;
}

export function MermaidBlock({ chart, theme = "default" }: MermaidBlockProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bindFunctionsRef = useRef<((element: Element) => void) | undefined>(
    undefined
  );

  useEffect(() => {
    let isActive = true;
    const content = chart.trim();

    if (!content) {
      setSvg(null);
      setError(null);
      bindFunctionsRef.current = undefined;
      return () => {
        isActive = false;
      };
    }

    (async () => {
      try {
        const { svg: svgContent, bindFunctions } = await renderMermaidDiagram(
          content,
          theme
        );
        if (!isActive) {
          return;
        }
        setSvg(svgContent);
        setError(null);
        bindFunctionsRef.current = bindFunctions;
      } catch (err) {
        if (!isActive) {
          return;
        }
        console.error("Mermaid 渲染失败", err);
        setSvg(null);
        setError(
          err instanceof Error ? err.message : "无法渲染 Mermaid 流程图"
        );
        bindFunctionsRef.current = undefined;
      }
    })();

    return () => {
      isActive = false;
      bindFunctionsRef.current = undefined;
    };
  }, [chart, theme]);

  useEffect(() => {
    if (svg && containerRef.current && bindFunctionsRef.current) {
      bindFunctionsRef.current(containerRef.current);
    }
  }, [svg]);

  if (error) {
    return (
      <pre className="mermaid-error" role="alert">
        Mermaid 渲染失败：{error}
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid"
      role="img"
      aria-label="Mermaid diagram"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}
