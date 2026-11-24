export interface ProjectOverview {
  name: string
  description: string
  tags: string[]
  hidden?: boolean
}

export interface DemoContent {
  title: string
  description?: string
  previewUrl?: string
  mobilePreviewUrl?: string
  sourceUrl?: string
  leftMarkdown?: string
  rightMarkdown?: string
  screenshots?: DemoScreenshot[]
}

export interface DemoScreenshot {
  src: string
  alt: string
  label: string
  description?: string
}

export interface FeatureHighlight {
  id: string
  title?: string
  description?: string
  previewUrl?: string
  mobilePreviewUrl?: string
  leftMarkdown?: string
  rightMarkdown?: string
  screenshots?: DemoScreenshot[]
}

export interface ProjectDetailApiData {
  id: string
  name: string
  description: string
  hidden?: boolean
  tags?: string[]
  previewUrl?: string
  mobilePreviewUrl?: string
  sourceUrl?: string
  leftSidebarMarkdown?: string
  rightSidebarMarkdown?: string
  featureHighlights?: FeatureHighlight[]
}

export interface ProjectDetailResponse {
  success: boolean
  data: ProjectDetailApiData
}
