'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, ChevronUp, ExternalLink, Calendar, BarChart3 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string
    techStack?: string
    projectType?: string
    monthlyPV?: string
    developmentPeriod?: string
    previewImage?: string
    status?: 'active' | 'archived' | 'maintained'
  }
  expandedProjects?: string[]
  onToggleExpand?: (projectId: string) => void
}

export default function ProjectCard({ 
  project, 
  expandedProjects = [], 
  onToggleExpand 
}: ProjectCardProps) {
  const [localExpanded, setLocalExpanded] = useState(false)
  
  // 使用传入的展开状态或本地状态
  const isExpanded = expandedProjects.includes(project.id) || localExpanded
  
  const handleToggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand(project.id)
    } else {
      setLocalExpanded(!localExpanded)
    }
  }

  // 默认图片列表
  const defaultImages = [
    '/Snipaste_2025-08-23_22-52-13.png',
    '/Snipaste_2025-08-23_22-52-25.png'
  ]
  
  // 根据项目ID选择图片
  const imageIndex = parseInt(project.id) % defaultImages.length
  const imageSrc = project.previewImage || defaultImages[imageIndex]

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
      {/* 网站截图 - 现代化设计 */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={imageSrc}
          alt={project.name}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        
        {/* 状态标识 */}
        {project.status === 'active' && (
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 bg-green-500/90 text-white border-0 shadow-sm backdrop-blur-sm"
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5" />
            活跃
          </Badge>
        )}
        {project.status === 'maintained' && (
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 bg-blue-500/90 text-white border-0 shadow-sm backdrop-blur-sm"
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5" />
            维护中
          </Badge>
        )}
        
        {/* 悬浮操作按钮 */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            variant="secondary"
            className="h-7 w-7 p-0 bg-white/90 hover:bg-white border-0 shadow-sm backdrop-blur-sm"
          >
            <ExternalLink className="h-3 w-3 text-gray-700" />
          </Button>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* 项目统计信息 - 带图标的现代设计 */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center space-y-1.5">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-md flex items-center justify-center mx-auto mb-1">
              <BarChart3 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">技术栈</p>
            <p className="font-semibold text-xs text-foreground">{project.techStack || 'Vue + Python'}</p>
          </div>
          <div className="text-center space-y-1.5">
            <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-md flex items-center justify-center mx-auto mb-1">
              <Calendar className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">项目类型</p>
            <p className="font-semibold text-xs text-foreground">{project.projectType || '个人项目'}</p>
          </div>
          <div className="text-center space-y-1.5">
            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/20 rounded-md flex items-center justify-center mx-auto mb-1">
              <BarChart3 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">月PV</p>
            <p className="font-semibold text-xs text-foreground">{project.monthlyPV || '10w'}</p>
          </div>
          <div className="text-center space-y-1.5">
            <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/20 rounded-md flex items-center justify-center mx-auto mb-1">
              <Calendar className="w-3 h-3 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">开发周期</p>
            <p className="font-semibold text-xs text-foreground">{project.developmentPeriod || '3个月'}</p>
          </div>
        </div>

        <Separator className="my-4" />

        {/* 项目标题和简介 */}
        <div className="space-y-3">
          {/* 项目标题 */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
          </div>
          
          {/* 项目简介 */}
          <div className="relative">
            <div 
              className={`text-muted-foreground leading-relaxed transition-all duration-300 ${
                isExpanded ? 'max-h-none' : 'max-h-[3.5rem] overflow-hidden'
              }`}
            >
              <p className="text-xs leading-relaxed">{project.description}</p>
            </div>
            
            {/* 渐变遮罩 */}
            {!isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-card to-transparent" />
            )}
          </div>

          {/* 展开按钮 */}
          <div className="flex justify-center pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleToggleExpand}
              className="text-xs text-muted-foreground hover:text-primary h-7 px-3 transition-colors hover:bg-muted/50"
            >
              {isExpanded ? (
                <>
                  收起
                  <ChevronUp className="w-3 h-3 ml-1" />
                </>
              ) : (
                <>
                  展开阅读
                  <ChevronDown className="w-3 h-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}