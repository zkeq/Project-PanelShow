'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import HeaderNavigation from '@/components/layout/HeaderNavigation'
import ProjectSidebar from '@/components/project/ProjectSidebar'
import ProjectHero from '@/components/project/ProjectHero'
import ProjectContent from '@/components/project/ProjectContent'
import BackgroundDecorations from '@/components/layout/BackgroundDecorations'
import { fetchProject } from '@/lib/api'
import type { ProjectInfo } from '@/types/store'
import type { TimelineItem } from '@/types/timeline'

type ProjectStatus = 'active' | 'maintained' | 'archived' | 'building'

interface ProjectFeature {
  title: string
  description: string
  icon: string
  techStack?: Array<{
    name: string
    color: string
    bgColor: string
    textColor: string
    borderColor: string
  }>
  images?: Array<{
    src: string
    alt: string
    label: string
    description?: string
  }>
}

interface ProjectDetailViewModel {
  id: string
  name: string
  description: string
  status: ProjectStatus
  statusLabel?: string
  projectType?: string
  previewUrl?: string
  sourceUrl?: string
  tags: string[]
  heroAttributes: ProjectInfo[]
  sidebarAttributes: ProjectInfo[]
  homeAttributes: ProjectInfo[]
  images: Array<{
    src: string
    alt: string
    label: string
    description?: string
  }>
  features: ProjectFeature[]
  longDescription?: string
  timelineItems: TimelineItem[]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const mapProjectInfo = (raw: unknown, fallbackId: string): ProjectInfo | null => {
  if (!isRecord(raw)) return null

  const label = typeof raw.label === 'string' && raw.label.trim() ? raw.label : '信息项'
  const valueCode = typeof raw.valueCode === 'string' ? raw.valueCode : ''
  const icon = typeof raw.icon === 'string' && raw.icon.trim() ? raw.icon : 'lucide:code'
  const color = typeof raw.color === 'string' ? raw.color : ''
  const orderRaw = raw.order
  const order = typeof orderRaw === 'number' ? orderRaw : Number(orderRaw) || 0
  const value = typeof raw.value === 'string' ? raw.value : undefined

  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id : fallbackId,
    icon,
    label,
    valueCode,
    showInHomepage: Boolean(raw.showInHomepage),
    showInSidebar: Boolean(raw.showInSidebar),
    showInHero: Boolean(raw.showInHero),
    color,
    order,
    value
  }
}

const mapAttributesArray = (source: unknown): ProjectInfo[] => {
  if (!Array.isArray(source)) {
    return []
  }

  return source
    .map((item, index) => mapProjectInfo(item, `attribute-${index}`))
    .filter((item): item is ProjectInfo => item !== null)
    .sort((a, b) => a.order - b.order)
}

