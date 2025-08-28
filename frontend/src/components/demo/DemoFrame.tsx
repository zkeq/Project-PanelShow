"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import { type Project } from "@/app/project/[username]/[projectId]/demo/[demoId]/projects-data"

interface DemoFrameProps {
  project: Project
  viewMode: "desktop" | "mobile"
  isLoading: boolean
  error: boolean
  onLoad: () => void
  onError: () => void
}

export default function DemoFrame({
  project,
  viewMode,
  isLoading,
  error,
  onLoad,
  onError,
}: DemoFrameProps) {
  return (
    <div className="relative">
      <div
        className={`
          relative bg-white rounded-lg shadow-2xl overflow-hidden border
          ${
            viewMode === "desktop"
              ? "w-[1440px] h-[900px] max-w-[95vw] max-h-[82vh]"
              : "w-[390px] h-[844px] max-w-[90vw] max-h-[82vh]"
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
            onLoad={onLoad}
            onError={onError}
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
          {viewMode === "desktop" ? "PC端 (1440×900)" : "移动端 (390×844)"}
        </Badge>
      </div>
    </div>
  )
}