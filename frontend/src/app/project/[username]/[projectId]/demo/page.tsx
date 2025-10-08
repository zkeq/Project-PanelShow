"use client"

import { useState, useEffect, use } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import HeaderNavigation from '@/components/layout/HeaderNavigation'
import BackgroundDecorations from '@/components/layout/BackgroundDecorations'
import DemoControls from '@/components/demo/DemoControls'
import DemoFrame from '@/components/demo/DemoFrame'
import ProjectInfo from '@/components/demo/ProjectInfo'
import DemoInfo from '@/components/demo/DemoInfo'
import { fetchProjectDetail } from '@/lib/api'
import type { DemoContent, ProjectOverview } from '@/types/demo'

interface DemoPageProps {
  params: Promise<{
    username: string
    projectId: string
  }>
}

type ViewMode = "desktop" | "mobile"

const getPreviewUrlForView = (content: DemoContent | null, viewMode: ViewMode) => {
  if (!content) return undefined
  return viewMode === "mobile"
    ? content.mobilePreviewUrl || content.previewUrl
    : content.previewUrl
}

export default function ProjectMainDemoPage({ params }: DemoPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("mobile")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [projectLoading, setProjectLoading] = useState(true)
  const [projectError, setProjectError] = useState<string | null>(null)
  const [projectInfo, setProjectInfo] = useState<ProjectOverview | null>(null)
  const [demoContent, setDemoContent] = useState<DemoContent | null>(null)

  const { username, projectId } = use(params)

  useEffect(() => {
    const updateViewMode = () => {
      const isMobile = window.innerWidth < 768
      setViewMode(isMobile ? "mobile" : "desktop")
    }

    updateViewMode()
    window.addEventListener("resize", updateViewMode)

    return () => window.removeEventListener("resize", updateViewMode)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    setProjectLoading(true)
    setProjectError(null)

    fetchProjectDetail(username, projectId, { signal: controller.signal })
      .then((response) => {
        const data = response?.data
        if (!data) {
          throw new Error("未获取到项目演示信息")
        }

        const overview: ProjectOverview = {
          name: data.name ?? "项目演示",
          description: data.description ?? "",
          tags: Array.isArray(data.tags)
            ? data.tags.filter((tag): tag is string => typeof tag === "string")
            : [],
        }

        const demo: DemoContent = {
          title: data.name ?? "项目演示",
          previewUrl: data.previewUrl || undefined,
          mobilePreviewUrl: data.mobilePreviewUrl || undefined,
          sourceUrl: data.sourceUrl || undefined,
          leftMarkdown: data.leftSidebarMarkdown || undefined,
          rightMarkdown: data.rightSidebarMarkdown || undefined,
        }

        setProjectInfo(overview)
        setDemoContent(demo)
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          if (err.name === "AbortError") return
          setProjectError(err.message || "加载项目演示失败")
        } else {
          setProjectError("加载项目演示失败")
        }
        setProjectInfo(null)
        setDemoContent(null)
      })
      .finally(() => {
        setProjectLoading(false)
      })

    return () => controller.abort()
  }, [username, projectId])

  useEffect(() => {
    const previewForView = getPreviewUrlForView(demoContent, viewMode)

    if (previewForView) {
      setIsLoading(true)
      setError(false)
    } else {
      setIsLoading(false)
      setError(false)
    }
  }, [viewMode, demoContent])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setError(true)
  }

  const refreshDemo = () => {
    const previewForView = getPreviewUrlForView(demoContent, viewMode)

    if (!previewForView) return

    setIsLoading(true)
    setError(false)

    const iframe = document.getElementById("demo-preview-frame") as HTMLIFrameElement | null
    if (iframe) {
      iframe.src = previewForView
    } else {
      setIsLoading(false)
    }
  }

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background relative">
        <div className="fixed inset-0 z-0">
          <BackgroundDecorations />
        </div>

        <HeaderNavigation username={username} />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center max-w-md mx-4 space-y-4">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
            <h1 className="text-xl font-semibold">加载项目演示中...</h1>
            <p className="text-sm text-muted-foreground">
              正在从服务获取最新的项目演示信息，请稍候。
            </p>
          </Card>
        </div>
      </div>
    )
  }

  if (projectError || !projectInfo || !demoContent) {
    return (
      <div className="min-h-screen bg-background relative">
        <div className="fixed inset-0 z-0 overflow-hidden">
          <BackgroundDecorations />
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute top-20 right-20 w-60 h-60 bg-gradient-radial from-blue-400/15 via-purple-400/8 to-transparent rounded-full blur-3xl animate-pulse"
              style={{
                background:
                  "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(168, 85, 247, 0.06) 50%, transparent 100%)",
                animation: "float 8s ease-in-out infinite",
              }}
            />
            <div
              className="absolute bottom-40 left-20 w-80 h-80 bg-gradient-radial from-purple-400/15 via-cyan-400/8 to-transparent rounded-full blur-3xl animate-pulse delay-1000"
              style={{
                background:
                  "radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(34, 211, 238, 0.06) 50%, transparent 100%)",
                animation: "float 10s ease-in-out infinite reverse",
              }}
            />
            <div
              className="absolute top-1/3 right-1/4 w-40 h-40 bg-gradient-radial from-cyan-400/12 via-transparent to-transparent rounded-full blur-2xl animate-pulse"
              style={{
                background:
                  "conic-gradient(from 45deg at 50% 50%, transparent 0deg, rgba(34, 211, 238, 0.08) 90deg, transparent 180deg, rgba(168, 85, 247, 0.08) 270deg, transparent 360deg)",
                animation: "float 12s ease-in-out infinite",
                animationDelay: "2s",
              }}
            />
          </div>
        </div>

        <HeaderNavigation username={username} />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center max-w-md mx-4 space-y-4">
            <h1 className="text-2xl font-bold">项目演示未找到</h1>
            <p className="text-sm text-muted-foreground">
              {projectError ?? "该项目暂时还没有可用的演示。"}
            </p>
            <Link href={`/project/${username}/${projectId}`}>
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回项目详情
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 z-0">
        <BackgroundDecorations />
      </div>

      <HeaderNavigation username={username} />

      <DemoControls
        title={demoContent.title || projectInfo.name}
        username={username}
        projectId={projectId}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={refreshDemo}
        previewUrl={demoContent.previewUrl}
        mobilePreviewUrl={demoContent.mobilePreviewUrl}
        demoType="main"
      />

      <div className="relative z-10 mx-auto px-4 py-6 max-w-[1440px]">
        <div className="flex flex-col items-center">
          <ProjectInfo project={projectInfo} />

          <DemoFrame
            title={demoContent.title || projectInfo.name}
            previewUrl={demoContent.previewUrl}
            mobilePreviewUrl={demoContent.mobilePreviewUrl}
            viewMode={viewMode}
            isLoading={isLoading}
            error={error}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />

          <DemoInfo content={demoContent} />
        </div>
      </div>
    </div>
  )
}
