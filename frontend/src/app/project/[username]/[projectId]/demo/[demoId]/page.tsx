"use client"

import { useState, useEffect, use } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { projects, type Project } from "./projects-data"
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
    demoId: string
  }>
}

export default function ProjectDemoPage({ params }: DemoPageProps) {
  // 检测屏幕尺寸，移动端默认显示移动端视图
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("mobile")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  
  // Unwrap params using React.use()
  const { username, projectId, demoId } = use(params)
  const project = projects.find((p: Project) => p.id === Number.parseInt(demoId))

  // 根据屏幕尺寸设置默认视图模式
  useEffect(() => {
    const updateViewMode = () => {
      const isMobile = window.innerWidth < 768
      setViewMode(isMobile ? "mobile" : "desktop")
    }
    
    // 初始设置
    updateViewMode()
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateViewMode)
    
    return () => window.removeEventListener('resize', updateViewMode)
  }, [])

  useEffect(() => {
    setIsLoading(true)
    setError(false)

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [demoId, viewMode])

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
            <p className="text-sm text-muted-foreground mb-6">请求的项目演示未找到。</p>
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
      {/* Fixed Background Decorations with Enhanced Light Halos */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <BackgroundDecorations />
        {/* Additional floating light effects for demo pages */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-60 h-60 bg-gradient-radial from-blue-400/15 via-purple-400/8 to-transparent rounded-full blur-3xl animate-pulse" 
               style={{ 
                 background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(168, 85, 247, 0.06) 50%, transparent 100%)',
                 animation: 'float 8s ease-in-out infinite' 
               }} />
          <div className="absolute bottom-40 left-20 w-80 h-80 bg-gradient-radial from-purple-400/15 via-cyan-400/8 to-transparent rounded-full blur-3xl animate-pulse delay-1000" 
               style={{ 
                 background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(34, 211, 238, 0.06) 50%, transparent 100%)',
                 animation: 'float 10s ease-in-out infinite reverse' 
               }} />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-gradient-radial from-cyan-400/12 via-transparent to-transparent rounded-full blur-2xl animate-pulse" 
               style={{ 
                 background: 'conic-gradient(from 45deg at 50% 50%, transparent 0deg, rgba(34, 211, 238, 0.08) 90deg, transparent 180deg, rgba(168, 85, 247, 0.08) 270deg, transparent 360deg)',
                 animation: 'float 12s ease-in-out infinite',
                 animationDelay: '2s' 
               }} />
        </div>
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
      />

      {/* Demo Content */}
      <div className="relative z-10 mx-auto px-4 py-6 max-w-[1440px]">
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