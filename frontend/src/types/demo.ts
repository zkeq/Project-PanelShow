export interface ProjectOverview {
  name: string
  description: string
  tags: string[]
}

export interface DemoContent {
  title: string
  previewUrl?: string
  mobilePreviewUrl?: string
  sourceUrl?: string
  leftMarkdown?: string
  rightMarkdown?: string
}

export interface FeatureHighlight {
  id: string
  title?: string
  description?: string
  previewUrl?: string
  mobilePreviewUrl?: string
  leftMarkdown?: string
  rightMarkdown?: string
}

export interface ProjectDetailApiData {
  id: string
  name: string
  description: string
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