const mapImages = (source: unknown, prefix: string) => {
  if (!Array.isArray(source)) return [] as ProjectDetailViewModel['images']

  const keyPrefix = prefix || 'image'

  return source
    .map((item, index) => {
      if (!isRecord(item)) return null
      const url = typeof item.url === 'string' ? item.url : typeof item.src === 'string' ? item.src : ''
      if (!url) return null
      const fallbackName = `${keyPrefix}-${index + 1}`
      const name = typeof item.name === 'string' && item.name.trim() ? item.name : fallbackName
      const description = typeof item.description === 'string' ? item.description : undefined
      return {
        src: url,
        alt: description || name,
        label: name,
        description
      } as ProjectDetailViewModel['images'][number]
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
}

const mapFeatures = (source: unknown): ProjectFeature[] => {
  if (!Array.isArray(source)) return []

  return source
    .map((item, index) => {
      if (!isRecord(item)) return null
      const title = typeof item.title === 'string' && item.title.trim() ? item.title : `特色功能 ${index + 1}`
      const description = typeof item.description === 'string' ? item.description : ''
      const icon = typeof item.icon === 'string' && item.icon.trim() ? item.icon : '✨'
      const techStackSource = item.techStack
      const techStack = Array.isArray(techStackSource)
        ? techStackSource
            .map((tech) => {
              if (!isRecord(tech)) return null
              const name = typeof tech.name === 'string' ? tech.name : ''
              if (!name) return null
              return {
                name,
                color: typeof tech.color === 'string' ? tech.color : '',
                bgColor: typeof tech.bgColor === 'string' ? tech.bgColor : '',
                textColor: typeof tech.textColor === 'string' ? tech.textColor : '',
                borderColor: typeof tech.borderColor === 'string' ? tech.borderColor : ''
              }
            })
            .filter((tech): tech is NonNullable<typeof tech> => tech !== null)
        : undefined

      const images = mapImages(item.screenshots, `feature-${index}`)

      return {
        title,
        description,
        icon,
        techStack,
        images: images.length > 0 ? images : undefined
      } as ProjectFeature
    })
    .filter((feature): feature is NonNullable<typeof feature> => feature !== null)
}

const mapTimelineItems = (source: unknown): TimelineItem[] => {
  if (!Array.isArray(source)) return []

  return source
    .filter(isRecord)
    .map((item) => {
      // Validate and extract required fields
      const id = typeof item.id === 'string' ? item.id : ''
      const project_id = typeof item.project_id === 'string' ? item.project_id : ''
      const publishedAt = typeof item.publishedAt === 'string' ? item.publishedAt : new Date().toISOString()
      const createdAt = typeof item.createdAt === 'string' ? item.createdAt : publishedAt
      const updateType = typeof item.updateType === 'string' ? item.updateType : 'update'
      const changelog = typeof item.changelog === 'string' ? item.changelog : ''
      const likes = typeof item.likes === 'number' ? item.likes : 0

      // Author
      const authorRaw = isRecord(item.author) ? item.author : {}
      const author = {
        name: typeof authorRaw.name === 'string' ? authorRaw.name : '',
        avatar: typeof authorRaw.avatar === 'string' ? authorRaw.avatar : '',
        username: typeof authorRaw.username === 'string' ? authorRaw.username : ''
      }

      // Project
      const projectRaw = isRecord(item.project) ? item.project : {}
      const project = {
        id: typeof projectRaw.id === 'string' ? projectRaw.id : project_id,
        name: typeof projectRaw.name === 'string' ? projectRaw.name : '',
        logo: typeof projectRaw.logo === 'string' ? projectRaw.logo : '',
        description: typeof projectRaw.description === 'string' ? projectRaw.description : '',
        techStack: Array.isArray(projectRaw.techStack)
          ? projectRaw.techStack.filter((tech): tech is string => typeof tech === 'string')
          : [],
        readme: typeof projectRaw.readme === 'string' ? projectRaw.readme : '',
        previewImages: Array.isArray(projectRaw.previewImages)
          ? projectRaw.previewImages.filter((img): img is string => typeof img === 'string')
          : [],
        repositoryUrl: typeof projectRaw.repositoryUrl === 'string' ? projectRaw.repositoryUrl : '',
        liveUrl: typeof projectRaw.liveUrl === 'string' ? projectRaw.liveUrl : undefined,
        mobileUrl: typeof projectRaw.mobileUrl === 'string' ? projectRaw.mobileUrl : undefined
      }

      // UpdateTypeMeta
      const updateTypeMetaRaw = isRecord(item.updateTypeMeta) ? item.updateTypeMeta : {}
      const updateTypeMeta = {
        id: typeof updateTypeMetaRaw.id === 'string' ? updateTypeMetaRaw.id : updateType,
        label: typeof updateTypeMetaRaw.label === 'string' ? updateTypeMetaRaw.label : updateType,
        color: typeof updateTypeMetaRaw.color === 'string' ? updateTypeMetaRaw.color : '#3b82f6'
      }

      // Tags
      const tagsRaw = Array.isArray(item.tags) ? item.tags : []
      const tags = tagsRaw
        .filter(isRecord)
        .map((tag) => ({
          id: typeof tag.id === 'string' ? tag.id : '',
          label: typeof tag.label === 'string' ? tag.label : '',
          icon: typeof tag.icon === 'string' ? tag.icon : ''
        }))
        .filter((tag) => tag.id && tag.label)

      // Assets
      const assetsRaw = isRecord(item.assets) ? item.assets : {}
      const imagesRaw = Array.isArray(assetsRaw.images) ? assetsRaw.images : []
      const images = imagesRaw
        .filter(isRecord)
        .map((img) => ({
          id: typeof img.id === 'string' ? img.id : '',
          url: typeof img.url === 'string' ? img.url : '',
          filename: typeof img.filename === 'string' ? img.filename : '',
          contentType: typeof img.contentType === 'string' ? img.contentType : '',
          size: typeof img.size === 'number' ? img.size : 0
        }))
        .filter((img) => img.url)

      return {
        id,
        project_id,
        publishedAt,
        author,
        project,
        updateType,
        updateTypeMeta,
        changelog,
        tags: tags.length > 0 ? tags : undefined,
        details: typeof item.details === 'string' ? item.details : undefined,
        assets: images.length > 0 ? { images } : undefined,
        createdAt,
        updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : undefined,
        likes,
        comments: typeof item.comments === 'number' ? item.comments : undefined,
        isLiked: typeof item.isLiked === 'boolean' ? item.isLiked : undefined
      } as TimelineItem
    })
    .filter((item) => item.id && item.project.name)
}

const normalizeStatus = (source: unknown): { id: ProjectStatus; label?: string } => {
  const allowed: ProjectStatus[] = ['active', 'maintained', 'archived', 'building']
  let id: ProjectStatus = 'active'
  let label: string | undefined

  if (typeof source === 'string') {
    const normalized = source.toLowerCase()
    if (normalized === 'completed') {
      id = 'archived'
    } else if (allowed.includes(normalized as ProjectStatus)) {
      id = normalized as ProjectStatus
    } else {
      label = source
    }
  } else if (isRecord(source)) {
    const rawId = typeof source.id === 'string' ? source.id.toLowerCase() : undefined
    const rawLabel = typeof source.label === 'string' ? source.label : undefined
    if (rawId === 'completed') {
      id = 'archived'
    } else if (rawId && allowed.includes(rawId as ProjectStatus)) {
      id = rawId as ProjectStatus
    } else if (rawId) {
      label = rawLabel ?? rawId
    }
    if (rawLabel) {
      label = rawLabel
    }
  }

  return { id, label }
}

const mapProjectDetail = (raw: unknown): ProjectDetailViewModel | null => {
  if (!isRecord(raw)) return null

  const id = typeof raw.id === 'string' ? raw.id : 'unknown'
  const name = typeof raw.name === 'string' ? raw.name : '未命名项目'
  const description = typeof raw.description === 'string' ? raw.description : '暂无项目描述'

  const statusResult = normalizeStatus(raw.status)
  const projectType = typeof raw.projectType === 'string'
    ? raw.projectType
    : isRecord(raw.type) && typeof raw.type.label === 'string'
      ? raw.type.label
      : undefined

  const previewUrl = typeof raw.previewUrl === 'string' && raw.previewUrl ? raw.previewUrl :
    (isRecord(raw.links) && typeof raw.links.demo === 'string' ? raw.links.demo : undefined)
  const sourceUrl = typeof raw.sourceUrl === 'string' && raw.sourceUrl ? raw.sourceUrl :
    (isRecord(raw.links) && typeof raw.links.repository === 'string' ? raw.links.repository : undefined)

  const projectInfos = mapAttributesArray(raw.projectInfos)
  const homeAttributesRaw = mapAttributesArray(raw.homeAttributes)
  const sidebarAttributesRaw = mapAttributesArray(raw.sidebarAttributes)
  const heroAttributesRaw = mapAttributesArray(raw.heroAttributes)

  const homeAttributes = homeAttributesRaw.length > 0
    ? homeAttributesRaw
    : projectInfos.filter((info) => info.showInHomepage)
  const sidebarAttributes = sidebarAttributesRaw.length > 0
    ? sidebarAttributesRaw
    : projectInfos.filter((info) => info.showInSidebar)
  const heroAttributes = (heroAttributesRaw.length > 0
    ? heroAttributesRaw
    : projectInfos.filter((info) => info.showInHero)).slice(0, 3)

  const tagsSource = raw.tags
  const tags = Array.isArray(tagsSource)
    ? tagsSource
        .map((tag) => {
          if (typeof tag === 'string') return tag
          if (isRecord(tag) && typeof tag.label === 'string') return tag.label
          return null
        })
        .filter((tag): tag is string => tag !== null)
    : []

  const images = mapImages(raw.screenshots, 'screenshot')
  const features = mapFeatures(raw.featureHighlights)
  const timelineItems = mapTimelineItems(raw.timeline_items)

  const longDescription = typeof raw.longDescription === 'string'
    ? raw.longDescription
    : typeof raw.projectIntroduction === 'string'
      ? raw.projectIntroduction
      : undefined

  return {
    id,
    name,
    description,
    status: statusResult.id,
    statusLabel: statusResult.label,
    projectType,
    previewUrl,
    sourceUrl,
    tags,
    heroAttributes,
    sidebarAttributes,
    homeAttributes,
    images,
    features,
    longDescription,
    timelineItems
  }
}


export default function ProjectDetailPage() {
  const params = useParams()
  const username = params.username as string
  const projectId = params.projectId as string
  const [activeSection, setActiveSection] = useState('overview')
  const [projectData, setProjectData] = useState<ProjectDetailViewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetchProject(username, projectId, '')
        const mapped = mapProjectDetail(response?.data)

        if (!cancelled) {
          if (mapped) {
            setProjectData(mapped)
          } else {
            setProjectData(null)
            setError('项目数据格式不正确')
          }
        }
      } catch (err) {
        if (!cancelled) {
          setProjectData(null)
          setError(err instanceof Error ? err.message : '加载项目失败')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [username, projectId])

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'description', 'features', 'timeline']
      const scrollPosition = window.scrollY + 150

      let current = 'overview'

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          const elementTop = rect.top + window.scrollY

          if (scrollPosition >= elementTop) {
            current = section
          }
        }
      }

      if (current !== activeSection) {
        setActiveSection(current)
      }
    }

    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeSection])

  const handleSectionChange = (section: string) => {
    const element = document.getElementById(section)
    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top + window.scrollY - headerOffset

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !projectData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">无法加载项目</h1>
          <p className="text-muted-foreground">{error || '请求的项目不存在'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation username={username} />

      <div className="flex">
        <div className="hidden lg:block">
          <ProjectSidebar
            project={{
              id: projectData.id,
              name: projectData.name,
              description: projectData.description,
              projectType: projectData.projectType,
              status: projectData.status,
              statusLabel: projectData.statusLabel,
              previewUrl: projectData.previewUrl,
              sidebarAttributes: projectData.sidebarAttributes
            }}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        </div>

        <main className="flex-1 min-w-0 relative min-h-[calc(100vh-3.5rem)] lg:ml-80">
          <BackgroundDecorations />

          <div className="relative z-10">
            <div className="w-full p-4 sm:p-6 lg:p-8">
              <ProjectHero
                project={{
                  name: projectData.name,
                  description: projectData.description,
                  status: projectData.status,
                  statusLabel: projectData.statusLabel,
                  projectType: projectData.projectType,
                  previewUrl: projectData.previewUrl,
                  sourceUrl: projectData.sourceUrl,
                  heroAttributes: projectData.heroAttributes,
                  tags: projectData.tags
                }}
                username={username}
              />

              <ProjectContent
                project={{
                  id: projectData.id,
                  name: projectData.name,
                  description: projectData.description,
                  status: projectData.status,
                  previewUrl: projectData.previewUrl,
                  sourceUrl: projectData.sourceUrl,
                  longDescription: projectData.longDescription,
                  homeAttributes: projectData.homeAttributes,
                  images: projectData.images,
                  features: projectData.features
                }}
                username={username}
                timelineItems={projectData.timelineItems}
                mobileNavigation={{
                  activeSection,
                  onSectionChange: handleSectionChange
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}