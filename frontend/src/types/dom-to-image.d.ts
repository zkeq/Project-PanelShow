declare module 'dom-to-image' {
  export interface DomToImageOptions {
    bgcolor?: string
    width?: number
    height?: number
    quality?: number
    cacheBust?: boolean
    imagePlaceholder?: string
    style?: Record<string, string | number>
    filter?: (node: HTMLElement) => boolean
  }

  export function toBlob(node: Node, options?: DomToImageOptions): Promise<Blob>
}
