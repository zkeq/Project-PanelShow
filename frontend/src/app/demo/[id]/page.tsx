
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Monitor, Smartphone, ExternalLink, ArrowLeft, RotateCcw } from "lucide-react"
import Link from "next/link"
import { projects } from "./projects-data"
import HeaderNavigation from '@/components/layout/HeaderNavigation'
import BackgroundDecorations from '@/components/layout/BackgroundDecorations'
interface DemoPageProps {
  params: {
    id: string
  }
}

export default function DemoPage({ params }: DemoPageProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const username = params.username as string
  const project = projects.find((p) => p.id === Number.parseInt(params.id))

  useEffect(() => {
    setIsLoading(true)
    setError(false)

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [params.id, viewMode])

  if (!project) {
    return (
    
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}


        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">项目未找到</h1>
          <p className="text-sm text-muted-foreground">请求的项目演示未找到。</p>
          <Link href="/project/zkeq">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </Link>
        </Card>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}      
      <HeaderNavigation username={username} />

          <BackgroundDecorations />
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/project/zkeq`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{project.title}</h1>
                <p className="text-sm text-muted-foreground">实时演示</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                <Button
                  variant={viewMode === "desktop" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("desktop")}
                  className="h-8"
                >
                  <Monitor className="w-4 h-4 mr-1" />
                  PC端
                </Button>
                <Button
                  variant={viewMode === "mobile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("mobile")}
                  className="h-8"
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  移动端
                </Button>
              </div>

              {/* Refresh Button */}
              <Button variant="outline" size="sm" onClick={refreshDemo}>
                <RotateCcw className="w-4 h-4" />
              </Button>

              {/* External Link */}
              <Button variant="outline" size="sm" asChild>
                <a href={project.embedUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center">
          {/* Project Info */}
          <div className="w-full max-w-6xl mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {project.technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
            <p className="text-muted-foreground">{project.description}</p>
          </div>

          {/* Demo Frame */}
          <div className="relative">
            <div
              className={`
                relative bg-white rounded-lg shadow-2xl overflow-hidden border
                ${
                  viewMode === "desktop"
                    ? "w-[1200px] h-[800px] max-w-[95vw] max-h-[70vh]"
                    : "w-[375px] h-[667px] max-w-[90vw] max-h-[70vh]"
                }
                transition-all duration-500 ease-in-out
              `}
            >
              {/* Loading State */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">加载演示中...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                      <ExternalLink className="w-6 h-6 text-destructive" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">无法在 iframe 中加载演示</p>
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.embedUrl} target="_blank" rel="noopener noreferrer">
                        在新标签页中打开
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Iframe */}
              {project.allowIframe && (
                <iframe
                  src={project.embedUrl}
                  className="w-full h-full border-0"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  title={`${project.title} Demo`}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
              )}

              {/* Mobile Frame Decoration */}
              {viewMode === "mobile" && (
                <>
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>
                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full z-20"></div>
                </>
              )}
            </div>

            {/* Device Label */}
            <div className="text-center mt-4">
              <Badge variant="outline" className="text-xs">
                {viewMode === "desktop" ? "PC端 (1200×800)" : "移动端 (375×667)"}
              </Badge>
            </div>
          </div>

          {/* Additional Info */}
          <div className="w-full max-w-6xl mt-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">演示信息</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">展示功能</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 跨设备响应式设计</li>
                    <li>• 交互式用户界面</li>
                    <li>• 实时功能</li>
                    <li>• 现代网络技术</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">技术栈</h4>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
