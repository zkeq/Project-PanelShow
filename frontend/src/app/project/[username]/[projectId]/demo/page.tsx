"use client"

import { useState, useEffect, use } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { projects } from "./[demoId]/projects-data"
import HeaderNavigation from '@/components/layout/HeaderNavigation'
import BackgroundDecorations from '@/components/layout/BackgroundDecorations'
import DemoControls from '@/components/demo/DemoControls'
import DemoFrame from '@/components/demo/DemoFrame'
import ProjectInfo from '@/components/demo/ProjectInfo'
import DemoInfo from '@/components/demo/DemoInfo'

interface DemoPageProps {
  params: Promise<{
    username: string
    projectId: string
  }>
}

export default function ProjectMainDemoPage({ params }: DemoPageProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  
  // Unwrap params using React.use()
  const { username, projectId } = use(params)
  
  // Get the main project demo (first one or a default)
  const project = projects[0] // 使用第一个项目作为主演示

  useEffect(() => {
    setIsLoading(true)
    setError(false)

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [viewMode])

  if (!project) {
    return (
      <div className="min-h-screen bg-background relative">
        {/* Fixed Background Decorations */}
        <div className="fixed inset-0 z-0">
          <BackgroundDecorations />
        </div>
        
        {/* Header Navigation */}
        <HeaderNavigation username={username} />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center max-w-md mx-4">
            <h1 className="text-2xl font-bold mb-4">项目演示未找到</h1>
            <p className="text-sm text-muted-foreground mb-6">该项目暂时还没有可用的演示。</p>
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

  const handleIframeLoad = () => {
    setIsLoading(false)
    setError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setError(true)
  }

  const refreshDemo = () => {
    setIsLoading(true)
    setError(false)
    // Force iframe reload by changing key
    const iframe = document.querySelector("iframe") as HTMLIFrameElement
    if (iframe) {
      iframe.src = iframe.src
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Fixed Background Decorations */}
      <div className="fixed inset-0 z-0">
        <BackgroundDecorations />
      </div>
      
      {/* Header Navigation */}
      <HeaderNavigation username={username} />

      {/* Demo Controls */}
      <DemoControls
        project={project}
        username={username}
        projectId={projectId}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={refreshDemo}
        demoType="main"
      />

      {/* Demo Content */}
      <div className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex flex-col items-center">
          {/* Project Info */}
          <ProjectInfo project={project} />

          {/* Demo Frame */}
          <DemoFrame
            project={project}
            viewMode={viewMode}
            isLoading={isLoading}
            error={error}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />

          {/* Demo Info */}
          <DemoInfo project={project} />
        </div>
      </div>
    </div>
  )
}