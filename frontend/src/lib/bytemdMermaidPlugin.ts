import type { BytemdPlugin } from 'bytemd';

import { renderMermaidDiagram, type MermaidTheme } from './mermaid';

const MERMAID_CLASS_NAMES = [
  'language-mermaid',
  'lang-mermaid',
  'mermaid'
];

export function createMermaidPlugin(
  getTheme: () => MermaidTheme
): BytemdPlugin {
  return {
    viewerEffect({ markdownBody }) {
      const codeBlocks = Array.from(
        markdownBody.querySelectorAll<HTMLElement>('pre > code')
      ).filter((element) =>
        element.className
          .split(/\s+/)
          .some((className) => MERMAID_CLASS_NAMES.includes(className))
      );

      if (codeBlocks.length === 0) {
        return;
      }

      const cleanupCallbacks: Array<() => void> = [];
      const theme = getTheme();

      for (const codeBlock of codeBlocks) {
        const pre = codeBlock.parentElement as HTMLElement | null;
        const parent = pre?.parentElement;
        const chart = codeBlock.textContent?.trim() ?? '';

        if (!pre || !parent) {
          continue;
        }

        const container = document.createElement('div');
        container.className = 'mermaid';
        container.setAttribute('role', 'img');
        container.setAttribute('aria-label', 'Mermaid diagram');

        parent.replaceChild(container, pre);

        if (!chart) {
          container.textContent = '';
          cleanupCallbacks.push(() => {
            container.innerHTML = '';
          });
          continue;
        }

        renderMermaidDiagram(chart, theme)
          .then(({ svg, bindFunctions }) => {
            container.innerHTML = svg;
            bindFunctions?.(container);
          })
          .catch((error) => {
            const message =
              error instanceof Error
                ? error.message
                : '无法渲染 Mermaid 流程图';
            const fallback = document.createElement('pre');
            fallback.className = 'mermaid-error';
            fallback.setAttribute('role', 'alert');
            fallback.textContent = `Mermaid 渲染失败：${message}`;
            container.replaceChildren(fallback);
          });

        cleanupCallbacks.push(() => {
          container.innerHTML = '';
        });
      }

      return () => {
        cleanupCallbacks.forEach((dispose) => dispose());
      };
    }
  };
}
