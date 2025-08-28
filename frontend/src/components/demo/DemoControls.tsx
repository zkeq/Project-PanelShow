"use client"

import { Button } from "@/components/ui/button"
import { Monitor, Smartphone, ExternalLink, ArrowLeft, RotateCcw } from "lucide-react"
import Link from "next/link"
import { type Project } from "@/app/project/[username]/[projectId]/demo/[demoId]/projects-data"

interface DemoControlsProps {
  project: Project
  username: string
  projectId: string
  viewMode: "desktop" | "mobile"
  onViewModeChange: (mode: "desktop" | "mobile") => void
  onRefresh: () => void
  demoType?: "main" | "feature" // 新增：演示类型
}

export default function DemoControls({
  project,
  username,
  projectId,
  viewMode,
  onViewModeChange,
  onRefresh,
  demoType = "feature", // 默认为功能演示
}: DemoControlsProps) {
  return (
    <div className="sticky top-14 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/project/${username}/${projectId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{project.title}</h1>
              <p className="text-sm text-muted-foreground">
                {demoType === "main" ? "项目首页演示" : "实时演示"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={viewMode === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("desktop")}
                className="h-8"
              >
                <Monitor className="w-4 h-4 mr-1" />
                PC端
              </Button>
              <Button
                variant={viewMode === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("mobile")}
                className="h-8"
              >
                <Smartphone className="w-4 h-4 mr-1" />
                移动端
              </Button>
            </div>

            {/* Refresh Button */}
            <Button variant="outline" size="sm" onClick={onRefresh}>
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
  )
}