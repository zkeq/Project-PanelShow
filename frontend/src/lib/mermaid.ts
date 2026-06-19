const MERMAID_SECURITY_LEVEL = "loose";
const MERMAID_CDN_URL = "https://jsd.onmicrosoft.cn/npm/mermaid@10/dist/mermaid.esm.min.mjs";

export type MermaidTheme = "default" | "dark";

type MermaidConfig = {
  startOnLoad: boolean;
  securityLevel: string;
  theme: MermaidTheme;
};

type MermaidRenderResult = {
  svg: string;
  bindFunctions?: (element: Element) => void;
};

type MermaidApi = {
  initialize: (config: MermaidConfig) => void;
  render: (id: string, text: string) => Promise<MermaidRenderResult>;
};

let mermaidLoader: Promise<MermaidApi> | null = null;

async function loadMermaid(): Promise<MermaidApi> {
  if (!mermaidLoader) {
    mermaidLoader = import(
      /* webpackIgnore: true */
      /* @vite-ignore */
      MERMAID_CDN_URL
    ).then((module: unknown) => {
      const mermaid =
        (module as { default?: MermaidApi; mermaid?: MermaidApi })?.default ??
        (module as { default?: MermaidApi; mermaid?: MermaidApi })?.mermaid ??
        (module as MermaidApi);

      if (!mermaid) {
        throw new Error("Mermaid 库加载失败");
      }

      return mermaid;
    });
  }

  return mermaidLoader;
}

export async function renderMermaidDiagram(
  chart: string,
  theme: MermaidTheme
): Promise<MermaidRenderResult> {
  const mermaid = await loadMermaid();
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: MERMAID_SECURITY_LEVEL,
    theme,
  });

  const renderId = `mermaid-${Math.random().toString(36).slice(2, 10)}`;
  return mermaid.render(renderId, chart);
}
